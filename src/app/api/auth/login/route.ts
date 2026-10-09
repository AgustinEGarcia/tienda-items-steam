import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { createAdminSessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth/session';

const loginSchema = z.object({
  password: z.string().min(1, 'La contraseña es requerida'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de inicio de sesión inválidos' },
        { status: 400 }
      );
    }

    if (parsed.data.password !== env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Contraseña de administrador incorrecta' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();

    const response = NextResponse.json(
      { success: true, message: 'Autenticación exitosa' },
      { status: 200 }
    );

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la autenticación' },
      { status: 500 }
    );
  }
}
