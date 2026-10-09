export interface SteamItem {
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  market_hash_name: string;
  name: string;
  type: string;
  rarity?: string;
  rarity_color?: string;
  icon_url: string;
  icon_url_large?: string;
  exterior?: string; // Wear (Factory New, Minimal Wear, etc.)
  tradable: boolean;
  marketable: boolean;
  price_usd?: number | null;
  price_ars?: number | null;
  account_steam_id?: string;
  account_alias?: string;
}

export interface InventoryResponse {
  steam_id: string;
  alias?: string;
  is_private: boolean;
  item_count: number;
  from_cache: boolean;
  expires_at?: string;
  items: SteamItem[];
}

export interface PriceOverviewResponse {
  success: boolean;
  lowest_price?: string;
  volume?: string;
  median_price?: string;
}
