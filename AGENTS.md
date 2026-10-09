# Reglas de Gobernanza para Agentes de IA

## Stack y Arquitectura
- Framework: Next.js (App Router, React 19, TypeScript estricto).
- Estilos: Tailwind CSS (tema oscuro por defecto, UI reactiva).
- Base de Datos y Caché: Supabase (PostgreSQL) con `@supabase/supabase-js`.
- Validación y Tipado: Zod para DTOs, inputs y variables de entorno.
- Tests: Vitest o Node Test Runner para lógica pura de negocio.

## Protocolo de Proyecto
- Al empezar, lee `MEMORY.md` para conocer el estado y `docs/constitution.md` para los principios.
- Al terminar una tarea, actualiza `MEMORY.md`. Mantenlo breve (~50 líneas).
- Commits: Usa OBLIGATORIAMENTE Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`).
- Seguridad y Datos: PROHIBIDO hardcodear credenciales, tokens o contraseñas. Usa SIEMPRE variables de entorno y documéntalas en `.env.example`. Valida y tipa estrictamente todo input.
- Inmunidad Steam: Solo lectura pública con SteamID64 (17 dígitos). Jamás solicitar contraseñas, Steam Guard ni API Keys personales.

## Protocolo Anti-Rate-Limit Steam
- Todo acceso a Steam debe realizarse vía Route Handlers de backend, nunca en frontend.
- Comprobar la tabla de caché de Supabase (TTL 60 min) antes de invocar a Steam.
- Precios de mercado: consulta bajo demanda / diferida con delay mínimo de 2.5s entre ítems no cacheados.

## Protocolo de Inicio de Nueva Funcionalidad
Antes de escribir código, prepara un plan con:
1. Cómo la vas a implementar respetando las reglas de AGENTS.md y la spec vigente en `specs/NNN-*/`.
2. Qué archivos vas a modificar y qué cambia en cada uno.
3. Los casos límite (vectores de ataque, errores de Steam, datos corruptos).
4. Qué actualizarías en `MEMORY.md`.
⚠️ No modifiques ningún archivo hasta que se apruebe el plan.
