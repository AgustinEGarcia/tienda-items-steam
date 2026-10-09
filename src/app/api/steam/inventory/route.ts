import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isValidSteamId64 } from '@/lib/domain/steamId';
import { parseSteamInventory } from '@/lib/domain/inventoryParser';
import { isCacheExpired, calculateExpirationDate } from '@/lib/domain/cacheTtl';
import { fetchRawSteamInventory } from '@/lib/steam/steamClient';
import { env } from '@/lib/env';
import { Json } from '@/types/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamId');
    const force = searchParams.get('force') === 'true';

    if (!steamId || !isValidSteamId64(steamId)) {
      return NextResponse.json(
        { error: 'SteamID64 inválido o faltante (debe tener 17 dígitos numéricos)' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // 1. Obtener alias de la cuenta si está registrada
    const { data: accountData } = await supabase
      .from('accounts')
      .select('alias')
      .eq('steam_id', steamId)
      .maybeSingle();

    const accountAlias = accountData?.alias || 'Cuenta Steam';

    // 2. Verificar caché en Supabase si no se solicitó forzar actualización
    const { data: cachedInventory } = await supabase
      .from('inventory_cache')
      .select('*')
      .eq('steam_id', steamId)
      .maybeSingle();

    if (!force && cachedInventory && !isCacheExpired(cachedInventory.expires_at)) {
      return NextResponse.json({
        steam_id: steamId,
        alias: accountAlias,
        is_private: cachedInventory.is_private,
        item_count: cachedInventory.item_count,
        from_cache: true,
        expires_at: cachedInventory.expires_at,
        items: cachedInventory.items,
      });
    }

    // 3. Obtener configuración vigente (AppID, ContextID, TTL)
    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    const appId = settingsData?.app_id || env.DEFAULT_APP_ID;
    const contextId = settingsData?.context_id || env.DEFAULT_CONTEXT_ID;
    const cacheTtlMinutes =
      settingsData?.cache_ttl_minutes || env.STEAM_CACHE_TTL_MINUTES;

    // 4. Invocar endpoint público de Steam
    const steamResult = await fetchRawSteamInventory(steamId, appId, contextId);

    // Caso A: Rate limit excedido de Steam (HTTP 429)
    if (steamResult.isRateLimited) {
      if (cachedInventory) {
        return NextResponse.json({
          steam_id: steamId,
          alias: accountAlias,
          is_private: cachedInventory.is_private,
          item_count: cachedInventory.item_count,
          from_cache: true,
          expires_at: cachedInventory.expires_at,
          items: cachedInventory.items,
          warning: 'Steam Rate Limit excedido. Mostrando datos cacheados previos.',
        });
      }

      return NextResponse.json(
        {
          error:
            'Steam está temporalmente saturado (HTTP 429). Por favor aguarda unos instantes antes de reintentar.',
          is_rate_limited: true,
        },
        { status: 429 }
      );
    }

    // Caso B: Perfil o inventario privado
    if (steamResult.isPrivate) {
      const privateTtlExpires = calculateExpirationDate(15); // Guardar en caché 15 min para evitar llamadas repetidas
      await supabase.from('inventory_cache').upsert({
        steam_id: steamId,
        items: [] as unknown as Json,
        item_count: 0,
        is_private: true,
        expires_at: privateTtlExpires,
        updated_at: new Date().toISOString(),
      });

      return NextResponse.json({
        steam_id: steamId,
        alias: accountAlias,
        is_private: true,
        item_count: 0,
        from_cache: false,
        items: [],
        message: 'El perfil o inventario de esta cuenta es privado en Steam.',
      });
    }

    // Caso C: Error no controlado de Steam
    if (!steamResult.success || !steamResult.data) {
      if (cachedInventory) {
        return NextResponse.json({
          steam_id: steamId,
          alias: accountAlias,
          is_private: cachedInventory.is_private,
          item_count: cachedInventory.item_count,
          from_cache: true,
          expires_at: cachedInventory.expires_at,
          items: cachedInventory.items,
          warning: 'Fallo temporal al conectar con Steam. Se presentan datos en caché.',
        });
      }

      return NextResponse.json(
        { error: steamResult.error || 'No se pudo obtener el inventario desde Steam' },
        { status: 502 }
      );
    }

    // Caso D: Inventario obtenido exitosamente
    const parsedItems = parseSteamInventory(steamResult.data, {
      steamId,
      alias: accountAlias,
    });

    const expiresAt = calculateExpirationDate(cacheTtlMinutes);

    await supabase.from('inventory_cache').upsert({
      steam_id: steamId,
      items: parsedItems as unknown as Json,
      item_count: parsedItems.length,
      is_private: false,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      steam_id: steamId,
      alias: accountAlias,
      is_private: false,
      item_count: parsedItems.length,
      from_cache: false,
      expires_at: expiresAt,
      items: parsedItems,
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest: string }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('NEXT_')
    ) {
      throw err;
    }
    console.error('Error no controlado en GET /api/steam/inventory:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el inventario' },
      { status: 500 }
    );
  }
}
