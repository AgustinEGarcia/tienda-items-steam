# Plan de Arquitectura e Implementación — Spec 001
Estado: borrador

Este documento describe la arquitectura detallada, el diseño de la base de datos en Supabase, los contratos de endpoints de Next.js, las funciones puras testables y la estructura de componentes de interfaz.

---

## 1. Arquitectura General del Sistema

```mermaid
flowchart TD
    subgraph Cliente ["Cliente / Navegador (React 19)"]
        UI_Catalog["Catálogo Consolidado (/)"]
        UI_Admin["Panel de Administración (/admin)"]
        UI_State["Estado Reactivo / Contexto de Divisa (USD -> ARS)"]
    end

    subgraph Backend ["Backend Next.js (Route Handlers - Vercel)"]
        MW_Auth["Middleware de Auth (Cookie cifrada)"]
        API_Accounts["/api/accounts (CRUD hasta 5 cuentas)"]
        API_Settings["/api/settings (Cotización, AppID, ContextID)"]
        API_Inventory["/api/steam/inventory (Proxy de Inventario)"]
        API_Price["/api/steam/price (Proxy con Delay & Cola)"]
        Steam_Client["Steam HttpClient (User-Agent seguro, Read-Only)"]
    end

    subgraph Supabase ["Supabase (PostgreSQL)"]
        TB_Accounts["Tabla: accounts"]
        TB_Settings["Tabla: settings"]
        TB_InvCache["Tabla: inventory_cache (TTL 60 min)"]
        TB_PriceCache["Tabla: price_cache (TTL 60 min)"]
    end

    subgraph Steam ["Steam Community (Público)"]
        Steam_InvAPI["steamcommunity.com/inventory/..."]
        Steam_PriceAPI["steamcommunity.com/market/priceoverview/..."]
    end

    UI_Catalog -->|Lectura pública| API_Inventory
    UI_Catalog -->|Lectura pública| API_Price
    UI_Catalog -->|Lectura pública| API_Settings
    UI_Admin -->|Requiere sesión| MW_Auth
    MW_Auth --> API_Accounts
    MW_Auth --> API_Settings

    API_Accounts <--> TB_Accounts
    API_Settings <--> TB_Settings

    API_Inventory <--> TB_InvCache
    API_Price <--> TB_PriceCache

    API_Inventory -->|Si expiró o force=true| Steam_Client
    API_Price -->|Si no cacheado (delay 2.5s)| Steam_Client
    Steam_Client --> Steam_InvAPI
    Steam_Client --> Steam_PriceAPI
```

---

## 2. Esquema de Base de Datos (Supabase PostgreSQL)

Script DDL para ejecutar en el editor SQL de Supabase:

```sql
-- 1. Tabla de Cuentas Gestionadas (Máximo 5)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    steam_id VARCHAR(17) NOT NULL UNIQUE,
    alias VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Constraint para no superar 5 cuentas
CREATE OR REPLACE FUNCTION check_max_accounts()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM accounts) >= 5 THEN
        RAISE EXCEPTION 'Se ha alcanzado el límite máximo de 5 cuentas vinculadas';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_check_max_accounts
BEFORE INSERT ON accounts
FOR EACH ROW EXECUTE FUNCTION check_max_accounts();

-- 2. Tabla de Configuración Global (Registro único id = 1)
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    dolar_ars_rate NUMERIC(12, 2) NOT NULL DEFAULT 1250.00,
    app_id INT NOT NULL DEFAULT 730,
    context_id INT NOT NULL DEFAULT 2,
    cache_ttl_minutes INT NOT NULL DEFAULT 60,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insertar configuración inicial por defecto si no existe
INSERT INTO settings (id, dolar_ars_rate, app_id, context_id, cache_ttl_minutes)
VALUES (1, 1250.00, 730, 2, 60)
ON CONFLICT (id) DO NOTHING;

-- 3. Tabla de Caché de Inventarios
CREATE TABLE IF NOT EXISTS inventory_cache (
    steam_id VARCHAR(17) PRIMARY KEY,
    items JSONB NOT NULL,
    item_count INT NOT NULL DEFAULT 0,
    is_private BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 4. Tabla de Caché de Precios de Mercado
CREATE TABLE IF NOT EXISTS price_cache (
    market_hash_name TEXT PRIMARY KEY,
    price_usd NUMERIC(10, 2),
    raw_response JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_inventory_cache_expires ON inventory_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_price_cache_expires ON price_cache (expires_at);
```

---

## 3. Funciones Puras y Lógica a Testear (TDD)

Ubicadas en `src/lib/domain/`:

1. **`validateSteamId(steamId: string): boolean`**
   - Comprueba que la cadena tenga exactamente 17 dígitos y comience con `765611`.
2. **`calculateArsPrice(priceUsd: number, rate: number): number`**
   - Multiplica y redondea a 2 decimales evitando errores de punto flotante de JavaScript.
3. **`parseSteamInventory(rawSteamPayload: any): SteamItem[]`**
   - Cruza la lista de `assets` con `descriptions` usando `classid` e `instanceid`.
   - Extrae: `assetid`, `market_hash_name`, `name`, `type`, `rarity_color`, `icon_url`, `wear_exterior` (si aplica) y lista de stickers.
4. **`isCacheExpired(expiresAt: string | Date): boolean`**
   - Verifica si la marca de tiempo expiró frente a la hora UTC actual.

