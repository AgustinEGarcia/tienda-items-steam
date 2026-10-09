'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { SteamItem } from '@/types/steam';
import { MetricsSummary, AccountOption } from '@/components/inventory/MetricsSummary';
import { ItemCard } from '@/components/inventory/ItemCard';
import {
  Search,
  ArrowUpDown,
  Layers,
  Settings,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

type SortOption = 'price_desc' | 'price_asc' | 'name_asc' | 'rarity_desc';

export default function CatalogPage() {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [itemsByAccount, setItemsByAccount] = useState<Record<string, SteamItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSteamId, setSelectedSteamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price_desc');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // 1. Cargar cuentas e inventarios
  const loadInventories = useCallback(async (force = false) => {
    try {
      if (force) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorNotice(null);

      // Obtener cuentas registradas
      const accountsRes = await fetch('/api/accounts');
      if (!accountsRes.ok) {
        throw new Error('Error al consultar cuentas registradas');
      }
      const rawAccounts = await accountsRes.json();
      const accountsList: AccountOption[] = Array.isArray(rawAccounts) ? rawAccounts : [];

      if (accountsList.length === 0) {
        setAccounts([]);
        setItemsByAccount({});
        return;
      }

      // Consultar inventario para cada cuenta
      const updatedAccounts: AccountOption[] = [];
      const newItemsMap: Record<string, SteamItem[]> = {};

      for (const acc of accountsList) {
        try {
          const invRes = await fetch(
            `/api/steam/inventory?steamId=${acc.steam_id}${force ? '&force=true' : ''}`
          );
          const invData = await invRes.json();

          if (invData.is_private) {
            updatedAccounts.push({
              ...acc,
              itemCount: 0,
              isPrivate: true,
            });
            newItemsMap[acc.steam_id] = [];
          } else {
            const items: SteamItem[] = Array.isArray(invData.items) ? invData.items : [];
            updatedAccounts.push({
              ...acc,
              itemCount: items.length,
              isPrivate: false,
            });
            newItemsMap[acc.steam_id] = items;
          }
        } catch {
          updatedAccounts.push({
            ...acc,
            itemCount: 0,
          });
          newItemsMap[acc.steam_id] = [];
        }
      }

      setAccounts(updatedAccounts);
      setItemsByAccount(newItemsMap);
    } catch (err) {
      console.error('Error cargando inventarios:', err);
      setErrorNotice('No se pudieron sincronizar los inventarios. Verifica la conexión.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInventories();
  }, [loadInventories]);

  // Actualizar precio de ítem localmente cuando se cotiza en la tarjeta
  const handlePriceUpdate = (marketHashName: string, priceUsd: number | null) => {
    setItemsByAccount((prev) => {
      const updatedMap: Record<string, SteamItem[]> = {};
      for (const [steamId, items] of Object.entries(prev)) {
        updatedMap[steamId] = items.map((item) =>
          item.market_hash_name === marketHashName ? { ...item, price_usd: priceUsd } : item
        );
      }
      return updatedMap;
    });
  };

  // Filtrado y ordenamiento de ítems activos
  const filteredAndSortedItems = useMemo(() => {
    // 1. Filtrar por cuenta seleccionada o consolidar todas
    let activeItems: SteamItem[] = [];
    if (selectedSteamId) {
      activeItems = itemsByAccount[selectedSteamId] || [];
    } else {
      activeItems = Object.values(itemsByAccount).flat();
    }

    // 2. Filtrar por búsqueda de texto
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      activeItems = activeItems.filter(
        (i) =>
          i.market_hash_name.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q)
      );
    }

    // 3. Ordenamiento
    const sorted = [...activeItems];
    sorted.sort((a, b) => {
      const priceA = a.price_usd ?? -1;
      const priceB = b.price_usd ?? -1;

      switch (sortBy) {
        case 'price_desc':
          return priceB - priceA;
        case 'price_asc':
          return priceA - priceB;
        case 'name_asc':
          return a.market_hash_name.localeCompare(b.market_hash_name);
        case 'rarity_desc':
          return (b.rarity || '').localeCompare(a.rarity || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [itemsByAccount, selectedSteamId, searchQuery, sortBy]);

  // Calcular métricas sobre los ítems activos
  const metrics = useMemo(() => {
    const allConsolidatedItems = Object.values(itemsByAccount).flat();
    const activeItems = selectedSteamId
      ? itemsByAccount[selectedSteamId] || []
      : allConsolidatedItems;

    const totalUsd = activeItems.reduce((acc, curr) => acc + (curr.price_usd || 0), 0);
    return {
      totalUsd,
      itemCount: activeItems.length,
    };
  }, [itemsByAccount, selectedSteamId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner de Bienvenida y Métricas */}
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Inventario Consolidado CS2
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Tasación en tiempo real con referencia de Steam Community Market.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Gestionar Cuentas</span>
            </Link>
          </div>
        </div>

        {errorNotice && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorNotice}</span>
          </div>
        )}

        <MetricsSummary
          totalUsd={metrics.totalUsd}
          itemCount={metrics.itemCount}
          accounts={accounts}
          selectedSteamId={selectedSteamId}
          onSelectAccount={setSelectedSteamId}
          onRefreshAll={() => loadInventories(true)}
          isRefreshing={isRefreshing}
        />
      </section>

      {/* Barra de Controles (Buscador y Ordenamiento) */}
      <section className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Input Buscador */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por skin, arma o tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
          />
        </div>

        {/* Selector de Orden */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60 font-medium"
          >
            <option value="price_desc">Mayor Precio (USD)</option>
            <option value="price_asc">Menor Precio (USD)</option>
            <option value="name_asc">Nombre (A - Z)</option>
            <option value="rarity_desc">Rareza</option>
          </select>
        </div>
      </section>

      {/* Grilla de Ítems */}
      <section>
        {isLoading ? (
          <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center gap-3 border border-slate-800">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm font-bold text-white">Sincronizando inventarios con Steam...</p>
            <p className="text-xs text-slate-400">Consultando tabla de caché y datos comunitarios</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center gap-4 border border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">No hay cuentas vinculadas</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Registra tu primera cuenta mediante su identificador público SteamID64 (17 dígitos) para comenzar a visualizar y tasar tus skins.
              </p>
            </div>
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20"
            >
              Ir a Administración y Agregar Cuenta
            </Link>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800 text-slate-400 text-xs">
            No se encontraron ítems que coincidan con la búsqueda o la cuenta seleccionada.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {filteredAndSortedItems.map((item) => (
              <ItemCard
                key={`${item.assetid}_${item.classid}`}
                item={item}
                onPriceUpdate={handlePriceUpdate}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
