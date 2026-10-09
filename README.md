# 🔫 CS2 Inventory Hub — Tasación & Gestión Multi-cuenta

Plataforma web full-stack para visualización, tasación y gestión multi-cuenta de inventarios de **Counter-Strike 2 (CS2)** con conversión de divisas en tiempo real (USD a ARS) desplegada en infraestructura **100% gratuita (Costo Cero)** y diseñada bajo principios de **Secure by Design** e **Inmunidad Steam**.

---

## ⚡ Características Principales

- **Multi-cuenta Consolidado:** Vincula hasta 5 cuentas públicas de Steam mediante su identificador numérico de 17 dígitos (`SteamID64`).
- **Doble Valorización Reactiva:** Cada skin refleja su precio base en USD (obtenido del mercado comunitario de Steam) y su precio convertido en ARS mediante una cotización de dólar editable centralmente.
- **Blindaje Anti-Rate-Limit (Zero Ban):**
  - **Read-Only Pasivo:** Nunca solicita contraseñas, Steam Guard ni API Keys personales. Cero riesgo para tus cuentas de Steam.
  - **Caché Persistente en Supabase (TTL 60 min):** Almacenamiento persistente que previene pérdida de memoria en Vercel Serverless.
  - **Cola con Delay Programado (2.5s):** Consulta de precios individual con desaceleración forzada y período de enfriamiento ante HTTP 429.
- **Panel de Administración Protegido:** Gestión CRUD de cuentas, edición soberana del tipo de cambio y sincronización forzada bajo demanda protegida con clave maestra y sesión HTTP-only.
- **Estética Inmersiva CS2:** Tema oscuro con acentos dorados/ámbar, badges de rareza oficiales con colores hexadecimales de Valve e imágenes en alta resolución servidas por Cloudflare Steam CDN.

---

## 🛠️ Stack Tecnológico (100% Gratuito)

| Capa | Tecnología | Nivel Gratuito / Proveedor |
| :--- | :--- | :--- |
| **Frontend & Backend** | Next.js 16 (App Router, React 19, TS) | Vercel (Hobby Tier - Costo Cero) |
| **Estilos & UI** | Tailwind CSS v4 + Lucide Icons | Incluido en bundle estático |
| **Base de Datos & Caché** | Supabase (PostgreSQL) | Supabase Free Tier (500 MB) |
| **Validación & Seguridad**| Zod + HMAC SHA-256 | Zero Trust |
| **Test Runner** | Vitest | Tests unitarios y de integración |

---

## 🚀 Puesta en Marcha Local

### 1. Prerrequisitos
- Node.js 20+ (recomendado Node 22 o 24).
- Cuenta gratuita en [Supabase](https://supabase.com).

### 2. Configurar la Base de Datos en Supabase
1. Crea un nuevo proyecto gratuito en el dashboard de Supabase.
2. Abre el **SQL Editor** en Supabase y ejecuta el contenido completo del script:
   👉 [`supabase/schema.sql`](./supabase/schema.sql)
   *(Crea las tablas `accounts`, `settings`, `inventory_cache`, `price_cache` y los triggers de restricción de 5 cuentas).*

### 3. Configurar Variables de Entorno
Copia la plantilla y renómbrala como `.env.local`:
```bash
cp .env.example .env.local
```
Completa los datos de conexión obtenidos de tu proyecto de Supabase (Settings -> API):
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
ADMIN_PASSWORD=tu_clave_secreta_aqui
SESSION_SECRET=un_string_aleatorio_muy_largo_y_seguro_de_32_caracteres
```

### 4. Instalar y Ejecutar
```bash
# Instalar dependencias
npm install

# Correr suite de tests automatizados
npm test

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ☁️ Despliegue en Vercel (1 Clic)

1. Sube este repositorio a tu cuenta de GitHub.
2. Importa el proyecto en [Vercel](https://vercel.com/new).
3. En la sección **Environment Variables**, añade las mismas variables que configuraste en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
4. Pulsa **Deploy**. ¡Tu plataforma estará online con certificado SSL gratuito y costo cero!

---

## 🔒 Metodología de Gobernanza (SDD)

Este proyecto fue desarrollado bajo la metodología **Spec-Driven Development (SDD)**:
- [docs/constitution.md](./docs/constitution.md): 6 Principios innegociables.
- [AGENTS.md](./AGENTS.md): Reglas de gobernanza para agentes de IA.
- [MEMORY.md](./MEMORY.md): Memoria evolutiva del proyecto.
- [specs/001-gestion-inventarios/](./specs/001-gestion-inventarios/): Especificación formal EARS, plan arquitectónico y checklist de tareas.
