'use client';

import React, { useEffect, useState } from 'react';
import { Palette, Sparkles, Gem, ShieldAlert } from 'lucide-react';

export type ThemeOption = 'cyberpunk' | 'velvet' | 'obsidian';

export function ThemePreviewBar() {
  const [activeTheme, setActiveTheme] = useState<ThemeOption>('cyberpunk');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cs2_theme_preview') as ThemeOption;
    if (saved && ['cyberpunk', 'velvet', 'obsidian'].includes(saved)) {
      applyTheme(saved);
    } else {
      applyTheme('cyberpunk');
    }
  }, []);

  const applyTheme = (theme: ThemeOption) => {
    setActiveTheme(theme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('theme-cyberpunk', 'theme-velvet', 'theme-obsidian');
      document.documentElement.classList.add(`theme-${theme}`);
      localStorage.setItem('cs2_theme_preview', theme);
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full bg-[#0a0718]/90 border-b border-purple-500/20 backdrop-blur-md sticky top-0 z-50 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-purple-300 font-medium">
          <Palette className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="font-semibold tracking-wide text-white">SELECTOR DE DISEÑO VIOLETA:</span>
          <span className="text-zinc-400 hidden sm:inline">Haz clic para previsualizar cada versión en vivo</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Opción 1: Cyberpunk Neon */}
          <button
            onClick={() => applyTheme('cyberpunk')}
            className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeTheme === 'cyberpunk'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40 ring-1 ring-purple-300'
                : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 border border-purple-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>1. Cyberpunk Neon</span>
          </button>

          {/* Opción 2: Deep Velvet */}
          <button
            onClick={() => applyTheme('velvet')}
            className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeTheme === 'velvet'
                ? 'bg-violet-700 text-white shadow-lg shadow-violet-600/40 ring-1 ring-amber-400'
                : 'bg-violet-950/40 text-violet-300 hover:bg-violet-900/60 border border-violet-800/40'
            }`}
          >
            <Gem className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Deep Velvet</span>
          </button>

          {/* Opción 3: Obsidian Ultraviolet */}
          <button
            onClick={() => applyTheme('obsidian')}
            className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              activeTheme === 'obsidian'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 ring-1 ring-cyan-400'
                : 'bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-800/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>3. Obsidian Ultra</span>
          </button>
        </div>
      </div>
    </div>
  );
}
