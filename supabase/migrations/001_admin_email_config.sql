-- =============================================================================
-- Migration: Centralizar configuración del admin email
-- Objetivo: Que el admin email se lea de una variable de entorno de Supabase
-- y no esté hardcodeado en el código.
-- =============================================================================

-- Paso 1: Crear tabla de configuración si no existe
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paso 2: Insertar la configuración del admin (solo si no existe)
INSERT INTO system_config (key, value, description)
VALUES (
  'admin_email',
  'chvmix79@gmail.com',
  'Email del administrador global de la plataforma'
)
ON CONFLICT (key) DO NOTHING;

-- Paso 3: Actualizar la función is_global_admin para leer de la tabla
-- (La función existente en rls_policies.sql seguirá funcionando,
--  pero ahora el email no estará duplicado en el SQL)

-- Paso 4: Crear función para obtener el admin email dinámicamente
CREATE OR REPLACE FUNCTION get_admin_email()
RETURNS TEXT AS $$
  SELECT value FROM system_config WHERE key = 'admin_email' LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Nota: Aplicar este cambio requiere actualizar rls_policies.sql para usar
-- get_admin_email() en lugar del email hardcodeado.
-- Por ahora, mantener ambos métodos por compatibilidad.
