-- ============================================
-- SETUP PLANTILLAS PHISHING
-- ============================================

CREATE TABLE IF NOT EXISTS plantillas_phishing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE, -- NULL significa global
  nombre VARCHAR(255) NOT NULL,
  remitente VARCHAR(255) NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  dificultad VARCHAR(20) DEFAULT 'media' CHECK (dificultad IN ('baja', 'media', 'alta')),
  es_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE plantillas_phishing ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
DROP POLICY IF EXISTS "plantillas_select" ON plantillas_phishing;
CREATE POLICY "plantillas_select" ON plantillas_phishing FOR SELECT USING (
  es_global = TRUE OR empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin()
);

DROP POLICY IF EXISTS "plantillas_insert" ON plantillas_phishing;
CREATE POLICY "plantillas_insert" ON plantillas_phishing FOR INSERT WITH CHECK (
  empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin()
);

DROP POLICY IF EXISTS "plantillas_update" ON plantillas_phishing;
CREATE POLICY "plantillas_update" ON plantillas_phishing FOR UPDATE USING (
  empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin()
);

DROP POLICY IF EXISTS "plantillas_delete" ON plantillas_phishing;
CREATE POLICY "plantillas_delete" ON plantillas_phishing FOR DELETE USING (
  empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin()
);

-- Insertar algunas plantillas globales por defecto
INSERT INTO plantillas_phishing (nombre, remitente, asunto, contenido, dificultad, es_global)
SELECT * FROM (VALUES 
  (
    'Alerta de Seguridad Falsa', 
    'soporte@bancopopular-seguro.com', 
    '⚠️ Alerta: Su cuenta ha sido bloqueada', 
    'Estimado cliente, hemos detectado actividad sospechosa en su cuenta. Por favor verifique su identidad inmediatamente haciendo clic en el siguiente enlace para evitar el bloqueo definitivo de su cuenta.',
    'baja', 
    TRUE
  ),
  (
    'Falso Pedido Confirmado', 
    'amazon@confirmacion-pedido.xyz', 
    'Tu pedido #2847-3921 ha sido confirmado', 
    'Gracias por tu compra. Tu pedido ha sido confirmado y será enviado en 24 horas. Para rastrear tu pedido, haz clic aquí: confirmar-envio.xyz/track/2847',
    'media', 
    TRUE
  ),
  (
    'Urgencia de Facturación', 
    'facturacion@proveedor-urgente.net', 
    'Factura vencida - Acción requerida', 
    'Su factura #5521 por $1,250.00 ha vencido. Tiene 24 horas para realizar el pago antes de suspender el servicio. Pago inmediato: pagar-ahora.net/factura/5521',
    'alta', 
    TRUE
  )
) AS v(nombre, remitente, asunto, contenido, dificultad, es_global)
WHERE NOT EXISTS (
  SELECT 1 FROM plantillas_phishing WHERE es_global = TRUE
);

-- Modificar campanas_phishing para referenciar la plantilla si es necesario
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campanas_phishing' AND column_name = 'plantilla_id'
  ) THEN
    ALTER TABLE campanas_phishing ADD COLUMN plantilla_id UUID REFERENCES plantillas_phishing(id) ON DELETE SET NULL;
  END IF;
  
  -- Para programas recurrentes, también necesitamos saber qué plantilla enviar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programas_phishing' AND column_name = 'plantilla_id'
  ) THEN
    ALTER TABLE programas_phishing ADD COLUMN plantilla_id UUID REFERENCES plantillas_phishing(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Recargar cache
NOTIFY pgrst, 'reload schema';
