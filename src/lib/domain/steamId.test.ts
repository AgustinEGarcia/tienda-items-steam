import { describe, it, expect } from 'vitest';
import { isValidSteamId64, cleanSteamId64 } from './steamId';

describe('isValidSteamId64', () => {
  it('debe aceptar un SteamID64 válido de 17 dígitos numéricos estándar', () => {
    expect(isValidSteamId64('76561198000000000')).toBe(true);
    expect(isValidSteamId64('76561197960287930')).toBe(true);
  });

  it('debe rechazar si no tiene exactamente 17 dígitos', () => {
    expect(isValidSteamId64('7656119800000000')).toBe(false); // 16 dígitos
    expect(isValidSteamId64('765611980000000000')).toBe(false); // 18 dígitos
    expect(isValidSteamId64('')).toBe(false);
  });

  it('debe rechazar si contiene caracteres no numéricos o espacios', () => {
    expect(isValidSteamId64('7656119800000000a')).toBe(false);
    expect(isValidSteamId64('76561198 00000000')).toBe(false);
    expect(isValidSteamId64('76561198-00000000')).toBe(false);
    expect(isValidSteamId64('DROP TABLE accounts;')).toBe(false);
  });

  it('debe rechazar si no comienza con el prefijo comunitario estándar de Steam (765611...)', () => {
    expect(isValidSteamId64('12345678901234567')).toBe(false);
    expect(isValidSteamId64('99999999999999999')).toBe(false);
  });

  it('debe rechazar tipos no string o nulos con seguridad', () => {
    expect(isValidSteamId64(null)).toBe(false);
    expect(isValidSteamId64(undefined)).toBe(false);
    expect(isValidSteamId64(123456789)).toBe(false);
  });
});

describe('cleanSteamId64', () => {
  it('debe extraer el SteamID64 si se ingresa con espacios en blanco a los costados', () => {
    expect(cleanSteamId64('  76561198000000000  ')).toBe('76561198000000000');
  });

  it('debe extraer el SteamID64 si el usuario pega la URL completa de perfil de Steam', () => {
    expect(cleanSteamId64('https://steamcommunity.com/profiles/76561198000000000')).toBe('76561198000000000');
    expect(cleanSteamId64('https://steamcommunity.com/profiles/76561198000000000/')).toBe('76561198000000000');
  });

  it('debe retornar null si no se puede extraer un SteamID64 válido', () => {
    expect(cleanSteamId64('https://steamcommunity.com/id/customurl')).toBe(null);
    expect(cleanSteamId64('invalido')).toBe(null);
  });
});
