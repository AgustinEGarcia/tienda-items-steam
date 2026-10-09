/**
 * Utilidades puras para el cálculo y validación de expiración de caché (TTL).
 */

const DEFAULT_TTL_MINUTES = 60;

/**
 * Determina si una fecha de expiración ya fue superada.
 * Si la fecha es nula, indefinida o no válida, asume expirado (true) por seguridad.
 */
export function isCacheExpired(
  expiresAt: string | Date | null | undefined,
  referenceNow: Date = new Date()
): boolean {
  if (!expiresAt) {
    return true;
  }

  const expirationDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);

  if (isNaN(expirationDate.getTime())) {
    return true;
  }

  return expirationDate.getTime() <= referenceNow.getTime();
}

/**
 * Calcula una fecha ISO futura sumando minutos de TTL a una fecha base (por defecto ahora).
 */
export function calculateExpirationDate(
  ttlMinutes: number = DEFAULT_TTL_MINUTES,
  baseDate: Date = new Date()
): string {
  const safeMinutes = Math.max(1, ttlMinutes || DEFAULT_TTL_MINUTES);
  const futureTime = baseDate.getTime() + safeMinutes * 60 * 1000;
  return new Date(futureTime).toISOString();
}

/**
 * Retorna los segundos restantes hasta la expiración, o 0 si ya expiró.
 */
export function getRemainingTtlSeconds(
  expiresAt: string | Date | null | undefined,
  referenceNow: Date = new Date()
): number {
  if (!expiresAt) {
    return 0;
  }

  const expirationDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);

  if (isNaN(expirationDate.getTime())) {
    return 0;
  }

  const diffMs = expirationDate.getTime() - referenceNow.getTime();
  if (diffMs <= 0) {
    return 0;
  }

  return Math.floor(diffMs / 1000);
}
