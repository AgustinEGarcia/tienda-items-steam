# Rol
Actúa como un Arquitecto de Software Senior especializado en la inicialización de proyectos mediante Spec-Driven Development (SDD), gobernanza de agentes de IA y Arquitectura Segura (Secure by Design).

# Contexto
Voy a comenzar un proyecto completamente DESDE CERO. Quiero configurar las bases, la estructura de carpetas, el sistema de persistencia de contexto y la primera especificación siguiendo estrictamente la guía metodológica (`Guía de Desarrollo y Estructuración con IA.md`).

El proyecto que voy a construir se trata de:
Proyecto: Aplicación web full-stack para visualización, tasación y gestión multi-cuenta de inventarios de Counter-Strike 2 (CS2) desplegada en infraestructura 100% gratuita (costo cero).

Objetivo general:
Desarrollar una plataforma web que permita a un administrador vincular múltiples cuentas de Steam públicas mediante su identificador SteamID64 (número de 17 dígitos) y configurar el App ID del juego (por defecto CS2 = 730, Context ID = 2). La aplicación consultará los inventarios de dichas cuentas, extraerá sus ítems/skins con detalles visuales, obtendrá de forma automática la referencia de precio base en dólares (USD) a través del mercado de Steam y convertirá en tiempo real los valores a pesos (ARS) mediante una tasa de cotización editable desde un panel de control.

Requerimientos funcionales:

1. Panel de Administración:
- Gestión de cuentas: Formulario CRUD para registrar, editar y eliminar cuentas de Steam mediante su SteamID64, asignando un alias a cada una (ej. "Principal", "Smurf", "Depósito").
- Configuración de juego: Campo editable para definir el App ID (730) y Context ID (2) para parametrizar las peticiones a la API de Steam.
- Configuración de divisa: Campo centralizado para ingresar y actualizar la cotización del dólar (ARS por USD). Al modificar y guardar este valor, todos los precios calculados en pesos en la plataforma deben actualizarse de forma inmediata o reactiva.
- Sincronización manual: Botón para forzar la actualización de inventarios y precios de mercado bajo demanda, respetando límites de peticiones.

2. Visualización y Catálogo de Inventario:
- Vista consolidada y filtrada: Permitir visualizar todos los ítems de todas las cuentas combinadas en una única vista general con métricas totales (valor total en USD y valor total en ARS), o filtrar individualmente por cada cuenta registrada.
- Ficha de ítem: Mostrar imagen del ítem (construida mediante Cloudflare Steam CDN economy/image), nombre completo (market_hash_name), tipo de ítem, rareza y stickers/desgaste si aplica.
- Doble valorización: Cada ítem debe reflejar su precio base en USD (obtenido de Steam) y su precio calculado en ARS según la cotización vigente.

3. Integración con Steam y Prevención de Bloqueos (Rate Limits y CORS):
- Acceso a inventarios: Utilizar el endpoint público comunitario (https://steamcommunity.com/inventory/{STEAM_ID_64}/{APP_ID}/{CONTEXT_ID}?l=spanish&count=5000). Es requisito que los perfiles e inventarios consultados estén configurados como públicos en la privacidad de Steam.
- Obtención de precios: Consultar los precios en USD mediante el endpoint de mercado de Steam (https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=...) de forma asíncrona y con demoras programadas.
- Mecanismo de protección contra Rate Limit (HTTP 429):
  * Prohibido realizar llamadas directas a Steam desde el navegador (frontend) debido a políticas de CORS y exposición de IP del usuario.
  * Todo el tráfico hacia Steam debe pasar por el backend actuando como proxy y gestor de colas.
  * Implementar almacenamiento en caché obligatorio (in-memory con node-cache o TTL local en base de datos) para guardar los datos de inventario y precios de mercado durante un lapso de 30 a 60 minutos, evitando consultas repetitivas a Valve ante cada recarga de página.
  * Implementar un rate limiter y delay entre llamadas al consultar múltiples ítems o cuentas en lote para no saturar las cuotas de IP del servidor.

Stack tecnológico y despliegue (100% Costo Cero):

- Frontend: Next.js (App Router) o React con Vite y Tailwind CSS. Alojado de forma gratuita en Vercel o Netlify (planes Free con SSL automático).
- Backend / API: Node.js (Express o Fastify) o API Routes integradas en Next.js. Si se separa el backend, alojar en Render (Web Service Free tier) o Koyeb.
- Base de datos / Persistencia: Supabase (PostgreSQL) o Turso (SQLite/libSQL), utilizando sus niveles gratuitos permanentes para almacenar las cuentas de Steam (SteamID64, alias), la configuración global (cotización del dólar, app_id, context_id) y la tabla de caché de inventarios y precios de mercado.
- Gestión de estado y caché: Caché en base de datos o memoria local del servidor para reducir a cero las dependencias de servicios de pago como Redis administrado.

Entregables esperados:
- Estructura del proyecto lista para clonar y ejecutar.
- Scripts de base de datos / migraciones para las tablas requeridas (accounts, settings, item_cache).
- Servicios de backend para interacción con Steam con manejo estricto de errores (CORS, 429 Too Many Requests, perfiles privados).
- Interfaz de usuario limpia, responsive y funcional con vistas de catálogo público y panel de administración.

# Tarea Exacta
1. **Lee y asimila** la guía metodológica `Guía de Desarrollo y Estructuración con IA.md` que te adjunto a continuación.
2. **Entrevístame (máximo 3 a 5 preguntas)** para entender el stack tecnológico, el alcance, los requisitos de seguridad/datos y la estrategia de despliegue (DevOps).
3. Con mis respuestas, **prepárame una propuesta con la estructura inicial del repositorio**, detallando el contenido sugerido para:
   - `docs/constitution.md` (6 principios innegociables, asegurando que al menos uno cubra seguridad/privacidad).
   - `AGENTS.md` (reglas permanentes, stack, política de commits y reglas *Zero Trust*).
   - `MEMORY.md` (estado inicial).
   - Estructura de carpetas (`specs/001-nombre/`, `agents/skills/`, `docs/adr/`).
   - Archivos de entorno y seguridad (ej. `.env.example`).
   - La primera versión en borrador de `specs/001-nombre/spec.md` redactada con sintaxis EARS, incluyendo los requisitos no funcionales y de seguridad.

# Restricciones Innegociables
- ⚠ **MODO PLANIFICACIÓN (DRAFT):** No crees ni escribas ningún archivo en el disco todavía. Presenta todo en la respuesta para mi revisión.
- Hazme las preguntas de a una o en un solo bloque corto antes de proponer los archivos.
- Espera mi aprobación explícita de la estructura y de los textos antes de sugerir comandos de creación de archivos.

# Formato de Salida
1. 📌 **Confirmación de Lectura:** Breve mensaje confirmando los pilares que aplicarás según `Guía de Desarrollo y Estructuración con IA.md`.
2. ❓ **Preguntas Iniciales:** Las 3 a 5 preguntas clave para definir el stack, alcance y seguridad.
3. 🛠️ **Borrador de Configuración (tras mis respuestas):** Propuesta de archivos base.
4. 🛑 **Solicitud de Aprobación:** Pedido de confirmación antes de dar el siguiente paso.

---
A continuación te adjunto/paso la guía para comenzar