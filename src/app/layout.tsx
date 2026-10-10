import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { Navbar } from '@/components/layout/Navbar';
import { ThemePreviewBar } from '@/components/layout/ThemePreviewBar';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'CS2 Inventory Hub — Tasación & Gestión Multi-cuenta',
  description:
    'Visualizador, tasador y gestor multi-cuenta de inventarios de Counter-Strike 2 con cotización USD a ARS en tiempo real, 100% costo cero y máxima seguridad.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} dark`}>
      <body className="min-h-screen flex flex-col antialiased selection:bg-purple-600 selection:text-white font-sans">
        <ThemePreviewBar />
        <CurrencyProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>
                CS2 Inventory Hub &copy; 2026 — Operación Read-Only Comunitaria Pasiva.
              </p>
              <p className="text-[11px] text-slate-600">
                Los datos e imágenes de skins son propiedad de Valve Corporation y Steam Community.
              </p>
            </div>
          </footer>
        </CurrencyProvider>
      </body>
    </html>
  );
}
