# ADR 0001: Adopción de Monolito Next.js y Supabase con Caché Persistente

## Estado
Aceptado

## Contexto
El proyecto requiere una aplicación web full-stack para gestionar inventarios de Steam CS2, consultar precios de mercado y convertirlos de USD a ARS en tiempo real, garantizando 100% costo cero en infraestructura y resiliencia extrema contra límites de peticiones (HTTP 429) de Valve. Se requería decidir entre un monolito o frontend/backend desacoplados, y entre almacenamiento en memoria o base de datos.

## Decisión
1. **Framework:** Utilizar Next.js (App Router con TypeScript y Tailwind CSS) desplegado en Vercel (Tier Free). Los endpoints proxy de Steam se ejecutan en Route Handlers internos, eliminando problemas de CORS y cold starts de servicios independientes.
2. **Persistencia y Caché:** Utilizar Supabase (PostgreSQL) para tablas de cuentas, configuración global y tabla de caché con TTL de 60 minutos (`steam_inventory_cache` y `steam_price_cache`). Esto evita la pérdida de caché que ocurriría si se usara memoria RAM local en las funciones serverless de Vercel.
3. **Seguridad y Cuentas Steam:** Operación puramente Read-Only con SteamID64 público. Sin credenciales ni claves privadas de usuario. Protección del panel de administración mediante clave secreta maestra (`ADMIN_PASSWORD`) y cookie cifrada HTTP-only.

## Consecuencias
- **Positivas:** Despliegue simple y unificado en Vercel, costo operativo cero, nulo riesgo para las cuentas de Steam de los usuarios, persistencia compartida de caché que protege la IP del servidor ante Steam.
- **Negativas/Compromisos:** Se requiere diseñar las consultas de precios de forma perezosa o paginada con demoras programadas para no saturar peticiones durante llamadas masivas a Steam.
