'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Users,
  Coins,
  Trash2,
  Plus,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface AccountRecord {
  id: string;
  steam_id: string;
  alias: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { dolarRate, settings, updateDolarRate, refreshSettings } = useCurrency();

  // Estados de Auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados de Gestión
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [newSteamId, setNewSteamId] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [accountFormError, setAccountFormError] = useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // Estados de Settings
  const [rateInput, setRateInput] = useState('');
  const [settingsNotice, setSettingsNotice] = useState<{ type: 'ok' | 'err'; msg: string } | null>(
    null
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Estados de Sincronización
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // 1. Verificar sesión
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setIsAuthenticated(data.authenticated === true);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  // 2. Cargar cuentas
  const loadAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error cargando cuentas:', err);
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts();
      setRateInput(String(dolarRate));
    }
  }, [isAuthenticated, loadAccounts, dolarRate]);

  // Manejar Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoggingIn) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Contraseña incorrecta');
        return;
      }

      setIsAuthenticated(true);
      setPassword('');
    } catch {
      setLoginError('Error de conexión al iniciar sesión');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Manejar Logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  // Registrar nueva cuenta
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSteamId.trim() || !newAlias.trim() || isAddingAccount) return;

    setIsAddingAccount(true);
    setAccountFormError(null);

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steam_id: newSteamId,
          alias: newAlias,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAccountFormError(data.error || 'Error al agregar cuenta');
        return;
      }

      setNewSteamId('');
      setNewAlias('');
      await loadAccounts();
    } catch {
      setAccountFormError('Error de conexión con el servidor');
    } finally {
      setIsAddingAccount(false);
    }
  };

  // Eliminar cuenta
  const handleDeleteAccount = async (id: string, alias: string) => {
    if (!confirm(`¿Estás seguro de que deseas desvincular la cuenta "${alias}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar cuenta');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  // Forzar sincronización de una cuenta
  const handleSyncAccount = async (steamId: string) => {
    setSyncingId(steamId);
    try {
      const res = await fetch(`/api/steam/inventory?steamId=${steamId}&force=true`);
      const data = await res.json();
      if (res.ok) {
        alert(`Sincronización completada: ${data.item_count || 0} ítems procesados`);
      } else {
        alert(data.error || 'Error al sincronizar con Steam');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setSyncingId(null);
    }
  };

  // Guardar nueva cotización
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = parseFloat(rateInput);

    if (isNaN(parsedRate) || parsedRate <= 0) {
      setSettingsNotice({ type: 'err', msg: 'Ingresa un valor numérico positivo válido' });
      return;
    }

    setIsSavingSettings(true);
    setSettingsNotice(null);

    const result = await updateDolarRate(parsedRate);

    if (result.success) {
      setSettingsNotice({ type: 'ok', msg: 'Cotización actualizada y propagada a todo el sistema' });
      await refreshSettings();
    } else {
      setSettingsNotice({ type: 'err', msg: result.error || 'Error al guardar la cotización' });
    }
    setIsSavingSettings(false);
  };

  // Pantalla de Carga de Sesión
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs">Verificando sesión de administrador...</p>
      </div>
    );
  }

  // Pantalla de Login (Si no está autenticado)
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 animate-in fade-in duration-300">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Acceso de Administración
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Ingresa la clave maestra configurada en el servidor para gestionar cuentas y cotizaciones.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clave Maestra de Administrador
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Ingresar al Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-900 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Catálogo Público</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Panel de Administración (Autenticado)
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Panel de Administración
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              Sesión Activa
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de cuentas de Steam, cotización soberana de divisas y caché.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver Catálogo</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-300 transition-all flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Configuración Global de Divisa */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Cotización Dólar CS2</h2>
                <p className="text-[11px] text-slate-400">Tasa de conversión USD a ARS</p>
              </div>
            </div>

            {settingsNotice && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                  settingsNotice.type === 'ok'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}
              >
                {settingsNotice.type === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{settingsNotice.msg}</span>
              </div>
            )}

            <form onSubmit={handleSaveRate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  1 USD equivale a (Pesos ARS):
                </label>
                <div className="relative">
                  <span className="text-slate-500 font-bold absolute left-3.5 top-1/2 -translate-y-1/2 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Actualizar Cotización</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-900 space-y-2 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>App ID CS2:</span>
                <span className="font-mono text-slate-300">{settings.app_id} (Counter-Strike 2)</span>
              </div>
              <div className="flex justify-between">
                <span>Context ID:</span>
                <span className="font-mono text-slate-300">{settings.context_id}</span>
              </div>
              <div className="flex justify-between">
                <span>TTL de Caché:</span>
                <span className="font-mono text-slate-300">{settings.cache_ttl_minutes} minutos</span>
              </div>
            </div>
          </div>

          {/* Banner de Garantía de Seguridad de Cuentas */}
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantía de Inmunidad Valve</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              La plataforma opera en modo <strong>Read-Only Pasivo</strong>. No se solicitan contraseñas, Steam Guard ni API Keys personales. Tus cuentas no pueden recibir bloqueos ni sanciones por el uso de este sistema.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Gestión de Cuentas (CRUD) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formulario para Vincular Nueva Cuenta */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Vincular Cuenta de Steam</h2>
                  <p className="text-[11px] text-slate-400">
                    Cupo utilizado: {accounts.length} de 5 cuentas permitidas
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                {5 - accounts.length} disponibles
              </span>
            </div>

            {accountFormError && (
              <div className="p-3.5 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{accountFormError}</span>
              </div>
            )}

            {accounts.length >= 5 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                Has alcanzado el límite máximo de 5 cuentas vinculadas para esta versión. Para agregar una nueva, elimina una existente.
              </div>
            ) : (
              <form onSubmit={handleAddAccount} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    SteamID64 o Enlace de Perfil:
                  </label>
                  <input
                    type="text"
                    placeholder="76561198... o url completa"
                    value={newSteamId}
                    onChange={(e) => setNewSteamId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Número de 17 dígitos o link https://steamcommunity.com/profiles/...
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Alias / Nombre Identificador:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Principal, Smurf, Depósito"
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Nombre representativo para los filtros del catálogo
                  </span>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isAddingAccount}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                  >
                    {isAddingAccount ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validando en base de datos...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Vincular Cuenta</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Tabla de Cuentas Vinculadas */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4">Cuentas Registradas</h3>

            {isLoadingAccounts ? (
              <div className="text-center py-10 text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Cargando cuentas...</span>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
                No hay cuentas registradas actualmente.
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{acc.alias}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {acc.steam_id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Registrada: {new Date(acc.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        disabled={syncingId === acc.steam_id}
                        onClick={() => handleSyncAccount(acc.steam_id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        title="Forzar actualización de inventario desde Steam"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 text-amber-400 ${
                            syncingId === acc.steam_id ? 'animate-spin' : ''
                          }`}
                        />
                        <span>Sincronizar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(acc.id, acc.alias)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                        title="Eliminar cuenta y su caché"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
