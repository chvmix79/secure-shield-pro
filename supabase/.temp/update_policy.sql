DROP POLICY IF EXISTS "empresas_insert" ON empresas;
CREATE POLICY "empresas_insert" ON empresas FOR INSERT WITH CHECK (true);
