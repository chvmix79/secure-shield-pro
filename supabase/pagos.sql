-- Tabla de solicitudes de pago
CREATE TABLE IF NOT EXISTS solicitudes_pago (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'basic', 'pro')),
  metodo VARCHAR(50) NOT NULL CHECK (metodo IN ('transferencia', 'consignacion', 'nequi', 'daviplata')),
  monto INTEGER NOT NULL,
  fecha_solicitud TIMESTAMPTZ DEFAULT NOW(),
  comprobante_url TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  fecha_pago TIMESTAMPTZ,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_solicitudes_pago_empresa ON solicitudes_pago(empresa_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_pago_estado ON solicitudes_pago(estado);