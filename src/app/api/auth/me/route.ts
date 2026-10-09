import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth/session';

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  return NextResponse.json(
    { authenticated: isAuth, role: isAuth ? 'admin' : null },
    { status: 200 }
  );
}
