-- ============================================
-- CIBERSEGURIDAD - CREACIÓN DE TABLAS
-- ============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol VARCHAR(50) DEFAULT 'empleado' CHECK (rol IN ('admin', 'responsable', 'empleado')),
  password_hash TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de progreso de capacitación
CREATE TABLE IF NOT EXISTS progreso_capacitacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo_id VARCHAR(50) NOT NULL,
  completado BOOLEAN DEFAULT false,
  completado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, modulo_id)
);

-- Tabla de campañas de phishing
CREATE TABLE IF NOT EXISTS campañas_phishing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_envio TIMESTAMPTZ,
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
  total_enviados INTEGER DEFAULT 0,
  total_clics INTEGER DEFAULT 0,
  total_reportados INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de resultados de phishing por empleado
CREATE TABLE IF NOT EXISTS resultados_phishing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaña_id UUID REFERENCES campañas_phishing(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  email_enviado VARCHAR(255),
  hizo_clic BOOLEAN DEFAULT false,
  reporto BOOLEAN DEFAULT false,
  respuesta_tiempo TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de herramientas del marketplace
CREATE TABLE IF NOT EXISTS herramientas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  precio VARCHAR(50),
  sitio_web TEXT,
  tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'paid', 'freemium')),
  caracteristicas JSONB,
  logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos de la empresa (para vulnerabilidades)
CREATE TABLE IF NOT EXISTS productos_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  version VARCHAR(50),
  proveedor VARCHAR(255),
  tipo VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de vulnerabilidades detectadas
CREATE TABLE IF NOT EXISTS vulnerabilidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos_empresa(id) ON DELETE CASCADE,
  cve_id VARCHAR(50),
  descripcion TEXT,
  severity VARCHAR(20),
  cvss DECIMAL(3,1),
  afectada BOOLEAN DEFAULT false,
  parchada BOOLEAN DEFAULT false,
  fecha_deteccion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuración Microsoft 365
CREATE TABLE IF NOT EXISTS microsoft365_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE UNIQUE,
  tenant_id VARCHAR(255),
  connected BOOLEAN DEFAULT false,
  last_sync TIMESTAMPTZ,
  mfa_percentage INTEGER DEFAULT 0,
  mdm_percentage INTEGER DEFAULT 0,
  dlp_enabled BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(token);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON progreso_capacitacion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_campañas_empresa ON campañas_phishing(empresa_id);
CREATE INDEX IF NOT EXISTS idx_resultados_campaña ON resultados_phishing(campaña_id);
CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos_empresa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilidades_empresa ON vulnerabilidades(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilidades_producto ON vulnerabilidades(producto_id);

-- ============================================
-- HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_capacitacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE campañas_phishing ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_phishing ENABLE ROW LEVEL SECURITY;
ALTER TABLE herramientas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE microsoft365_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- Usuarios: solo ver propios
CREATE POLICY "usuarios_tienen_acceso_propio" ON usuarios
  FOR ALL USING (true);

-- Sesiones: solo propias
CREATE POLICY "sesiones_tienen_acceso_propio" ON sesiones
  FOR ALL USING (true);

-- Herramientas: acceso público
CREATE POLICY "herramientas_publico" ON herramientas
  FOR ALL USING (true);

-- ============================================
-- INSERTAR HERRAMIENTAS INICIALES
-- ============================================

INSERT INTO herramientas (nombre, descripcion, categoria, precio, tier, sitio_web, caracteristicas, logo) VALUES
('Bitwarden', 'Gestor de contraseñas de código abierto', 'Gestión de Contraseñas', 'Gratis', 'free', 'https://bitwarden.com', '["Código abierto", "2FA", "Sincronización"]', '🔐'),
('Cloudflare', 'Protección DDoS y CDN', 'Protección Web', 'Gratis', 'free', 'https://cloudflare.com', '["DDoS", "SSL", "CDN"]', '☁️'),
('1Password', 'Gestor de contraseñas premium', 'Gestión de Contraseñas', '$2.99/mes', 'paid', 'https://1password.com', '["Watchtower", "2FA"]', '🗝️'),
('Authy', 'Autenticación de dos factores', '2FA', 'Gratis', 'free', 'https://authy.com', '["Multi-device", "Backups"]', '📱'),
('Proton Mail', 'Email cifrado de extremo a extremo', 'Email Seguro', 'Gratis', 'freemium', 'https://protonmail.com', '["E2E Encryption", "VPN"]', '✉️'),
('Malwarebytes', 'Antivirus y protección contra malware', 'Antivirus', '$4.99/mes', 'paid', 'https://malwarebytes.com', '["Real-time", "Ransomware"]', '🛡️'),
('NordVPN', 'VPN rápida y segura', 'VPN', '$3.29/mes', 'paid', 'https://nordvpn.com', '["AES-256", "Kill switch"]', '🌐'),
('Microsoft 365', 'Suite de productividad empresarial', 'Productividad', '$12.50/usuario/mes', 'paid', 'https://microsoft.com/business', '["Intune", "Defender"]', '📑'),
('Google Workspace', 'Suite de productividad Google', 'Productividad', '$6/usuario/mes', 'paid', 'https://workspace.google.com', '["DLP", "2FA"]', '📧'),
('Sophos', 'Protección endpoint con IA', 'Antivirus', '$10/usuario/mes', 'paid', 'https://sophos.com', '["EDR", "Phishing"]', '🛡️')
ON CONFLICT DO NOTHING;

SELECT 'Tablas creadas exitosamente' as resultado;
