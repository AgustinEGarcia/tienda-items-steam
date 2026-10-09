import crypto from 'crypto';
import { cookies } from 'next/headers';
import { env } from '../env';

export const ADMIN_COOKIE_NAME = 'admin_session';
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

interface SessionPayload {
  role: 'admin';
  exp: number; // timestamp en milisegundos
}

/**
 * Genera una firma HMAC SHA-256 para un payload dado.
 */
function signPayload(payloadStr: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
}

/**
 * Crea un token de sesión firmado para el administrador.
 */
export function createAdminSessionToken(
  secret: string = env.SESSION_SECRET,
  durationSeconds: number = SEVEN_DAYS_SECONDS
): string {
  const payload: SessionPayload = {
    role: 'admin',
    exp: Date.now() + durationSeconds * 1000,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(payloadStr, secret);

  return `${payloadStr}.${signature}`;
}

/**
 * Verifica la firma y la fecha de expiración del token.
 */
export function verifyAdminSessionToken(
  token: unknown,
  secret: string = env.SESSION_SECRET
): boolean {
  if (typeof token !== 'string' || !token.includes('.')) {
    return false;
  }

  const [payloadStr, signature] = token.split('.');
  if (!payloadStr || !signature) {
    return false;
  }

  const expectedSignature = signPayload(payloadStr, secret);

  // Comparación en tiempo constante para mitigar timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  const isSigValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isSigValid) {
    return false;
  }

  try {
    const jsonStr = Buffer.from(payloadStr, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr) as SessionPayload;

    if (payload.role !== 'admin') {
      return false;
    }

    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return false; // Expirado
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Comprueba si la petición actual posee una cookie de sesión de admin válida.
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return false;
    }
    return verifyAdminSessionToken(sessionCookie.value);
  } catch {
    return false;
  }
}
