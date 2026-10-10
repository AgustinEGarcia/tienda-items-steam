# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Desplegado y operativo en producción en Vercel (`tienda-items-steam.vercel.app`) y localmente en `http://localhost:3000`.
- Sistema de diseño UI violeta puro implementado con 4 opciones (Amethyst, Synthwave, Iris, Pitch Black).
- Aislamiento visual de controles de administración completado (selectores, sincronización y demo ocultos para visitantes públicos).
- Skill `ui-design-system` actualizada en `agents/skills/ui-design-system/SKILL.md`.
- 48 tests pasando en Vitest y Next.js 16 compilando de manera óptima.

## Decisiones (y por qué)
- Next.js Monolito en Vercel: Elimina CORS y cold-starts cruzados entre frontend y backend.
- Paletas Violetas Puras: 100% libres de amarillos residuales; botones, píldoras y badges armonizados.
- Aislamiento de Funciones Admin: Selector y sincronización accesibles únicamente bajo sesión autenticada.
- Supabase PostgreSQL: Persistencia permanente y caché compartida con TTL 60m contra HTTP 429 de Steam.
- Autenticación Admin: Clave maestra en `.env` con cookie HTTP-only (v1); Supabase Auth programado para v2.
- Inmunidad Steam: Read-Only anónimo con SteamID64 público. Sin credenciales ni claves privadas.

## Aprendizajes y errores a evitar
- Valve bloquea con HTTP 400 si se solicita `count=5000` en el endpoint de inventario comunitario; el límite seguro es 2000/1000/500 con header `Referer` apuntando al perfil.
- Desactivar RLS u otorgar permisos explícitos en Supabase para evitar bloqueos en operaciones backend.

## Próximos pasos
- [x] T1-T19: Todas las tareas de la Spec 001 implementadas y verificadas.
- [x] Esquema ejecutado en Supabase y variables configuradas en Vercel.
- [x] 4 nuevas opciones violetas puras disponibles para evaluación local y en producción.
- [ ] Definir el tema ganador con el usuario para dejarlo establecido como principal.
