import { describe, it, expect, vi } from 'vitest';
import { isCacheExpired, calculateExpirationDate } from '../domain/cacheTtl';
import { parseSteamInventory } from '../domain/inventoryParser';

describe('Prueba de Integración: Caché y Tolerancia a Fallos de Steam', () => {
  it('debe servir datos de caché si la fecha de expiración no ha vencido', () => {
    const cachedExpiresAt = calculateExpirationDate(60); // 60 min en el futuro
    expect(isCacheExpired(cachedExpiresAt)).toBe(false);
  });

  it('debe detectar correctamente si la caché ha expirado para refrescar datos', () => {
    const pastExpiresAt = new Date(Date.now() - 5000).toISOString(); // 5 seg en el pasado
    expect(isCacheExpired(pastExpiresAt)).toBe(true);
  });

  it('debe procesar un inventario y calcular fechas de TTL coherentes', () => {
    const samplePayload = {
      assets: [{ assetid: '1', classid: '10', instanceid: '0', amount: '1' }],
      descriptions: [
        {
          classid: '10',
          instanceid: '0',
          market_hash_name: 'AK-47 | Slate (Field-Tested)',
          name: 'AK-47 | Slate',
          type: 'Fusil',
          icon_url: 'slate-icon',
          tradable: 1,
          marketable: 1,
        },
      ],
    };

    const items = parseSteamInventory(samplePayload, {
      steamId: '76561198000000000',
      alias: 'Test Account',
    });

    expect(items).toHaveLength(1);
    expect(items[0].market_hash_name).toBe('AK-47 | Slate (Field-Tested)');
    expect(items[0].account_alias).toBe('Test Account');

    const ttlDate = calculateExpirationDate(60);
    expect(new Date(ttlDate).getTime()).toBeGreaterThan(Date.now());
  });

  it('debe asignar TTL de 15 minutos preventivo para perfiles privados', () => {
    const privateTtl = calculateExpirationDate(15);
    const dateDiff = new Date(privateTtl).getTime() - Date.now();
    // 15 minutos en ms aprox ~900.000 ms
    expect(dateDiff).toBeGreaterThan(14 * 60 * 1000);
    expect(dateDiff).toBeLessThanOrEqual(16 * 60 * 1000);
  });
});
