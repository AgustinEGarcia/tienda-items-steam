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
  const url = `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=spanish&count=5000`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': STEAM_USER_AGENT,
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        Referer: 'https://steamcommunity.com/',
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

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: `Steam respondió con código HTTP ${response.status}`,
      };
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
    return {
      success: false,
      status: 500,
      error: `Fallo de conexión al consultar Steam: ${errorMsg}`,
    };
  }
}
