/**
 * Utilidades puras para el cálculo y formateo de cotizaciones financieras (USD <-> ARS).
 */

/**
 * Parsea un string devuelto por la API de Steam (ej: "$1.25", "$1,250.50", "12,50$") a un número en punto flotante.
 */
export function parseSteamPriceString(rawPrice: unknown): number | null {
  if (typeof rawPrice !== 'string') {
    return null;
  }

  const trimmed = rawPrice.trim();
  if (!trimmed) {
    return null;
  }

  // Eliminar símbolos de moneda y caracteres de texto (dejar números, puntos y comas)
  const cleaned = trimmed.replace(/[^0-9.,]/g, '');
  if (!cleaned) {
    return null;
  }

  let normalized = cleaned;

  // Si tiene comas y puntos (ej: "1,250.50"): la coma es separador de miles y el punto es decimal
  if (cleaned.includes(',') && cleaned.includes('.')) {
    normalized = cleaned.replace(/,/g, '');
  } else if (cleaned.includes(',')) {
    // Si solo tiene coma (ej: "12,50"), la convertimos a punto decimal
    normalized = cleaned.replace(',', '.');
  }

  const parsed = parseFloat(normalized);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

/**
 * Multiplica el precio en dólares por la cotización en ARS y redondea a 2 decimales sin errores de IEEE 754.
 */
export function calculateArsPrice(
  priceUsd: number | null | undefined,
  dolarRate: number
): number | null {
  if (priceUsd === null || priceUsd === undefined) {
    return null;
  }

  if (priceUsd <= 0 || dolarRate <= 0) {
    return 0;
  }

  // Multiplicar usando enteros para mitigar imprecisión de coma flotante
  const usdCents = Math.round(priceUsd * 100);
  const totalArs = (usdCents * dolarRate) / 100;

  return Math.round(totalArs * 100) / 100;
}

/**
 * Formatea un valor monetario con formato regional amigable.
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: 'USD' | 'ARS'
): string {
  if (amount === null || amount === undefined) {
    return '—';
  }

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
