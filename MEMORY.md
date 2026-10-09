# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Desplegado y operativo en producción en Vercel (`tienda-items-steam.vercel.app`) y Supabase.
- Base de datos operativa con 4 tablas (`accounts`, `settings`, `inventory_cache`, `price_cache`).
- 48 tests pasando en Vitest y Next.js 16 compilando de manera óptima.

## Decisiones (y por qué)
- Next.js Monolito en Vercel: Elimina CORS y cold-starts cruzados entre frontend y backend.
- Supabase PostgreSQL: Persistencia permanente y caché compartida con TTL 60m contra HTTP 429 de Steam.
- Autenticación Admin: Clave maestra en `.env` con cookie HTTP-only (v1); Supabase Auth programado para v2.
- Cap de 5 cuentas: Límite estricto en BD y código para control de cuota en fase inicial.
- Precios On-Demand + Delay 2.5s: Cero ráfagas masivas hacia Valve; protección total de IP y cuentas.
- Inmunidad Steam: Read-Only anónimo con SteamID64 público. Sin credenciales ni claves privadas.

## Aprendizajes y errores a evitar
- Valve bloquea con HTTP 400 si se solicita `count=5000` en el endpoint de inventario comunitario; el límite seguro es 2000/1000/500 con header `Referer` apuntando al perfil.
- Desactivar RLS u otorgar permisos explícitos en Supabase para evitar bloqueos en operaciones backend.
- Servidores serverless pierden memoria RAM; la caché se preserva en Supabase con TTL.

## Próximos pasos
- [x] T1-T19: Todas las tareas de la Spec 001 implementadas y verificadas.
- [x] Esquema ejecutado en Supabase y variables configuradas en Vercel.
- [ ] Vincular cuentas públicas y monitorear visualización del catálogo consolidado.
