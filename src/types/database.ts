export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          steam_id: string;
          alias: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          steam_id: string;
          alias: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          steam_id?: string;
          alias?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          dolar_ars_rate: number;
          app_id: number;
          context_id: number;
          cache_ttl_minutes: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          dolar_ars_rate?: number;
          app_id?: number;
          context_id?: number;
          cache_ttl_minutes?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          dolar_ars_rate?: number;
          app_id?: number;
          context_id?: number;
          cache_ttl_minutes?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_cache: {
        Row: {
          steam_id: string;
          items: Json;
          item_count: number;
          is_private: boolean;
          updated_at: string;
          expires_at: string;
        };
        Insert: {
          steam_id: string;
          items?: Json;
          item_count?: number;
          is_private?: boolean;
          updated_at?: string;
          expires_at: string;
        };
        Update: {
          steam_id?: string;
          items?: Json;
          item_count?: number;
          is_private?: boolean;
          updated_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      price_cache: {
        Row: {
          market_hash_name: string;
          price_usd: number | null;
          raw_response: Json | null;
          updated_at: string;
          expires_at: string;
        };
        Insert: {
          market_hash_name: string;
          price_usd?: number | null;
          raw_response?: Json | null;
          updated_at?: string;
          expires_at: string;
        };
        Update: {
          market_hash_name?: string;
          price_usd?: number | null;
          raw_response?: Json | null;
          updated_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type AccountRow = Database['public']['Tables']['accounts']['Row'];
export type SettingsRow = Database['public']['Tables']['settings']['Row'];
export type InventoryCacheRow = Database['public']['Tables']['inventory_cache']['Row'];
export type PriceCacheRow = Database['public']['Tables']['price_cache']['Row'];
