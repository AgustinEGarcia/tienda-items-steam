'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SteamItem } from '@/types/steam';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Tag,
  Coins,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

interface ItemCardProps {
  item: SteamItem;
  onPriceUpdate?: (marketHashName: string, priceUsd: number | null) => void;
}

export function ItemCard({ item, onPriceUpdate }: ItemCardProps) {
  const { formatUsd, formatArs } = useCurrency();
  const [priceUsd, setPriceUsd] = useState<number | null | undefined>(
    item.price_usd
  );
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState(item.icon_url);

  // Determinar color de rareza con fallback seguro
  const rarityColor = item.rarity_color || '#b0c3d9';

  // Separar el nombre del arma del nombre de la skin si sigue el formato "Arma | Skin (Desgaste)"
  const nameParts = item.market_hash_name.split(' | ');
  const weaponName = nameParts.length > 1 ? nameParts[0] : item.type;
  const skinName = nameParts.length > 1 ? nameParts.slice(1).join(' | ') : item.name;

  const handleFetchPrice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoadingPrice || !item.marketable) return;

    setIsLoadingPrice(true);
    setPriceError(null);

    try {
      const res = await fetch(
        `/api/steam/price?marketHashName=${encodeURIComponent(
          item.market_hash_name
        )}`
      );
      const data = await res.json();

      if (!res.ok) {
        setPriceError(data.error || 'Límite temporal');
        return;
      }

      setPriceUsd(data.price_usd);
      if (onPriceUpdate) {
        onPriceUpdate(item.market_hash_name, data.price_usd);
      }
    } catch {
      setPriceError('Error de red');
    } finally {
      setIsLoadingPrice(false);
    }
  };

  return (
    <div
      className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group relative border border-slate-800/80 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/40"
      style={{
        borderBottom: `3px solid ${rarityColor}`,
      }}
    >
      {/* Resplandor superior de color de rareza */}
      <div
        className="absolute top-0 inset-x-0 h-24 opacity-15 pointer-events-none blur-xl group-hover:opacity-25 transition-opacity"
        style={{ backgroundColor: rarityColor }}
      />

      {/* Cabecera de la Tarjeta (Badges de Cuenta y Exterior) */}
      <div className="p-3.5 pb-0 flex items-center justify-between gap-2 z-10">
        {item.account_alias ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-900/40 text-[10px] font-semibold text-purple-200">
            <Shield className="w-2.5 h-2.5 text-purple-400" />
            <span className="truncate max-w-[90px]">{item.account_alias}</span>
          </span>
        ) : (
          <div />
        )}

        {item.exterior ? (
          <span className="px-2 py-0.5 rounded-md bg-purple-950/40 text-[10px] font-bold text-purple-300/80 border border-purple-900/40">
            {item.exterior}
          </span>
        ) : (
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white border"
            style={{
              backgroundColor: `${rarityColor}20`,
              borderColor: `${rarityColor}50`,
            }}
          >
            {item.rarity}
          </span>
        )}
      </div>

      {/* Imagen del Ítem desde CDN Cloudflare */}
      <div className="relative w-full h-36 flex items-center justify-center p-3 my-1">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={item.market_hash_name}
            onError={() => setImgSrc('/placeholder-item.png')}
            className="max-h-32 max-w-[90%] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-purple-950/30 flex items-center justify-center text-purple-400">
            <Layers className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Información del Ítem */}
      <div className="px-3.5 pb-3 z-10 flex-1 flex flex-col justify-end">
        <div className="mb-2.5">
          <p className="text-[11px] font-semibold text-purple-300/60 truncate">
            {weaponName}
          </p>
          <h3
            className="text-sm font-black text-white tracking-tight truncate leading-tight group-hover:text-purple-300 transition-colors"
            title={item.market_hash_name}
          >
            {skinName}
          </h3>
        </div>

        {/* Sección de Doble Precio */}
        <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between gap-2">
          {priceUsd !== null && priceUsd !== undefined ? (
            <div className="flex-1">
              <div className="text-[11px] text-purple-300/60 font-medium">
                {formatUsd(priceUsd)}
              </div>
              <div className="text-sm font-black text-purple-200 font-mono tracking-tight">
                {formatArs(priceUsd)}
              </div>
            </div>
          ) : !item.marketable ? (
            <div className="text-[11px] text-purple-400/50 italic py-1">
              No comercializable
            </div>
          ) : (
            <div className="flex-1">
              {priceError ? (
                <div className="text-[10px] text-rose-400 leading-tight">
                  {priceError}
                </div>
              ) : (
                <div className="text-[11px] text-purple-400/60 font-medium">
                  Sin cotizar
                </div>
              )}
            </div>
          )}

          {/* Botón para cotizar individualmente bajo demanda */}
          {item.marketable && (
            <button
              type="button"
              onClick={handleFetchPrice}
              disabled={isLoadingPrice}
              title={
                priceUsd !== null && priceUsd !== undefined
                  ? 'Actualizar cotización en Steam'
                  : 'Consultar precio de mercado'
              }
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                priceUsd !== null && priceUsd !== undefined
                  ? 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-300/80 hover:text-white border border-purple-900/40'
                  : 'bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30 ring-1 ring-purple-400/40'
              }`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoadingPrice ? 'animate-spin' : ''}`}
              />
              {priceUsd === null || priceUsd === undefined ? (
                <span className="text-[10px] font-bold px-0.5">Cotizar</span>
              ) : null}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
