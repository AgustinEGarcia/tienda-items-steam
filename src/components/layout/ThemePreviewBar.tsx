'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Palette, Sparkles, Gem, ShieldAlert, Disc3 } from 'lucide-react';

export type ThemeOption = 'amethyst' | 'synthwave' | 'iris' | 'pitch';

export function ThemePreviewBar() {
  const pathname = usePathname();
  const [activeTheme, setActiveTheme] = useState<ThemeOption>('amethyst');
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Recuperar tema guardado
    const saved = localStorage.getItem('cs2_theme_preview') as ThemeOption;
    if (saved && ['amethyst', 'synthwave', 'iris', 'pitch'].includes(saved)) {
      applyTheme(saved);
    } else {
      applyTheme('amethyst');
    }

    // Verificar si el usuario es administrador
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, []);

  const applyTheme = (theme: ThemeOption) => {
    setActiveTheme(theme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove(
        'theme-amethyst',
        'theme-synthwave',
        'theme-iris',
        'theme-pitch',
        'theme-cyberpunk',
        'theme-velvet',
        'theme-obsidian'
      );
      document.documentElement.classList.add(`theme-${theme}`);
      localStorage.setItem('cs2_theme_preview', theme);
    }
  };

  if (!mounted) return null;

  // VISIBILIDAD: Solo se muestra si el usuario está en el panel /admin O si tiene sesión de admin activa
  const shouldShow = pathname === '/admin' || isAdmin;
  if (!shouldShow) return null;

  return (
    <div className="w-full bg-[#080612]/95 border-b border-purple-500/20 backdrop-blur-md sticky top-0 z-50 px-4 py-2 text-xs shadow-lg shadow-purple-950/40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-purple-300 font-medium">
          <Palette className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="font-semibold tracking-wide text-white uppercase">Panel Admin — Selector de Diseño:</span>
          <span className="text-purple-300/60 hidden sm:inline">(Visible únicamente para ti)</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Opción A: Midnight Amethyst */}
          <button
            onClick={() => applyTheme('amethyst')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTheme === 'amethyst'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-purple-300'
                : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 border border-purple-900/40'
            }`}
          >
            <Gem className="w-3.5 h-3.5 text-purple-300" />
            <span>A. Midnight Amethyst</span>
          </button>

          {/* Opción B: Neon Synthwave */}
          <button
            onClick={() => applyTheme('synthwave')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTheme === 'synthwave'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-600/40 ring-1 ring-pink-300'
                : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 border border-purple-900/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>B. Neon Synthwave</span>
          </button>

          {/* Opción C: Royal Iris */}
          <button
            onClick={() => applyTheme('iris')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTheme === 'iris'
                ? 'bg-violet-700 text-white shadow-lg shadow-violet-700/40 ring-1 ring-violet-300'
                : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 border border-purple-900/40'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5 text-violet-300" />
            <span>C. Royal Iris</span>
          </button>

          {/* Opción D: Pitch Black */}
          <button
            onClick={() => applyTheme('pitch')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTheme === 'pitch'
                ? 'bg-zinc-950 text-purple-200 border border-purple-500 shadow-lg shadow-purple-500/30 ring-1 ring-purple-400'
                : 'bg-black text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>D. Pitch Black</span>
          </button>
        </div>
      </div>
    </div>
  );
}
