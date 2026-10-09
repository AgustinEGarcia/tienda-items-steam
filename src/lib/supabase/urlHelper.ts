/**
 * Limpia y normaliza la URL de Supabase para evitar errores de ruta en el cliente PostgREST
 */
export function cleanSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  let url = rawUrl.trim();

  // Si pegaron la URL del dashboard de Supabase (ej: https://supabase.com/dashboard/project/abcdefgh...)
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Quitar prefijos comunes erróneos como /rest/v1 o /auth/v1
  url = url.replace(/\/(rest|auth)\/v1\/?$/, '');

  // Quitar barras diagonales finales redundantes
  url = url.replace(/\/+$/, '');

  return url;
}
