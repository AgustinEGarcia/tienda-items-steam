import { env } from '../env';
import { parseSteamPriceString } from '../domain/currency';

const STEAM_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

let lastRequestTime = 0;
let rateLimitCooloffUntil = 0;

/**
 * Espera el delay necesario para asegurar un intervalo mínimo entre peticiones hacia Steam.
 */
async function throttle(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  const minDelay = env.STEAM_PRICE_DELAY_MS || 2500;

  if (timeSinceLast < minDelay) {
    const waitTime = minDelay - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

export interface SteamPriceResult {
  success: boolean;
  priceUsd: number | null;
  raw?: unknown;
  isRateLimited?: boolean;
  error?: string;
}

/**
 * Consulta el precio de un ítem en el Steam Community Market respetando la cola de rate-limiting.
 */
export async function fetchSteamMarketPrice(
  marketHashName: string,
  appId: number = 730
): Promise<SteamPriceResult> {
  const now = Date.now();

  // Si estamos en período de enfriamiento tras un 429 previo
  if (now < rateLimitCooloffUntil) {
    const remainingSeconds = Math.ceil((rateLimitCooloffUntil - now) / 1000);
    return {
      success: false,
      priceUsd: null,
      isRateLimited: true,
      error: `Período de enfriamiento de Steam activo (${remainingSeconds}s restantes)`,
    };
  }

  // Esperar el intervalo mínimo de seguridad
  await throttle();

  const encodedName = encodeURIComponent(marketHashName);
  const url = `https://steamcommunity.com/market/priceoverview/?appid=${appId}&currency=1&market_hash_name=${encodedName}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': STEAM_USER_AGENT,
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://steamcommunity.com/market/',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      // Activar enfriamiento por 60 segundos
      rateLimitCooloffUntil = Date.now() + 60 * 1000;
      return {
        success: false,
        priceUsd: null,
        isRateLimited: true,
        error: 'Steam Market Rate Limit excedido (HTTP 429)',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        priceUsd: null,
        error: `Steam respondió con código HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data || data.success === false) {
      return {
        success: true,
        priceUsd: null, // Ítem no comercializado o sin listados activos
        raw: data,
      };
    }

    // Steam suele devolver lowest_price o median_price
    const priceStr = data.lowest_price || data.median_price;
    const priceUsd = parseSteamPriceString(priceStr);

    return {
      success: true,
      priceUsd,
      raw: data,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
    return {
      success: false,
      priceUsd: null,
      error: `Fallo al consultar precio en Steam: ${errorMsg}`,
    };
  }
}
