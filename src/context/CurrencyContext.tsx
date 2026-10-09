'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculateArsPrice, formatCurrency } from '@/lib/domain/currency';

interface SettingsData {
  dolar_ars_rate: number;
  app_id: number;
  context_id: number;
  cache_ttl_minutes: number;
}

interface CurrencyContextType {
  dolarRate: number;
  settings: SettingsData;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateDolarRate: (newRate: number) => Promise<{ success: boolean; error?: string }>;
  toArs: (usdAmount: number | null | undefined) => number | null;
  formatArs: (usdAmount: number | null | undefined) => string;
  formatUsd: (usdAmount: number | null | undefined) => string;
}

const defaultSettings: SettingsData = {
  dolar_ars_rate: 1250,
  app_id: 730,
  context_id: 2,
  cache_ttl_minutes: 60,
};

const CurrencyContext = createContext<CurrencyContextType>({
  dolarRate: 1250,
  settings: defaultSettings,
  isLoading: true,
  refreshSettings: async () => {},
  updateDolarRate: async () => ({ success: false }),
  toArs: () => null,
  formatArs: () => '—',
  formatUsd: () => '—',
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          dolar_ars_rate: Number(data.dolar_ars_rate) || 1250,
          app_id: data.app_id || 730,
          context_id: data.context_id || 2,
          cache_ttl_minutes: data.cache_ttl_minutes || 60,
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateDolarRate = async (newRate: number) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dolar_ars_rate: newRate }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Error al actualizar cotización' };
      }

      const updated = await res.json();
      setSettings((prev) => ({
        ...prev,
        dolar_ars_rate: Number(updated.dolar_ars_rate),
      }));

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error de conexión',
      };
    }
  };

  const toArs = (usdAmount: number | null | undefined) => {
    return calculateArsPrice(usdAmount, settings.dolar_ars_rate);
  };

  const formatArs = (usdAmount: number | null | undefined) => {
    const ars = toArs(usdAmount);
    return formatCurrency(ars, 'ARS');
  };

  const formatUsd = (usdAmount: number | null | undefined) => {
    return formatCurrency(usdAmount, 'USD');
  };

  return (
    <CurrencyContext.Provider
      value={{
        dolarRate: settings.dolar_ars_rate,
        settings,
        isLoading,
        refreshSettings: fetchSettings,
        updateDolarRate,
        toArs,
        formatArs,
        formatUsd,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
