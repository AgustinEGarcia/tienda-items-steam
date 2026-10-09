import { describe, it, expect } from 'vitest';
import { cleanSupabaseUrl } from './urlHelper';

describe('cleanSupabaseUrl', () => {
  it('mantiene intacta una URL limpia de Supabase', () => {
    expect(cleanSupabaseUrl('https://xyzproject.supabase.co')).toBe('https://xyzproject.supabase.co');
  });

  it('elimina barras diagonales al final', () => {
    expect(cleanSupabaseUrl('https://xyzproject.supabase.co/')).toBe('https://xyzproject.supabase.co');
    expect(cleanSupabaseUrl('https://xyzproject.supabase.co///')).toBe('https://xyzproject.supabase.co');
  });

  it('elimina /rest/v1 o /auth/v1 si fue copiado por error', () => {
    expect(cleanSupabaseUrl('https://xyzproject.supabase.co/rest/v1')).toBe('https://xyzproject.supabase.co');
    expect(cleanSupabaseUrl('https://xyzproject.supabase.co/rest/v1/')).toBe('https://xyzproject.supabase.co');
    expect(cleanSupabaseUrl('https://xyzproject.supabase.co/auth/v1')).toBe('https://xyzproject.supabase.co');
  });

  it('convierte la URL del dashboard de Supabase a la URL directa del proyecto', () => {
    expect(
      cleanSupabaseUrl('https://supabase.com/dashboard/project/abcdefghijklmn')
    ).toBe('https://abcdefghijklmn.supabase.co');
    expect(
      cleanSupabaseUrl('https://supabase.com/dashboard/project/abcdefghijklmn/sql/new')
    ).toBe('https://abcdefghijklmn.supabase.co');
  });
});
