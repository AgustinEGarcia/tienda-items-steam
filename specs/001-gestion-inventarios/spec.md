# Spec 001 — Visualización, Tasación y Gestión Multi-cuenta de Inventarios CS2
Estado: implementada

## Contexto, Usuarios e Historias
El Administrador de la plataforma posee entre 1 y 5 cuentas de Steam con inventarios públicos de Counter-Strike 2 (CS2). Desea visualizar en un único catálogo unificado el valor total de sus skins en dólares (USD) y en pesos argentinos (ARS) mediante una cotización editable, garantizando total inmunidad de sus cuentas y protegiendo el servidor ante los límites de peticiones de Valve.

- **HU-1 (Gestión de Cuentas):** Como administrador, quiero registrar y administrar hasta 5 cuentas de Steam mediante su SteamID64 para consolidar mis inventarios en un solo lugar.
- **HU-2 (Control de Divisa):** Como administrador, quiero definir una cotización personalizada de USD a ARS para que el valor en pesos se calcule automáticamente en todo el sistema.
- **HU-3 (Catálogo y Tasación):** Como usuario, quiero ver las skins de mis cuentas con su imagen oficial, desgaste, nombre y precio doble (USD y ARS).

## Definiciones, Casos Límite y Fuera de Alcance
- **SteamID64:** Cadena numérica pública de exactamente 17 dígitos (ej. `76561198...`).
- **Límite de Cuentas:** Máximo 5 cuentas vinculadas en esta versión.
- **Fuera de Alcance (v1):** 
  - Autenticación multi-usuario con Supabase Auth (se mantiene para v2).
  - Compra/venta o intercambios directos de ítems.
  - Juegos distintos a CS2 (AppID 730, ContextID 2).
- **Casos Límite:**
  - Perfil de Steam con inventario privado: El sistema debe informar el estado sin bloquear el resto de la aplicación.
  - HTTP 429 Too Many Requests de Steam: El backend debe activar backoff y devolver el último precio en caché disponible.
  - Cotización del dólar con valor 0 o negativo: Debe rechazarse en la validación.
  - Ítems sin precio de mercado (ej. medallas de servicio, trofeos no comercializables): Se deben listar con precio $0 o "No comercializable" sin romper los cálculos.

## Requisitos No Funcionales y de Seguridad
- **RNF-1 (Zero Trust):** Todos los inputs deben validarse con esquemas Zod antes de ser procesados o almacenados.
- **RNF-2 (Inmunidad Total de Cuentas Steam):** La plataforma opera exclusivamente en modo Read-Only Anónimo con SteamID64. Queda prohibido solicitar o almacenar credenciales, contraseñas, Steam Guard, Trade URLs o Steam Web API Keys personales.
- **RNF-3 (Blindaje Anti-Bloqueo de Servidor):** Las peticiones al endpoint de precios de Steam deben respetar un delay forzado mínimo de 2.5 segundos entre llamadas no cacheadas.
- **RNF-4 (Persistencia de Caché):** Los datos de inventario y precios deben persistirse en Supabase con un TTL de 60 minutos.
- **RNF-5 (Seguridad del Panel Admin):** La ruta `/admin` y sus endpoints asociados deben exigir autenticación mediante cookie de sesión cifrada validada contra `ADMIN_PASSWORD`.
- **RNF-6 (Rendimiento Serverless):** Las funciones proxy en Vercel deben responder en menos de 500ms cuando los datos residen en caché.

## Requisitos Funcionales (Sintaxis EARS)

### Panel de Administración
- **RF-1 (Alta de Cuenta):** CUANDO el administrador envía un SteamID64 válido y un alias, EL SISTEMA registra la cuenta en Supabase siempre que no se supere el límite de 5 cuentas.
- **RF-2 (Validación de SteamID64):** SI el administrador ingresa un SteamID64 que no contenga exactamente 17 dígitos numéricos, ENTONCES EL SISTEMA rechaza la solicitud e informa el error de formato.
- **RF-3 (Límite Máximo de Cuentas):** SI el administrador intenta registrar una sexta cuenta, ENTONCES EL SISTEMA bloquea el registro notificando que se alcanzó el límite máximo de 5 cuentas para la versión actual.
- **RF-4 (Edición y Baja de Cuentas):** CUANDO el administrador edita el alias o elimina una cuenta registrada, EL SISTEMA actualiza o purga el registro y sus asociaciones de inventario correspondientes.
- **RF-5 (Actualización de Cotización):** CUANDO el administrador guarda una nueva tasa de cambio USD a ARS (valor numérico positivo), EL SISTEMA actualiza la configuración global y recalcula reactivamente los valores en pesos.
- **RF-6 (Acceso No Autorizado):** SI un usuario sin sesión activa intenta acceder a una acción o endpoint de `/admin`, ENTONCES EL SISTEMA bloquea el acceso con código HTTP 401 Unauthorized.
- **RF-7 (Sincronización Manual):** CUANDO el administrador pulsa "Forzar Sincronización", EL SISTEMA invalida selectivamente la caché de la cuenta indicada y consulta nuevamente a Steam respetando las colas con delay.

### Integración con Steam y Caché
- **RF-8 (Consulta de Inventario con Caché):** CUANDO se solicita el inventario de una cuenta, EL SISTEMA verifica si existe una copia en Supabase con menos de 60 minutos de antigüedad; si existe, la retorna directamente sin consultar a Steam.
- **RF-9 (Manejo de Perfil Privado):** SI la API de Steam responde que el inventario está privado o no disponible, ENTONCES EL SISTEMA marca la cuenta con estado "Inventario Privado" y notifica al usuario sin abortar la ejecución.
- **RF-10 (Manejo de Rate Limit 429):** SI la API de Steam retorna HTTP 429 Too Many Requests, ENTONCES EL SISTEMA interrumpe temporalmente las llamadas externas, registra el incidente y sirve los datos previamente cacheados disponibles.
- **RF-11 (Obtención de Precios On-Demand / Paginada):** CUANDO se listan ítems que no poseen precio en caché, EL SISTEMA encola la petición de precio individual con una separación mínima de 2.5 segundos, guardando el resultado en Supabase.

### Catálogo y Visualización
- **RF-12 (Vista Consolidada):** MIENTRAS el usuario esté en la vista general, EL SISTEMA muestra la lista combinada de ítems de todas las cuentas activas con el total consolidado en USD y ARS.
- **RF-13 (Filtrado por Cuenta):** CUANDO el usuario selecciona un alias de cuenta específico en el selector, EL SISTEMA filtra los ítems y recalcula los totales mostrando exclusivamente los de dicha cuenta.
- **RF-14 (Ficha de Ítem):** EL SISTEMA renderiza para cada ítem su imagen CDN de Steam Cloudflare, nombre comercial (`market_hash_name`), rareza/categoría y stickers o exterior/desgaste si aplica.
- **RF-15 (Doble Valorización):** EL SISTEMA calcula y muestra permanentemente en cada ítem su precio base en USD y su equivalente en ARS (`precio_usd * cotizacion_ars`).
