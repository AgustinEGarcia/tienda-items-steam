import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isAuthenticatedAdmin } from '@/lib/auth/session';
import { env } from '@/lib/env';

const updateSettingsSchema = z.object({
  dolar_ars_rate: z.number().positive('La cotización del dólar debe ser un número positivo'),
  app_id: z.number().int().positive().optional(),
  context_id: z.number().int().positive().optional(),
  cache_ttl_minutes: z.number().int().positive().optional(),
});

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      // Fallback a configuración por defecto segura
      return NextResponse.json({
        id: 1,
        dolar_ars_rate: 1250.0,
        app_id: env.DEFAULT_APP_ID,
        context_id: env.DEFAULT_CONTEXT_ID,
        cache_ttl_minutes: env.STEAM_CACHE_TTL_MINUTES,
        is_fallback: true,
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error al obtener configuración:', err);
    return NextResponse.json(
      {
        id: 1,
        dolar_ars_rate: 1250.0,
        app_id: env.DEFAULT_APP_ID,
        context_id: env.DEFAULT_CONTEXT_ID,
        cache_ttl_minutes: env.STEAM_CACHE_TTL_MINUTES,
        is_fallback: true,
      },
      { status: 200 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const isAuth = await isAuthenticatedAdmin();
    if (!isAuth) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión de administrador' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const updatePayload = {
      id: 1,
      dolar_ars_rate: parsed.data.dolar_ars_rate,
      ...(parsed.data.app_id && { app_id: parsed.data.app_id }),
      ...(parsed.data.context_id && { context_id: parsed.data.context_id }),
      ...(parsed.data.cache_ttl_minutes && {
        cache_ttl_minutes: parsed.data.cache_ttl_minutes,
      }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('settings')
      .upsert(updatePayload)
      .select()
      .single();

    if (error) {
      console.error('Error al persistir configuración en Supabase:', error);
      return NextResponse.json(
        { error: 'Error al actualizar configuración en la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error procesando actualización de settings:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
