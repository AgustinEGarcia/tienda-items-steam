import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isCacheExpired, calculateExpirationDate } from '@/lib/domain/cacheTtl';
import { fetchSteamMarketPrice } from '@/lib/steam/priceQueue';
import { env } from '@/lib/env';
import { Json } from '@/types/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marketHashName = searchParams.get('marketHashName');

    if (!marketHashName || marketHashName.trim() === '') {
      return NextResponse.json(
        { error: 'El parámetro marketHashName es requerido' },
        { status: 400 }
      );
    }

    const trimmedName = marketHashName.trim();
    const supabase = getSupabaseServerClient();

    // 1. Revisar si el precio existe en caché y sigue vigente
    const { data: cachedPrice } = await supabase
      .from('price_cache')
      .select('*')
      .eq('market_hash_name', trimmedName)
      .maybeSingle();

    if (cachedPrice && !isCacheExpired(cachedPrice.expires_at)) {
      return NextResponse.json({
        market_hash_name: trimmedName,
        price_usd: cachedPrice.price_usd,
        from_cache: true,
        expires_at: cachedPrice.expires_at,
      });
    }

    // 2. Obtener configuración de AppID y TTL
    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    const appId = settingsData?.app_id || env.DEFAULT_APP_ID;
    const cacheTtlMinutes =
      settingsData?.cache_ttl_minutes || env.STEAM_CACHE_TTL_MINUTES;

    // 3. Consultar a Steam a través de la cola con rate-limiting
    const result = await fetchSteamMarketPrice(trimmedName, appId);

    // Caso A: Rate limit de Steam
    if (result.isRateLimited) {
      if (cachedPrice) {
        return NextResponse.json({
          market_hash_name: trimmedName,
          price_usd: cachedPrice.price_usd,
          from_cache: true,
          expires_at: cachedPrice.expires_at,
          warning: 'Steam Rate Limit activo. Mostrando último precio en caché.',
        });
      }

      return NextResponse.json(
        {
          market_hash_name: trimmedName,
          price_usd: null,
          is_rate_limited: true,
          warning: 'Steam Market se encuentra temporalmente limitado.',
        },
        { status: 429 }
      );
    }

    // Caso B: Fallo no controlado
    if (!result.success) {
      if (cachedPrice) {
        return NextResponse.json({
          market_hash_name: trimmedName,
          price_usd: cachedPrice.price_usd,
          from_cache: true,
          expires_at: cachedPrice.expires_at,
          warning: 'Fallo al actualizar precio en Steam. Mostrando última caché.',
        });
      }

      return NextResponse.json(
        {
          market_hash_name: trimmedName,
          price_usd: null,
          error: result.error || 'No se pudo obtener el precio',
        },
        { status: 502 }
      );
    }

    // Caso C: Éxito en la consulta
    const expiresAt = calculateExpirationDate(cacheTtlMinutes);

    await supabase.from('price_cache').upsert({
      market_hash_name: trimmedName,
      price_usd: result.priceUsd,
      raw_response: (result.raw || null) as unknown as Json,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      market_hash_name: trimmedName,
      price_usd: result.priceUsd,
      from_cache: false,
      expires_at: expiresAt,
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

    console.error('Error no controlado en GET /api/steam/price:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el precio' },
      { status: 500 }
    );
  }
}
