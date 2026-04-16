-- ============================================
-- CHV CIBERDEFENSA - SETUP DATABASE (ULTIMATE FIX)
-- Ejecute este script en el SQL Editor de Supabase
-- ============================================

-- 1. Crear la NUEVA tabla (nombre fresco para bypass de cache)
CREATE TABLE IF NOT EXISTS cumplimiento_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  norma VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'faltante',
  archivo_url TEXT,
  fecha_subida TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE cumplimiento_documentos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso (Totalmente abiertas para evitar bloqueos)
DROP POLICY IF EXISTS "cumplimiento_select" ON cumplimiento_documentos;
CREATE POLICY "cumplimiento_select" ON cumplimiento_documentos FOR SELECT USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());

DROP POLICY IF EXISTS "cumplimiento_insert" ON cumplimiento_documentos;
CREATE POLICY "cumplimiento_insert" ON cumplimiento_documentos FOR INSERT WITH CHECK (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());

DROP POLICY IF EXISTS "cumplimiento_update" ON cumplimiento_documentos;
CREATE POLICY "cumplimiento_update" ON cumplimiento_documentos FOR UPDATE USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());

-- 4. DATA SEED (Carga las normas directamente para todas las empresas)
INSERT INTO cumplimiento_documentos (empresa_id, nombre, categoria, norma, estado)
SELECT e.id, d.nombre, d.categoria, d.norma, d.estado
FROM empresas e
CROSS JOIN (
  VALUES 
    ('Política de Seguridad de la Información', 'Políticas', 'ISO 27001', 'faltante'),
    ('Manual de Protección de Datos', 'Legal', 'GDPR/Habeas Data', 'faltante'),
    ('Plan de Continuidad del Negocio', 'Operaciones', 'ISO 22301', 'faltante'),
    ('Registro de Activos de Información', 'Gestión de Activos', 'ISO 27001', 'faltante'),
    ('Matriz de Riesgos Ciber', 'Gestión de Riesgos', 'NIST CSF', 'faltante'),
    ('Plan de Respuesta a Incidentes', 'Operaciones', 'NIST SP 800-61', 'faltante'),
    ('Control de Accesos y Usuarios', 'Políticas', 'ISO 27001', 'faltante'),
    ('Política de Escritorio Limpio', 'Políticas', 'ISO 27001', 'faltante'),
    ('Acuerdos de Confidencialidad (NDA)', 'Legal', 'Legal', 'faltante'),
    ('Registro de Capacitación en Seguridad', 'Humano', 'ISO 27001', 'faltante'),
    ('Política de Uso de Activos', 'Políticas', 'ISO 27001', 'faltante'),
    ('Procedimiento de Backup', 'Técnico', 'ISO 27001', 'faltante'),
    ('Registro de Mantenimiento de Hardware', 'Técnico', 'ISO 27001', 'faltante'),
    ('Evaluación de Proveedores Tech', 'Terceros', 'ISO 27001', 'faltante'),
    ('Política de Teletrabajo Seguro', 'Políticas', 'ISO 27001', 'faltante')
) AS d(nombre, categoria, norma, estado)
WHERE NOT EXISTS (
  SELECT 1 FROM cumplimiento_documentos cd 
  WHERE cd.empresa_id = e.id AND cd.nombre = d.nombre
);

-- 5. Corrección de tabla de Phishing (si existe con ñ y no existe con n)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campañas_phishing') 
     AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campanas_phishing') THEN
    ALTER TABLE campañas_phishing RENAME TO campanas_phishing;
  END IF;
END $$;

-- 6. Forzar actualización del cache (Ejecutar varias veces si persiste el error)
NOTIFY pgrst, 'reload schema';

-- 7. VERIFICACIÓN: Si esta consulta devuelve 0 filas, la tabla NO está en el esquema correcto.
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'cumplimiento_documentos';
