/**
 * Validador y saneador seguro de SteamID64 (Zero Trust).
 * Los SteamID64 comunitarios estándar para cuentas de usuario tienen 17 dígitos y comienzan con 765611.
 */

const STEAM_ID_64_REGEX = /^765611\d{11}$/;
const STEAM_PROFILE_URL_REGEX = /(?:https?:\/\/)?steamcommunity\.com\/profiles\/(765611\d{11})\/?/;

/**
 * Valida si una cadena es estrictamente un SteamID64 válido.
 */
export function isValidSteamId64(steamId: unknown): boolean {
  if (typeof steamId !== 'string') {
    return false;
  }

  const trimmed = steamId.trim();
  if (trimmed.length !== 17) {
    return false;
  }

  return STEAM_ID_64_REGEX.test(trimmed);
}

/**
 * Sanea y extrae el SteamID64 tanto si se ingresa el número directo como si se pega la URL del perfil.
 * Retorna el SteamID64 de 17 dígitos o null si no es válido.
 */
export function cleanSteamId64(input: unknown): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();

  // Si ya es un SteamID64 directo
  if (isValidSteamId64(trimmed)) {
    return trimmed;
  }

  // Si pegó una URL de perfil completa: https://steamcommunity.com/profiles/765611...
  const urlMatch = trimmed.match(STEAM_PROFILE_URL_REGEX);
  if (urlMatch && urlMatch[1] && isValidSteamId64(urlMatch[1])) {
    return urlMatch[1];
  }

  return null;
}
