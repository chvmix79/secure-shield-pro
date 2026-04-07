-- Agregar campos de suscripción a empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro'));
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS fecha_inicio TIMESTAMPTZ;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS fecha_fin TIMESTAMPTZ;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cuenta_bloqueada BOOLEAN DEFAULT FALSE;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS fecha_bloqueo TIMESTAMPTZ;

-- Agregar foreign key constraint si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'empresas_user_id_fkey' 
    AND table_name = 'empresas'
  ) THEN
    ALTER TABLE empresas ADD CONSTRAINT empresas_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Actualizar empresas existentes con plan free
UPDATE empresas SET plan = 'free' WHERE plan IS NULL;

-- Índice para buscar empresas por user_id
CREATE INDEX IF NOT EXISTS idx_empresas_user_id ON empresas(user_id);

-- Asegurar que cada usuario solo pueda tener una empresa
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'empresas_user_id_unique'
  ) THEN
    ALTER TABLE empresas ADD CONSTRAINT empresas_user_id_unique UNIQUE (user_id);
  END IF;
END $$;