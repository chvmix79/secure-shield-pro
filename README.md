# CHV CyberDefense - Sistema de Gestión de Ciberseguridad

Aplicación web integral para la gestión de seguridad cibernética, desarrollada para CHV CyberDefense.

## Características

- **Dashboard**: Visualización de métricas y estado de seguridad
- **Gestión de Incidentes**: Registro y seguimiento de incidentes de seguridad
- **Análisis de Vulnerabilidades**: Seguimiento de vulnerabilidades identificadas
- **Administración de Usuarios**: Control de acceso basado en roles
- **Reportes**: Generación de reportes en PDF
- **Integración con Azure AD**: Autenticación empresarial

## Tecnologías

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions

## Configuración del Entorno

1. Clonar el repositorio
2. Copiar `.env.example` a `.env` y configurar las variables:
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   VITE_ADMIN_EMAIL=email_del_admin
   ```
3. Instalar dependencias: `npm install`
4. Ejecutar: `npm run dev`

## Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run test` - Ejecutar tests unitarios
- `npm run lint` - Verificar código con ESLint
- `npm run preview` - Previsualizar build de producción

## Despliegue

El proyecto está configurado para desplegar automáticamente mediante GitHub Actions al hacer push a las ramas `main` o `master`.

## Seguridad

- Nunca subir el archivo `.env` al repositorio
- Las credenciales se gestionan mediante GitHub Secrets
- Implementación de RLS (Row Level Security) en Supabase

## Licencia

Proyecto privado - CHV CyberDefense
