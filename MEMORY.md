# MEMORY.md — Memoria del Proyecto
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resumir o eliminar lo que ya no aporte.

## Estado actual
- Desplegado y operativo en producción en Vercel (`tienda-items-steam.vercel.app`) y localmente en `http://localhost:3000`.
- Diseño definitivo consolidado con **Royal Iris & Deep Slate** como tema oficial.
- Barra temporal de pruebas removida; interfaz limpia y aislada para visitantes públicos.
- Skill `ui-design-system` consolidada en `agents/skills/ui-design-system/SKILL.md`.
- 48 tests pasando en Vitest y Next.js 16 compilando de manera óptima.

## Decisiones (y por qué)
- Next.js Monolito en Vercel: Elimina CORS y cold-starts cruzados entre frontend y backend.
- Tema Oficial Royal Iris: Estética táctica inspirada en Valve UI/Steam Deck con fondo `#0d0c18`, acentos violeta imperial `#7c3aed`/`#6d28d9` y cristales ahumados.
- Aislamiento de Funciones Admin: Sincronización manual de inventarios exclusiva para la pantalla `/admin`.
- Supabase PostgreSQL: Persistencia permanente y caché compartida con TTL 60m contra HTTP 429 de Steam.
- Autenticación Admin: Clave maestra en `.env` con cookie HTTP-only (v1); Supabase Auth programado para v2.
- Inmunidad Steam: Read-Only anónimo con SteamID64 público. Sin credenciales ni claves privadas.

## Aprendizajes y errores a evitar
- Valve bloquea con HTTP 400 si se solicita `count=5000` en el endpoint de inventario comunitario; el límite seguro es 2000/1000/500 con header `Referer` apuntando al perfil.
- Desactivar RLS u otorgar permisos explícitos en Supabase para evitar bloqueos en operaciones backend.

## Próximos pasos
- [x] T1-T19: Todas las tareas de la Spec 001 implementadas y verificadas.
- [x] Esquema ejecutado en Supabase y variables configuradas en Vercel.
- [x] Tema definitivo Royal Iris consolidado en local y producción.
- [ ] Vincular cuentas públicas en `/admin` y monitorear visualización del catálogo consolidado.
