-- Crear tabla de plantillas de phishing
CREATE TABLE IF NOT EXISTS public.plantillas_phishing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    remitente TEXT NOT NULL,
    asunto TEXT NOT NULL,
    cuerpo TEXT NOT NULL,
    nivel_dificultad TEXT CHECK (nivel_dificultad IN ('fácil', 'medio', 'difícil')) DEFAULT 'medio',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.plantillas_phishing ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para plantillas_phishing
CREATE POLICY "Plantillas visibles para usuarios de la empresa" ON public.plantillas_phishing
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.usuarios WHERE empresa_id = plantillas_phishing.empresa_id
        )
    );

CREATE POLICY "Los admins pueden insertar plantillas" ON public.plantillas_phishing
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.usuarios 
            WHERE empresa_id = plantillas_phishing.empresa_id AND rol = 'admin'
        )
    );

CREATE POLICY "Los admins pueden actualizar plantillas" ON public.plantillas_phishing
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM public.usuarios 
            WHERE empresa_id = plantillas_phishing.empresa_id AND rol = 'admin'
        )
    );

CREATE POLICY "Los admins pueden eliminar plantillas" ON public.plantillas_phishing
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM public.usuarios 
            WHERE empresa_id = plantillas_phishing.empresa_id AND rol = 'admin'
        )
    );

-- Modificar programas_phishing para incluir la plantilla seleccionada
ALTER TABLE public.programas_phishing 
ADD COLUMN IF NOT EXISTS plantilla_id UUID REFERENCES public.plantillas_phishing(id) ON DELETE SET NULL;
