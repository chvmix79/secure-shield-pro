-- Crear usuario administrador
INSERT INTO empresas (nombre, sector, empleados, nivel_tech, email)
VALUES ('CiberSegura Admin', 'Tecnología', '1-10', 'alto', 'admin@cibersegura.com')
ON CONFLICT DO NOTHING;

-- Obtener id de la empresa admin
-- Luego crear usuario con auth
SELECT * FROM empresas WHERE email = 'admin@cibersegura.com';
