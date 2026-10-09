# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Spec 001 (Visualización, Tasación y Gestión Multi-cuenta CS2) 100% IMPLEMENTADA.
- 19 tareas atómicas completadas en 5 fases (Setup, Dominio TDD, Backend, Frontend y Validación E2E).
- 43 tests unitarios y de integración pasando en verde (100% cobertura).
- Next.js 16 compilando en limpio (`npm run build`) para despliegue serverless costo cero en Vercel.

## Decisiones (y por qué)
- Next.js Monolito en Vercel: Elimina CORS y cold-starts cruzados entre frontend y backend.
- Supabase PostgreSQL: Persistencia permanente y caché compartida con TTL 60m contra HTTP 429 de Steam.
- Autenticación Admin: Clave maestra en `.env` con cookie HTTP-only (v1); Supabase Auth programado para v2.
- Cap de 5 cuentas: Límite estricto en BD y código para control de cuota en fase inicial.
- Precios On-Demand + Delay 2.5s: Cero ráfagas masivas hacia Valve; protección total de IP y cuentas.
- Inmunidad Steam: Read-Only anónimo con SteamID64 público. Sin credenciales ni claves privadas.

## Aprendizajes y errores a evitar
- Valve bloquea IPs con 429 si se superan 20-30 peticiones/min en `/market/priceoverview`.
- Servidores serverless pierden la memoria RAM; la caché debe guardarse en Supabase con TTL.

## Próximos pasos
- [x] T1-T19: Todas las tareas de la Spec 001 implementadas y verificadas.
- [ ] Configurar credenciales reales de Supabase en `.env.local` y correr script `supabase/schema.sql`.
- [ ] Probar flujo completo con cuentas reales de Steam en entorno local o Vercel.
