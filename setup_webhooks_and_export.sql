-- ============================================
-- SETUP WEBHOOKS INTEGRATION
-- ============================================

CREATE TABLE IF NOT EXISTS integraciones_webhook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  proveedor VARCHAR(100) NOT NULL, -- ej: 'wazuh', 'crowdstrike', 'custom'
  secret_token VARCHAR(255) NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE integraciones_webhook ENABLE ROW LEVEL SECURITY;

-- Políticas para integraciones
DROP POLICY IF EXISTS "integraciones_select" ON integraciones_webhook;
CREATE POLICY "integraciones_select" ON integraciones_webhook FOR SELECT USING (
  empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin()
);

DROP POLICY IF EXISTS "integraciones_insert" ON integraciones_webhook;
CREATE POLICY "integraciones_insert" ON integraciones_webhook FOR INSERT WITH CHECK (
  empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin()
);

DROP POLICY IF EXISTS "integraciones_update" ON integraciones_webhook;
CREATE POLICY "integraciones_update" ON integraciones_webhook FOR UPDATE USING (
  empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin()
);

DROP POLICY IF EXISTS "integraciones_delete" ON integraciones_webhook;
CREATE POLICY "integraciones_delete" ON integraciones_webhook FOR DELETE USING (
  empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin()
);

-- Asegurarse de que el token es único y se genere correctamente en front, 
-- pero el DB schema ya tiene UNIQUE en secret_token.
