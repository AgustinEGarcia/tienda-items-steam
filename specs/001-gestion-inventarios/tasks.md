# Checklist de Tareas — Spec 001
Estado: implementada

Cada tarea está acotada a un bloque de 20 a 30 minutos con criterios de aceptación verificables. Se implementa una sola tarea a la vez siguiendo TDD.

---

## Fase 1: Setup del Proyecto y Base de Datos
- [x] **T1. Inicialización de Next.js y dependencias base.**  
  Hecho cuando: El proyecto Next.js compila con TypeScript estricto, Tailwind CSS y dependencias clave (`@supabase/supabase-js`, `zod`, `lucide-react`).
- [x] **T2. Configuración de cliente Supabase y script SQL.**  
  Hecho cuando: Existe el cliente de Supabase tipado en `src/lib/supabase/` y el archivo de migración `supabase/schema.sql` listo para ejecutar.
- [x] **T3. Validación de variables de entorno seguras con Zod.**  
  Hecho cuando: Se valida la presencia de `NEXT_PUBLIC_SUPABASE_URL`, `ADMIN_PASSWORD`, etc., al iniciar el servidor y falla con error claro si faltan.

---

## Fase 2: Lógica de Dominio Pura (TDD)
- [x] **T4. Validador de SteamID64.**  
  Hecho cuando: Suite de tests unitarios aprueba strings válidos de 17 dígitos y rechaza alfanuméricos, longitudes incorrectas o vacíos.
- [x] **T5. Calculador de precios y conversión USD a ARS.**  
  Hecho cuando: Suite de tests verifica redondeos limpios y evita errores de punto flotante de JavaScript.
- [x] **T6. Parser y extractor de inventario de Steam.**  
  Hecho cuando: Función pura transforma el JSON raw de Valve cruzando `assets` con `descriptions`, extrayendo desgastes, rarezas y stickers.
- [x] **T7. Utilidad de expiración de caché (TTL).**  
  Hecho cuando: Tests validan correctamente si un registro de caché sigue vigente o expiró frente a una fecha UTC dada.

---

## Fase 3: Endpoints de Backend (Route Handlers)
- [x] **T8. Endpoint de autenticación admin (`/api/auth/login` y `logout`).**  
  Hecho cuando: Genera y valida cookie de sesión HTTP-only cifrada contra `ADMIN_PASSWORD`.
- [x] **T9. Endpoint de configuración global (`/api/settings`).**  
  Hecho cuando: `GET` devuelve la cotización actual y `PUT` permite actualizarla con validación Zod previa verificación de auth.
- [x] **T10. Endpoint CRUD de cuentas (`/api/accounts`).**  
  Hecho cuando: Permite listar, agregar (restringiendo a máximo 5) y eliminar cuentas vinculadas.
- [x] **T11. Endpoint proxy de inventario Steam con caché (`/api/steam/inventory`).**  
  Hecho cuando: Consulta primero `inventory_cache` en Supabase; si no existe o expiró, llama a Steam, normaliza el inventario y actualiza la caché con TTL de 60 min. Maneja perfiles privados sin error 500.
- [x] **T12. Endpoint proxy de precios Steam con delay y cola (`/api/steam/price`).**  
  Hecho cuando: Consulta `price_cache` en Supabase; si no está, respeta delay de 2.5s y guarda precio. Maneja HTTP 429 con degradación airosa.

---

## Fase 4: Interfaz de Usuario y Vistas
- [x] **T13. Componentes base y diseño del Layout (Tema Oscuro CS2).**  
  Hecho cuando: El layout principal incluye tipografía cuidada, paleta oscura temática y Navbar con indicador de cotización.
- [x] **T14. Barra de métricas consolidadas (`MetricsSummary`).**  
  Hecho cuando: Muestra las tarjetas con total USD, total ARS, conteo de ítems y selector de cuentas.
- [x] **T15. Tarjeta de ítem de inventario (`ItemCard`).**  
  Hecho cuando: Renderiza la skin con borde de rareza, imagen de CDN Cloudflare, nombres oficiales, badges y precio doble USD/ARS.
- [x] **T16. Grilla de catálogo con filtrado por cuenta.**  
  Hecho cuando: La vista principal permite alternar entre "Todas las cuentas" o una cuenta específica recalculando los totales al instante.
- [x] **T17. Panel de Administración (`/admin`).**  
  Hecho cuando: Permite al administrador iniciar sesión con su clave maestra, modificar la cotización del dólar, registrar/borrar cuentas y forzar sincronización.

---

## Fase 5: Validación E2E y Verificación Final
- [x] **T18. Prueba de integración de caché y tolerancia a fallos.**  
  Hecho cuando: Se comprueba que recargar la página no dispara llamadas repetidas a Valve y que los precios persisten en Supabase.
- [x] **T19. Auditoría de seguridad y preparación para despliegue en Vercel.**  
  Hecho cuando: Ningún secreto está expuesto, la compilación de producción pasa limpia (`npm run build`) y el README documenta los pasos de clonación y uso gratuito.
