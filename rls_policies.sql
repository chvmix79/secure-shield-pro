-- Función para verificar si es admin global
CREATE OR REPLACE FUNCTION is_global_admin()
RETURNS BOOLEAN AS $$
  SELECT auth.jwt() ->> 'email' = 'chvmix79@gmail.com';
$$ LANGUAGE sql SECURITY DEFINER;

-- Activar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE acciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- ============================================
-- POLÍTICAS DE ELIMINACIÓN (SOLO ADMIN GLOBAL)
-- ============================================
CREATE POLICY "empresas_delete" ON empresas FOR DELETE USING (is_global_admin());
CREATE POLICY "diagnosticos_delete" ON diagnosticos FOR DELETE USING (is_global_admin());
CREATE POLICY "acciones_delete" ON acciones FOR DELETE USING (is_global_admin());
CREATE POLICY "evidencias_delete" ON evidencias FOR DELETE USING (is_global_admin());
CREATE POLICY "alertas_delete" ON alertas FOR DELETE USING (is_global_admin());
CREATE POLICY "configuraciones_delete" ON configuraciones FOR DELETE USING (is_global_admin());
CREATE POLICY "usuarios_delete" ON usuarios FOR DELETE USING (is_global_admin());

-- ============================================
-- POLÍTICAS DE LECTURA / INSERCIÓN / ACTUALIZACIÓN
-- ============================================

-- EMPRESAS: propia o admin
CREATE POLICY "empresas_select" ON empresas FOR SELECT USING (user_id = auth.uid() OR is_global_admin());
CREATE POLICY "empresas_insert" ON empresas FOR INSERT WITH CHECK (user_id = auth.uid() OR is_global_admin());
CREATE POLICY "empresas_update" ON empresas FOR UPDATE USING (user_id = auth.uid() OR is_global_admin());

-- DIAGNOSTICOS: propia empresa o admin
CREATE POLICY "diagnosticos_select" ON diagnosticos FOR SELECT 
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());
CREATE POLICY "diagnosticos_insert" ON diagnosticos FOR INSERT 
  WITH CHECK (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());

-- ACCIONES: propia empresa o admin
CREATE POLICY "acciones_select" ON acciones FOR SELECT 
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());
CREATE POLICY "acciones_insert" ON acciones FOR INSERT 
  WITH CHECK (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());
CREATE POLICY "acciones_update" ON acciones FOR UPDATE 
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());

-- EVIDENCIAS: propia empresa o admin
CREATE POLICY "evidencias_select" ON evidencias FOR SELECT 
  USING (accion_id IN (SELECT a.id FROM acciones a JOIN empresas e ON a.empresa_id = e.id WHERE e.user_id = auth.uid() OR is_global_admin()));
CREATE POLICY "evidencias_insert" ON evidencias FOR INSERT 
  WITH CHECK (accion_id IN (SELECT a.id FROM acciones a JOIN empresas e ON a.empresa_id = e.id WHERE e.user_id = auth.uid() OR is_global_admin()));

-- ALERTAS: propia empresa o admin
CREATE POLICY "alertas_select" ON alertas FOR SELECT 
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());
CREATE POLICY "alertas_update" ON alertas FOR UPDATE 
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());

-- CONFIGURACIONES: propia empresa o admin
CREATE POLICY "configuraciones_select" ON configuraciones FOR SELECT 
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());
CREATE POLICY "configuraciones_insert" ON configuraciones FOR INSERT 
  WITH CHECK (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());
CREATE POLICY "configuraciones_update" ON configuraciones FOR UPDATE 
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());

-- USUARIOS: propia empresa o admin
CREATE POLICY "usuarios_select" ON usuarios FOR SELECT 
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());
CREATE POLICY "usuarios_insert" ON usuarios FOR INSERT 
  WITH CHECK (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());
CREATE POLICY "usuarios_update" ON usuarios FOR UPDATE 
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()) OR is_global_admin());
