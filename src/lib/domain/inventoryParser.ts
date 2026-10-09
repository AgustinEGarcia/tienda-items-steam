import { SteamItem } from '@/types/steam';

const STEAM_CLOUDFLARE_CDN = 'https://community.cloudflare.steamstatic.com/economy/image/';

/**
 * Genera la URL optimizada para la imagen del ítem usando el CDN oficial de Cloudflare para Steam.
 */
export function buildSteamCdnImageUrl(iconUrl?: string): string {
  if (!iconUrl || typeof iconUrl !== 'string' || iconUrl.trim() === '') {
    return '/placeholder-item.png';
  }
  return `${STEAM_CLOUDFLARE_CDN}${iconUrl.trim()}`;
}

interface AccountMeta {
  steamId?: string;
  alias?: string;
}

interface RawSteamAsset {
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

interface RawSteamTag {
  category: string;
  internal_name?: string;
  localized_category_name?: string;
  localized_tag_name?: string;
  color?: string;
}

interface RawSteamDescription {
  classid: string;
  instanceid: string;
  market_hash_name?: string;
  name?: string;
  type?: string;
  icon_url?: string;
  icon_url_large?: string;
  tradable?: number;
  marketable?: number;
  tags?: RawSteamTag[];
}

interface RawSteamInventoryPayload {
  success?: number;
  assets?: RawSteamAsset[];
  descriptions?: RawSteamDescription[];
}

/**
 * Transforma y normaliza la respuesta comunitaria de Steam cruzando `assets` con `descriptions`.
 */
export function parseSteamInventory(
  rawPayload: unknown,
  accountInfo?: AccountMeta
): SteamItem[] {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return [];
  }

  const payload = rawPayload as RawSteamInventoryPayload;
  if (!Array.isArray(payload.assets) || payload.assets.length === 0) {
    return [];
  }

  const descriptions = Array.isArray(payload.descriptions) ? payload.descriptions : [];

  // Mapear descripciones por clave compuesta `${classid}_${instanceid}` y por fallback `${classid}`
  const descMap = new Map<string, RawSteamDescription>();
  for (const desc of descriptions) {
    descMap.set(`${desc.classid}_${desc.instanceid}`, desc);
    if (!descMap.has(desc.classid)) {
      descMap.set(desc.classid, desc);
    }
  }

  const parsedItems: SteamItem[] = [];

  for (const asset of payload.assets) {
    const desc =
      descMap.get(`${asset.classid}_${asset.instanceid}`) ||
      descMap.get(asset.classid);

    if (!desc) {
      continue;
    }

    // Extraer tags relevantes (Rareza, Exterior/Desgaste, Tipo)
    let rarity = 'Común';
    let rarityColor = '#b0c3d9'; // Color por defecto base
    let exterior: string | undefined = undefined;

    if (Array.isArray(desc.tags)) {
      for (const tag of desc.tags) {
        if (tag.category === 'Rarity') {
          rarity = tag.localized_tag_name || tag.category;
          if (tag.color) {
            rarityColor = tag.color.startsWith('#') ? tag.color : `#${tag.color}`;
          }
        } else if (tag.category === 'Exterior') {
          exterior = tag.localized_tag_name;
        }
      }
    }

    const item: SteamItem = {
      assetid: String(asset.assetid),
      classid: String(asset.classid),
      instanceid: String(asset.instanceid),
      amount: String(asset.amount || '1'),
      market_hash_name: desc.market_hash_name || desc.name || 'Ítem desconocido',
      name: desc.name || desc.market_hash_name || 'Ítem desconocido',
      type: desc.type || 'Ítem de CS2',
      rarity,
      rarity_color: rarityColor,
      exterior,
      icon_url: buildSteamCdnImageUrl(desc.icon_url),
      icon_url_large: desc.icon_url_large ? buildSteamCdnImageUrl(desc.icon_url_large) : undefined,
      tradable: desc.tradable === 1,
      marketable: desc.marketable === 1,
      account_steam_id: accountInfo?.steamId,
      account_alias: accountInfo?.alias,
      price_usd: null,
      price_ars: null,
    };

    parsedItems.push(item);
  }

  return parsedItems;
}