---

## 4. Contratos de API (Route Handlers)

### A. Autenticación (`/api/auth`)
- `POST /api/auth/login`: Recibe `{ password: string }`. Valida con `process.env.ADMIN_PASSWORD`. Retorna cookie HTTP-only `admin_session`.
- `POST /api/auth/logout`: Elimina la cookie de sesión.
- `GET /api/auth/me`: Verifica si la sesión es válida.

### B. Configuración (`/api/settings`)
- `GET /api/settings`: Retorna la cotización y parámetros vigentes `{ dolar_ars_rate, app_id, context_id }`.
- `PUT /api/settings`: Requiere auth. Valida con esquema Zod `{ dolar_ars_rate: z.number().positive() }`.

### C. Cuentas (`/api/accounts`)
- `GET /api/accounts`: Retorna lista de cuentas `[{ id, steam_id, alias, is_active }]`.
- `POST /api/accounts`: Requiere auth. Valida `{ steam_id: z.string().length(17), alias: z.string().min(1).max(50) }`.
- `DELETE /api/accounts/[id]`: Requiere auth. Elimina la cuenta y purga su entrada en `inventory_cache`.

### D. Inventario Proxy (`/api/steam/inventory?steamId=...&force=false`)
- **Paso 1:** Valida `steamId` (17 dígitos).
- **Paso 2:** Si `force !== 'true'`, consulta `inventory_cache`. Si existe y `expires_at > now()`, devuelve datos cacheados.
- **Paso 3:** Si no está en caché, consulta `https://steamcommunity.com/inventory/{steamId}/{appId}/{contextId}?l=spanish&count=5000`.
- **Paso 4:** Si Steam devuelve error de privacidad, guarda `is_private = true` en caché por 15 min y responde con status 200 `{ isPrivate: true, items: [] }`.
- **Paso 5:** Si Steam devuelve éxito, procesa los ítems con `parseSteamInventory`, guarda en Supabase con `expires_at = now() + 60 min` y responde.

### E. Precio Proxy (`/api/steam/price?marketHashName=...`)
- **Paso 1:** Valida parámetro `marketHashName`.
- **Paso 2:** Consulta `price_cache`. Si existe y `expires_at > now()`, devuelve el precio en USD al instante.
- **Paso 3:** Si no está cacheado:
  - Encola la petición en el gestor de colas con delay mínimo de 2.500ms.
  - Consulta `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=...`.
  - Parsea el precio en dólares (`lowest_price` o `median_price`).
  - Guarda en `price_cache` con TTL de 60 minutos.
  - Si Steam retorna 429: aplica backoff y retorna `{ error: 'Rate limit excedido temporalmente', priceUsd: null }` sin romper el flujo.

---

## 5. Diseño de Componentes de UI (Frontend)

- **`Navbar`:** Barra superior con switch de vista (Catálogo / Admin), indicador visual de la cotización actual (ej. `1 USD = $1.250 ARS`) y botón de acceso rápido.
- **`MetricsSummary`:** Tarjetas con el valor total acumulado del inventario en USD y en ARS, total de ítems contabilizados y cantidad de cuentas activas.
- **`AccountFilterBar`:** Pestañas/chips para alternar entre "Todas las cuentas" y cada cuenta individual por su alias.
- **`InventoryGrid`:** Grilla responsiva de tarjetas de ítems (`ItemCard`).
- **`ItemCard`:**
  - Borde coloreado según la rareza del ítem de CS2 (Gris, Azul, Morado, Rosa, Rojo, Oro/Cuchillos).
  - Imagen en alta resolución provista por Cloudflare Steam CDN (`https://community.cloudflare.steamstatic.com/economy/image/{icon_url}`).
  - Nombre completo y desgaste (*Factory New*, *Field-Tested*, etc.).
  - Doble etiqueta de precio: Badge en USD y Badge destacado en ARS.
  - Indicador de estado de cotización (Cargando precio, Precio cacheado o No comercializable).
- **`AdminModal / AdminDashboard`:**
  - Login rápido con contraseña maestra.
  - Tabla de cuentas vinculadas con opción de añadir (contador 2/5 cuentas) y eliminar.
  - Formulario de actualización de la cotización del dólar con confirmación inmediata.
  - Botón "Forzar sincronización de inventarios".

---

## 6. Manejo de Errores y Vectores de Fallo

| Vector de Fallo | Comportamiento del Sistema |
| :--- | :--- |
| Steam responde HTTP 429 Too Many Requests | Se pausa la cola externa por 60 segundos, se notifica en UI con badge ámbar *"Steam saturado, mostrando precios cacheados"* y se devuelve la última caché. |
| El inventario de una cuenta está en Privado | Se informa amigablemente *"Esta cuenta tiene el inventario privado en Steam. Ve a Privacidad de Steam y configúralo como Público para visualizarlo"*. |
| El dólar ingresado es negativo o NaN | Zod rechaza la petición en el backend y la UI muestra error de validación inmediato. |
| SteamID ingresado con formato incorrecto | Zod rechaza antes de consultar base de datos o Steam (`"El SteamID64 debe tener 17 dígitos numéricos"`). |
| Supabase temporalmente inalcanzable | Los Route Handlers capturan el error y retornan código 503 Service Unavailable con mensaje seguro sin filtrar credenciales. |
