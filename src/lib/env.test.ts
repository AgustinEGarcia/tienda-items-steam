import { describe, it, expect } from 'vitest';
import { parseEnv } from './env';

describe('parseEnv', () => {
  it('debe parsear variables válidas y aplicar valores por defecto', () => {
    const validConfig = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
      ADMIN_PASSWORD: 'password123',
    };

    const result = parseEnv(validConfig);
    expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
    expect(result.ADMIN_PASSWORD).toBe('password123');
    expect(result.DEFAULT_APP_ID).toBe(730);
    expect(result.MAX_MANAGED_ACCOUNTS).toBe(5);
    expect(result.STEAM_PRICE_DELAY_MS).toBe(2500);
  });

  it('debe fallar si NEXT_PUBLIC_SUPABASE_URL no es una URL válida', () => {
    const invalidConfig = {
      NEXT_PUBLIC_SUPABASE_URL: 'no-es-una-url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
      ADMIN_PASSWORD: 'password123',
    };

    expect(() => parseEnv(invalidConfig)).toThrowError(/debe ser una URL válida/);
  });

  it('debe fallar si ADMIN_PASSWORD tiene menos de 4 caracteres', () => {
    const invalidConfig = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
      ADMIN_PASSWORD: '12',
    };

    expect(() => parseEnv(invalidConfig)).toThrowError(/al menos 4 caracteres/);
  });

  it('debe aceptar SUPABASE_URL y SUPABASE_ANON_KEY como alias', () => {
    const aliasConfig = {
      SUPABASE_URL: 'https://test-alias.supabase.co',
      SUPABASE_ANON_KEY: 'test-alias-key',
      ADMIN_PASSWORD: 'password123',
    };

    const result = parseEnv(aliasConfig);
    expect(result.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test-alias.supabase.co');
    expect(result.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-alias-key');
  });
});

