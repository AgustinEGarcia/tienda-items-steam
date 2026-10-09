import { describe, it, expect } from 'vitest';
import {
  isCacheExpired,
  calculateExpirationDate,
  getRemainingTtlSeconds,
} from './cacheTtl';

describe('isCacheExpired', () => {
  it('debe retornar true si la fecha de expiración es anterior al momento actual', () => {
    const pastDate = new Date(Date.now() - 1000 * 60).toISOString(); // 1 minuto en el pasado
    expect(isCacheExpired(pastDate)).toBe(true);
  });

  it('debe retornar false si la fecha de expiración está en el futuro', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hora en el futuro
    expect(isCacheExpired(futureDate)).toBe(false);
  });

  it('debe aceptar objetos Date además de strings ISO', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 30);
    expect(isCacheExpired(futureDate)).toBe(false);
  });

  it('debe retornar true si la fecha es inválida, nula o indefinida por seguridad', () => {
    expect(isCacheExpired(null)).toBe(true);
    expect(isCacheExpired(undefined)).toBe(true);
    expect(isCacheExpired('fecha-invalida')).toBe(true);
  });

  it('debe permitir inyectar una fecha actual de referencia para tests deterministas', () => {
    const refNow = new Date('2026-10-09T12:00:00Z');
    const earlier = new Date('2026-10-09T11:59:59Z');
    const later = new Date('2026-10-09T12:00:01Z');

    expect(isCacheExpired(earlier, refNow)).toBe(true);
    expect(isCacheExpired(later, refNow)).toBe(false);
  });
});

describe('calculateExpirationDate', () => {
  it('debe calcular la fecha ISO sumando los minutos indicados', () => {
    const baseDate = new Date('2026-10-09T12:00:00.000Z');
    const expiresAt = calculateExpirationDate(60, baseDate);
    expect(expiresAt).toBe('2026-10-09T13:00:00.000Z');
  });

  it('debe usar 60 minutos por defecto si no se especifican', () => {
    const baseDate = new Date('2026-10-09T10:00:00.000Z');
    const expiresAt = calculateExpirationDate(undefined, baseDate);
    expect(expiresAt).toBe('2026-10-09T11:00:00.000Z');
  });
});

describe('getRemainingTtlSeconds', () => {
  it('debe devolver la cantidad de segundos restantes hasta la expiración', () => {
    const baseNow = new Date('2026-10-09T12:00:00.000Z');
    const expiresAt = new Date('2026-10-09T12:05:00.000Z'); // 5 minutos = 300 segundos

    expect(getRemainingTtlSeconds(expiresAt, baseNow)).toBe(300);
  });

  it('debe devolver 0 si la fecha ya expiró o es inválida', () => {
    const baseNow = new Date('2026-10-09T12:00:00.000Z');
    const pastDate = new Date('2026-10-09T11:50:00.000Z');

    expect(getRemainingTtlSeconds(pastDate, baseNow)).toBe(0);
    expect(getRemainingTtlSeconds('invalido', baseNow)).toBe(0);
  });
});
