import { describe, it, expect } from 'vitest';
import {
  parseSteamPriceString,
  calculateArsPrice,
  formatCurrency,
} from './currency';

describe('parseSteamPriceString', () => {
  it('debe parsear precios estándar en dólares de Steam', () => {
    expect(parseSteamPriceString('$1.25')).toBe(1.25);
    expect(parseSteamPriceString('$0.03')).toBe(0.03);
    expect(parseSteamPriceString('$1250.50')).toBe(1250.5);
    expect(parseSteamPriceString('$1,250.50')).toBe(1250.5);
    expect(parseSteamPriceString('$1,250.50 USD')).toBe(1250.5);
  });

  it('debe manejar formatos con coma decimal o espacios', () => {
    expect(parseSteamPriceString('12,50$')).toBe(12.5);
    expect(parseSteamPriceString('  $ 45.99  ')).toBe(45.99);
  });

  it('debe retornar null para cadenas sin precio, nulas o no numéricas', () => {
    expect(parseSteamPriceString(null)).toBe(null);
    expect(parseSteamPriceString(undefined)).toBe(null);
    expect(parseSteamPriceString('')).toBe(null);
    expect(parseSteamPriceString('No disponible')).toBe(null);
  });
});

describe('calculateArsPrice', () => {
  it('debe calcular correctamente la cotización de USD a ARS sin errores de coma flotante', () => {
    // 0.1 * 1250 = 125
    expect(calculateArsPrice(0.1, 1250)).toBe(125);
    // 1.25 * 1250 = 1562.5
    expect(calculateArsPrice(1.25, 1250)).toBe(1562.5);
    // 0.03 * 1320.55 = 39.6165 -> redondeado a 39.62
    expect(calculateArsPrice(0.03, 1320.55)).toBe(39.62);
  });

  it('debe retornar 0 si el precio en USD es 0 o negativo', () => {
    expect(calculateArsPrice(0, 1250)).toBe(0);
    expect(calculateArsPrice(-5, 1250)).toBe(0);
  });

  it('debe manejar cotizaciones cero o negativas devolviendo 0', () => {
    expect(calculateArsPrice(10, 0)).toBe(0);
    expect(calculateArsPrice(10, -100)).toBe(0);
  });

  it('debe retornar null si el precio USD de entrada es null o undefined', () => {
    expect(calculateArsPrice(null, 1250)).toBe(null);
    expect(calculateArsPrice(undefined, 1250)).toBe(null);
  });
});

describe('formatCurrency', () => {
  it('debe formatear valores en USD', () => {
    expect(formatCurrency(12.5, 'USD')).toContain('12.50');
    expect(formatCurrency(0, 'USD')).toContain('0.00');
    expect(formatCurrency(null, 'USD')).toBe('—');
  });

  it('debe formatear valores en ARS', () => {
    const formatted = formatCurrency(1562.5, 'ARS');
    expect(formatted).toContain('1.562,50');
    expect(formatCurrency(null, 'ARS')).toBe('—');
  });
});
