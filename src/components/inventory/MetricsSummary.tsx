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
}

export function MetricsSummary({
  totalUsd,
  itemCount,
  accounts,
  selectedSteamId,
  onSelectAccount,
  onRefreshAll,
  isRefreshing = false,
}: MetricsSummaryProps) {
  const { formatUsd, formatArs } = useCurrency();

  return (
    <div className="space-y-6">
      {/* 4 Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tarjeta 1: Total USD */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden border border-emerald-500/20 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Valor Total USD
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {formatUsd(totalUsd)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Referencia de mercado oficial de Steam
          </p>
        </div>

        {/* Tarjeta 2: Total ARS (Reactivo) */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden border border-amber-500/30 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>Valor Total ARS</span>
              <Sparkles className="w-3 h-3 animate-spin" />
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-amber-300 tracking-tight font-mono">
            {formatArs(totalUsd)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Convertido en tiempo real según cotización vigente
          </p>
        </div>

        {/* Tarjeta 3: Skins / Ítems */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden border border-blue-500/20 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Ítems en Inventario
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {itemCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
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
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {accounts.length} / 5
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Límite seguro de cuentas vinculadas en v1
          </p>
        </div>
      </div>

      {/* Barra de Filtros por Cuenta y Acción de Sincronización */}
      <div className="glass-panel p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 mr-2 hidden sm:inline">
            Filtrar por cuenta:
          </span>

          {/* Opción: Todas */}
          <button
            type="button"
            onClick={() => onSelectAccount(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedSteamId === null
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <span>Todas las Cuentas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                selectedSteamId === null
                  ? 'bg-slate-950/30 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
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
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
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
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-slate-950/30 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {acc.itemCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Botón Sincronizar bajo demanda */}
        {onRefreshAll && (
          <button
            type="button"
            disabled={isRefreshing}
            onClick={onRefreshAll}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            title="Forzar actualización de inventarios y precios en Steam"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-400 ${
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
