'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { ShieldCheck, Coins, LayoutGrid, Settings, ShieldAlert } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { dolarRate, isLoading } = useCurrency();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-purple-900/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200">
            <span className="font-black text-white text-xl tracking-tighter">CS2</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-purple-300 transition-colors">
                INVENTORY HUB
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-purple-300/60 hidden sm:block">
              Tasación & Multi-cuenta de Counter-Strike 2
            </p>
          </div>
        </Link>

        {/* Central Badge: Dolar en Vivo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-xs shadow-inner">
            <Coins className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-purple-300/70 font-medium hidden sm:inline">Dólar CS2:</span>
            <span className="font-mono font-bold text-purple-200">
              {isLoading ? (
                <span className="animate-pulse">Cargando...</span>
              ) : (
                `1 USD = $ ${dolarRate.toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS`
              )}
            </span>
          </div>

          <div
            title="Operación segura 100% Read-Only sin contraseñas ni riesgo para tus cuentas"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Read-Only Seguro</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              pathname === '/'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400/30'
                : 'text-purple-200/80 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Catálogo</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              pathname === '/admin'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400/30'
                : 'text-purple-200/80 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Administración</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
