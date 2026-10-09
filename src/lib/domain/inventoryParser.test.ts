import { describe, it, expect } from 'vitest';
import { parseSteamInventory, buildSteamCdnImageUrl } from './inventoryParser';

describe('buildSteamCdnImageUrl', () => {
  it('debe construir la URL completa de CDN de Cloudflare para el icono de Steam', () => {
    const iconUrl = 'fWFc82.....abc';
    expect(buildSteamCdnImageUrl(iconUrl)).toBe(
      'https://community.cloudflare.steamstatic.com/economy/image/fWFc82.....abc'
    );
  });

  it('debe devolver un placeholder seguro si el icono es nulo o vacío', () => {
    expect(buildSteamCdnImageUrl('')).toBe('/placeholder-item.png');
    expect(buildSteamCdnImageUrl(undefined)).toBe('/placeholder-item.png');
  });
});

describe('parseSteamInventory', () => {
  const mockSteamPayload = {
    success: 1,
    total_inventory_count: 2,
    assets: [
      {
        appid: 730,
        contextid: '2',
        assetid: '1001',
        classid: '501',
        instanceid: '10',
        amount: '1',
      },
      {
        appid: 730,
        contextid: '2',
        assetid: '1002',
        classid: '502',
        instanceid: '0',
        amount: '1',
      },
    ],
    descriptions: [
      {
        appid: 730,
        classid: '501',
        instanceid: '10',
        market_hash_name: 'AK-47 | Redline (Field-Tested)',
        name: 'AK-47 | Redline',
        type: 'Fusil clasificado',
        icon_url: 'ak47-icon-path',
        tradable: 1,
        marketable: 1,
        tags: [
          {
            category: 'Rarity',
            localized_tag_name: 'Clasificado',
            color: 'd32ce6',
          },
          {
            category: 'Exterior',
            localized_tag_name: 'Algo desgastado',
          },
          {
            category: 'Type',
            localized_tag_name: 'Fusil',
          },
        ],
      },
      {
        appid: 730,
        classid: '502',
        instanceid: '0',
        market_hash_name: 'AWP | Asiimov (Field-Tested)',
        name: 'AWP | Asiimov',
        type: 'Rifle de francotirador encubierto',
        icon_url: 'awp-icon-path',
        tradable: 1,
        marketable: 1,
        tags: [
          {
            category: 'Rarity',
            localized_tag_name: 'Encubierto',
            color: 'eb4b4b',
          },
          {
            category: 'Exterior',
            localized_tag_name: 'Algo desgastado',
          },
        ],
      },
    ],
  };

  it('debe cruzar assets y descriptions correctamente asociando los metadatos', () => {
    const accountInfo = {
      steamId: '76561198000000001',
      alias: 'Cuenta Principal',
    };

    const items = parseSteamInventory(mockSteamPayload, accountInfo);

    expect(items).toHaveLength(2);

    const ak = items.find((i) => i.assetid === '1001');
    expect(ak).toBeDefined();
    expect(ak?.market_hash_name).toBe('AK-47 | Redline (Field-Tested)');
    expect(ak?.rarity).toBe('Clasificado');
    expect(ak?.rarity_color).toBe('#d32ce6');
    expect(ak?.exterior).toBe('Algo desgastado');
    expect(ak?.icon_url).toContain('community.cloudflare.steamstatic.com/economy/image/ak47-icon-path');
    expect(ak?.account_steam_id).toBe('76561198000000001');
    expect(ak?.account_alias).toBe('Cuenta Principal');
    expect(ak?.marketable).toBe(true);

    const awp = items.find((i) => i.assetid === '1002');
    expect(awp).toBeDefined();
    expect(awp?.market_hash_name).toBe('AWP | Asiimov (Field-Tested)');
    expect(awp?.rarity_color).toBe('#eb4b4b');
  });

  it('debe retornar un array vacío si el payload es inválido o no tiene assets', () => {
    expect(parseSteamInventory(null)).toEqual([]);
    expect(parseSteamInventory({})).toEqual([]);
    expect(parseSteamInventory({ assets: [] })).toEqual([]);
    expect(parseSteamInventory({ error: 'Rate limit exceeded' })).toEqual([]);
  });

  it('debe manejar ítems sin tags ni exterior de forma segura', () => {
    const rawNoTags = {
      assets: [{ assetid: '2001', classid: '601', instanceid: '0', amount: '1' }],
      descriptions: [
        {
          classid: '601',
          instanceid: '0',
          market_hash_name: 'Caja de armas de CS:GO',
          name: 'Caja de armas de CS:GO',
          type: 'Contenedor básico',
          icon_url: 'case-icon',
          tradable: 1,
          marketable: 1,
        },
      ],
    };

    const items = parseSteamInventory(rawNoTags);
    expect(items).toHaveLength(1);
    expect(items[0].market_hash_name).toBe('Caja de armas de CS:GO');
    expect(items[0].exterior).toBeUndefined();
    expect(items[0].rarity).toBe('Común');
  });
});
