# Constitución del Proyecto — Tienda de Inventarios CS2

Este documento establece los 6 principios rectores e innegociables que rigen toda decisión técnica, diseño de arquitectura y contribución de código.

## Principio 1: Infraestructura 100% Costo Cero
El sistema debe operar íntegramente dentro de los límites de los tiers gratuitos permanentes (Next.js en Vercel, PostgreSQL en Supabase). Ninguna funcionalidad puede requerir infraestructura de pago, servidores dedicados continuos ni servicios de Redis administrado.

## Principio 2: Blindaje Anti-Bloqueo de Steam y Resiliencia de IP
La protección contra límites de peticiones (HTTP 429) de Valve es prioritaria para el servidor. Toda petición hacia la API comunitaria de Steam debe originarse exclusivamente en el backend (Route Handlers como proxy seguro). Quedan terminantemente prohibidas las llamadas concurrentes masivas. Se debe implementar obligatoriamente caché persistente en base de datos (TTL 60 min), demoras programadas entre consultas no cacheadas y manejo preventivo de respuestas de error.

## Principio 3: Inmunidad de Cuentas y Operación Pasiva Read-Only
La plataforma opera bajo el modelo de Observador Público Pasivo (Read-Only). Queda terminantemente prohibido solicitar o almacenar credenciales de inicio de sesión de Steam, contraseñas, códigos de Steam Guard, Trade URLs privadas o Steam Web API Keys personales vinculadas a las cuentas. Las consultas se realizan como visitante anónimo a datos públicos comunitarios únicamente mediante el identificador numérico público SteamID64, garantizando riesgo cero de sanciones o penalizaciones sobre las cuentas de Steam.

## Principio 4: Seguridad Zero Trust y Gestión de Secretos
Ningún dato de entrada de usuario o de respuestas externas es confiable por defecto. Todo input (incluyendo SteamID64 de 17 dígitos y cotizaciones) debe ser validado con esquemas estrictos (Zod). Queda prohibido hardcodear credenciales, tokens o contraseñas. El acceso administrativo requiere clave secreta maestra almacenada en variables de entorno y sesiones seguras HTTP-only.

## Principio 5: Spec-Driven Development (SDD) y TDD
La especificación manda. Si un requerimiento no está definido formalmente en `specs/` bajo sintaxis EARS, no se implementa. Toda decisión arquitectónica de alto impacto debe registrarse formalmente en `docs/adr/`. Toda lógica pura de negocio (cálculos de divisas, sanitización, parsers de inventario) debe contar con tests unitarios automatizados antes de su integración.

## Principio 6: Reactividad Financiera y Experiencia Visual Premium
La cotización del dólar (USD a ARS) es centralizada y soberana. Al actualizar la tasa en el panel, todos los cálculos derivados en la interfaz deben actualizarse de forma inmediata y consistente. La interfaz debe ofrecer una estética moderna, modo oscuro por defecto, tipografía cuidada (Inter/Outfit), distintivos de rareza oficiales de CS2 e indicadores claros de estado de carga y procedencia de la caché.
