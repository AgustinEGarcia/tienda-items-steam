import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isAuthenticatedAdmin } from '@/lib/auth/session';
import { cleanSteamId64 } from '@/lib/domain/steamId';
import { env } from '@/lib/env';

const createAccountSchema = z.object({
  steam_id: z.string().min(1, 'El SteamID64 es requerido'),
  alias: z
    .string()
    .trim()
    .min(1, 'El alias es requerido')
    .max(50, 'El alias no puede superar los 50 caracteres'),
});

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error al obtener cuentas de Supabase:', error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Error interno al obtener cuentas:', err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const isAuth = await isAuthenticatedAdmin();
    if (!isAuth) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión de administrador' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createAccountSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const cleanedSteamId = cleanSteamId64(parsed.data.steam_id);
    if (!cleanedSteamId) {
      return NextResponse.json(
        {
          error:
            'SteamID64 inválido. Debe contener exactamente 17 dígitos (ej. 76561198...) o ser una URL de perfil válida.',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Comprobar límite de cuentas (máximo 5)
    const { count, error: countError } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error al verificar cantidad de cuentas:', countError);
    }

    if (typeof count === 'number' && count >= env.MAX_MANAGED_ACCOUNTS) {
      return NextResponse.json(
        {
          error: `Se ha alcanzado el límite máximo de ${env.MAX_MANAGED_ACCOUNTS} cuentas vinculadas permitidas.`,
        },
        { status: 400 }
      );
    }

    // Insertar cuenta
    const { data, error: insertError } = await supabase
      .from('accounts')
      .insert({
        steam_id: cleanedSteamId,
        alias: parsed.data.alias,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        // Unique violation
        return NextResponse.json(
          { error: 'Este SteamID64 ya se encuentra registrado en el sistema' },
          { status: 409 }
        );
      }
      console.error('Error al insertar cuenta:', insertError);
      return NextResponse.json(
        { error: 'Error al registrar la cuenta en la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Error procesando POST /api/accounts:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
