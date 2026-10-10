'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export interface AccountOption {
  id: string;
  steam_id: string;
  alias: string;
  itemCount?: number;
  isPrivate?: boolean;
}

interface MetricsSummaryProps {
  totalUsd: number;
  itemCount: number;
  accounts: AccountOption[];
  selectedSteamId: string | null; // null significa "Todas"
  onSelectAccount: (steamId: string | null) => void;
  onRefreshAll?: () => void;
  isRefreshing?: boolean;
  isAdmin?: boolean;
}

export function MetricsSummary({
  totalUsd,
  itemCount,
  accounts,
  selectedSteamId,
  onSelectAccount,
  onRefreshAll,
  isRefreshing = false,
  isAdmin = false,
}: MetricsSummaryProps) {
  const { formatUsd, formatArs } = useCurrency();

  return (
    <div className="space-y-6">
      {/* 4 Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tarjeta 1: Total USD */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden border border-purple-500/20 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Valor Total USD
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {formatUsd(totalUsd)}
          </div>
          <p className="text-[11px] text-purple-300/60 mt-1">
            Referencia de mercado oficial de Steam
          </p>
        </div>

        {/* Tarjeta 2: Total ARS (Reactivo) */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden border border-purple-500/30 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <span>Valor Total ARS</span>
              <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-purple-200 tracking-tight font-mono">
            {formatArs(totalUsd)}
          </div>
          <p className="text-[11px] text-purple-300/60 mt-1">
            Convertido en tiempo real según cotización vigente
          </p>
        </div>

        {/* Tarjeta 3: Skins / Ítems */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden border border-purple-500/20 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Ítems en Inventario
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-300">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {itemCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-purple-300/60 mt-1">
            Skins, cajas, pegatinas y coleccionables
          </p>
        </div>

        {/* Tarjeta 4: Cuentas Vinculadas */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden border border-purple-500/20 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Cuentas Gestionadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {accounts.length} / 5
          </div>
          <p className="text-[11px] text-purple-300/60 mt-1">
            Límite seguro de cuentas vinculadas en v1
          </p>
        </div>
      </div>

      {/* Barra de Filtros por Cuenta */}
      <div className="glass-panel p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 border border-purple-900/30">
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-xs font-semibold text-purple-300/70 mr-2 hidden sm:inline">
            Filtrar por cuenta:
          </span>

          {/* Opción: Todas */}
          <button
            type="button"
            onClick={() => onSelectAccount(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedSteamId === null
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/40'
                : 'bg-purple-950/20 text-purple-300/80 hover:bg-purple-900/40 hover:text-white border border-purple-900/30'
            }`}
          >
            <span>Todas las Cuentas</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                selectedSteamId === null
                  ? 'bg-purple-950/60 text-purple-200'
                  : 'bg-purple-950/40 text-purple-400/80'
              }`}
            >
              {itemCount}
            </span>
          </button>

          {/* Opciones por cuenta individual */}
          {accounts.map((acc) => {
            const isSelected = selectedSteamId === acc.steam_id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => onSelectAccount(acc.steam_id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/40'
                    : 'bg-purple-950/20 text-purple-300/80 hover:bg-purple-900/40 hover:text-white border border-purple-900/30'
                }`}
              >
                <span>{acc.alias}</span>
                {acc.isPrivate && (
                  <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1 rounded">
                    Privado
                  </span>
                )}
                {typeof acc.itemCount === 'number' && !acc.isPrivate && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isSelected
                        ? 'bg-purple-950/60 text-purple-200'
                        : 'bg-purple-950/40 text-purple-400/80'
                    }`}
                  >
                    {acc.itemCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Botón Sincronizar bajo demanda: SOLO VISIBLE PARA EL ADMINISTRADOR */}
        {isAdmin && onRefreshAll && (
          <button
            type="button"
            disabled={isRefreshing}
            onClick={onRefreshAll}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 text-xs font-bold text-purple-200 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-purple-950/50"
            title="Forzar actualización de inventarios y precios en Steam"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-purple-400 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span>{isRefreshing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
