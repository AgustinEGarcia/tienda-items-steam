import { describe, it, expect } from 'vitest';
import {
  createAdminSessionToken,
  verifyAdminSessionToken,
} from './session';

describe('Admin Session Tokens', () => {
  const secret = 'super-test-secret-key-1234567890!';

  it('debe generar y verificar un token de sesión válido', () => {
    const token = createAdminSessionToken(secret, 3600);
    expect(typeof token).toBe('string');
    expect(token).toContain('.');

    const isValid = verifyAdminSessionToken(token, secret);
    expect(isValid).toBe(true);
  });

  it('debe rechazar un token si la firma fue alterada', () => {
    const token = createAdminSessionToken(secret, 3600);
    const tampered = token.slice(0, -4) + 'abcd';
    expect(verifyAdminSessionToken(tampered, secret)).toBe(false);
  });

  it('debe rechazar un token firmado con un secreto diferente', () => {
    const token = createAdminSessionToken('secreto-a', 3600);
    expect(verifyAdminSessionToken(token, 'secreto-b')).toBe(false);
  });

  it('debe rechazar un token expirado', () => {
    // Expiración negativa (-10 segundos)
    const expiredToken = createAdminSessionToken(secret, -10);
    expect(verifyAdminSessionToken(expiredToken, secret)).toBe(false);
  });

  it('debe rechazar tokens malformados o nulos', () => {
    expect(verifyAdminSessionToken(null, secret)).toBe(false);
    expect(verifyAdminSessionToken(undefined, secret)).toBe(false);
    expect(verifyAdminSessionToken('sin-punto-ni-firma', secret)).toBe(false);
  });
});
