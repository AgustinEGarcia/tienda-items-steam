import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isAuthenticatedAdmin } from '@/lib/auth/session';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAuthenticatedAdmin();
    if (!isAuth) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión de administrador' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'ID de cuenta no especificado' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // Obtener la cuenta para conocer su steam_id antes de borrar
    const { data: account } = await supabase
      .from('accounts')
      .select('steam_id')
      .eq('id', id)
      .maybeSingle();

    // Borrar la cuenta
    const { error: deleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar cuenta en Supabase:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar la cuenta de la base de datos' },
        { status: 500 }
      );
    }

    // Purgar también su entrada de caché si existía
    if (account?.steam_id) {
      await supabase
        .from('inventory_cache')
        .delete()
        .eq('steam_id', account.steam_id);
    }

    return NextResponse.json({
      success: true,
      message: 'Cuenta y caché eliminadas exitosamente',
    });
  } catch (err) {
    console.error('Error en DELETE /api/accounts/[id]:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
