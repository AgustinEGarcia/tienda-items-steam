/**
 * Cliente HTTP seguro para consultas comunitarias públicas de Steam (Read-Only).
 * No utiliza ni requiere credenciales de usuario ni API keys privadas.
 */

const STEAM_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export interface SteamFetchResult<T = unknown> {
  success: boolean;
  status: number;
  data?: T;
  isPrivate?: boolean;
  isRateLimited?: boolean;
  error?: string;
}

/**
 * Consulta el inventario público de una cuenta en la comunidad de Steam.
 */
export async function fetchRawSteamInventory(
  steamId: string,
  appId: number = 730,
  contextId: number = 2
): Promise<SteamFetchResult> {
  const countsToTry = [2000, 1000, 500];
  let lastError = 'No se pudo obtener el inventario desde Steam';

  for (const count of countsToTry) {
    const url = `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=spanish&count=${count}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': STEAM_USER_AGENT,
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          Referer: `https://steamcommunity.com/profiles/${steamId}/inventory/`,
        },
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        return {
          success: false,
          status: 429,
          isRateLimited: true,
          error: 'Steam Rate Limit excedido (HTTP 429)',
        };
      }

      if (response.status === 403 || response.status === 401) {
        return {
          success: false,
          status: response.status,
          isPrivate: true,
          error: 'El perfil o inventario de esta cuenta es privado en Steam',
        };
      }

      // Si Steam rechaza con 400 (Bad Request por count excesivo), probar con el siguiente count menor
      if (response.status === 400 && count !== countsToTry[countsToTry.length - 1]) {
        continue;
      }

      if (!response.ok) {
        lastError = `Steam respondió con código HTTP ${response.status}`;
        continue;
      }

      const json = await response.json();

      // Si Steam devuelve { null } o { success: false }
      if (!json || json.success === 0 || json.error) {
        return {
          success: false,
          status: 200,
          isPrivate: true,
          error: json?.error || 'Inventario no accesible o privado',
        };
      }

      return {
        success: true,
        status: 200,
        data: json,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      lastError = `Fallo de conexión al consultar Steam: ${errorMsg}`;
    }
  }

  return {
    success: false,
    status: 400,
    error: lastError,
  };
}
