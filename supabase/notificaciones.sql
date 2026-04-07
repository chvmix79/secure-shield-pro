-- Tabla para registrar notificaciones enviadas
CREATE TABLE IF NOT EXISTS notificaciones_suscripcion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('recordatorio_renovacion', 'vencimiento_inminente', 'suscripcion_vencida', 'suscripcion_bloqueada')),
  fecha_envio TIMESTAMPTZ DEFAULT NOW(),
  leida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar campo de cuenta bloqueada a empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cuenta_bloqueada BOOLEAN DEFAULT FALSE;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS fecha_bloqueo TIMESTAMPTZ;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_notificaciones_suscripcion_empresa ON notificaciones_suscripcion(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_suscripcion_tipo ON notificaciones_suscripcion(tipo);
