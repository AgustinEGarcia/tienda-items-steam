-- ==============================================================================
-- SCHEMA SQL: TIENDA DE INVENTARIOS CS2
-- Base de datos: Supabase (PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Tabla de Cuentas de Steam Vinculadas (Máximo 5 cuentas)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    steam_id VARCHAR(17) NOT NULL UNIQUE,
    alias VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger de validación: Bloquea inserciones si ya existen 5 cuentas registradas
CREATE OR REPLACE FUNCTION check_max_accounts()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM accounts) >= 5 THEN
        RAISE EXCEPTION 'Se ha alcanzado el límite máximo de 5 cuentas vinculadas permitidas para esta versión';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_max_accounts ON accounts;
CREATE TRIGGER tr_check_max_accounts
BEFORE INSERT ON accounts
FOR EACH ROW EXECUTE FUNCTION check_max_accounts();

-- 2. Tabla de Configuración Global (Registro singleton con id = 1)
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    dolar_ars_rate NUMERIC(12, 2) NOT NULL DEFAULT 1250.00,
    app_id INT NOT NULL DEFAULT 730,
    context_id INT NOT NULL DEFAULT 2,
    cache_ttl_minutes INT NOT NULL DEFAULT 60,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Registro por defecto
INSERT INTO settings (id, dolar_ars_rate, app_id, context_id, cache_ttl_minutes)
VALUES (1, 1250.00, 730, 2, 60)
ON CONFLICT (id) DO NOTHING;

-- 3. Tabla de Caché de Inventarios
CREATE TABLE IF NOT EXISTS inventory_cache (
    steam_id VARCHAR(17) PRIMARY KEY,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
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

-- Índices para búsqueda rápida y purga por expiración
CREATE INDEX IF NOT EXISTS idx_inventory_cache_expires ON inventory_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_price_cache_expires ON price_cache (expires_at);

-- 5. Permisos y Políticas de Seguridad
-- Como la aplicación opera exclusivamente mediante Route Handlers en backend autenticados por contraseña,
-- deshabilitamos RLS para permitir operaciones fluidas desde el servidor y otorgamos permisos completos.
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE price_cache DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE accounts TO anon, authenticated, service_role;
GRANT ALL ON TABLE settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE inventory_cache TO anon, authenticated, service_role;
GRANT ALL ON TABLE price_cache TO anon, authenticated, service_role;

