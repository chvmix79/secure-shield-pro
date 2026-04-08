# Guía de Despliegue en Vercel

Esta guía explica cómo configurar el despliegue automático de CHV CyberDefense en Vercel.

## Requisitos

- Cuenta en [Vercel](https://vercel.com) (puede usar login con GitHub)
- Proyecto conectado a tu repositorio de GitHub

## Paso 1: Conectar el Proyecto a Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Selecciona tu repositorio `secure-shield-pro`
4. En la configuración del proyecto:
   - **Framework Preset**: Selecciona "Vite"
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `./` (por defecto)

5. Agrega las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`

6. Haz clic en "Deploy"

## Paso 2: Obtener los Secrets para GitHub Actions

Después del primer despliegue, necesitas obtener los IDs para configurar los secrets de GitHub:

1. En el dashboard de Vercel, ve a tu proyecto
2. Ve a "Settings" → "General"
3. Busca "Project ID" y copia el valor
4. Ve a tu cuenta de Vercel (icono de tu perfil arriba a la derecha)
5. Ve a "Settings" → "Tokens"
6. Genera un nuevo token llamado "GitHub Actions" (con scope de tu proyecto)
7. Para obtener el Org ID:
   - Ve a la configuración de tu equipo/personal
   - Busca "Team ID" o "Personal Account ID"

## Paso 3: Configurar GitHub Secrets

Ve a tu repositorio en GitHub: `Settings` → `Secrets and variables` → `Actions`

Agrega estos secrets:

| Secret Name | Valor |
|-------------|-------|
| `VERCEL_TOKEN` | El token generado en el paso anterior |
| `VERCEL_ORG_ID` | Tu ID de organización/equipo de Vercel |
| `VERCEL_PROJECT_ID` | El ID del proyecto que copiaste |

## Paso 4: Configurar Variables de Entorno

También necesitas agregar las variables de entorno en Vercel:

1. En el dashboard de Vercel, ve a tu proyecto
2. Ve a "Settings" → "Environment Variables"
3. Agrega:
   - `VITE_SUPABASE_URL` → Tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` → Tu anon key de Supabase
   - `VITE_ADMIN_EMAIL` → Email del administrador

4. Configúralas para **Production** y **Preview** (opcional)

## Funcionamiento de los Workflows

### 1. CI Workflow (ci.yml)
Se ejecuta en cada push/PR a `master`, `main` o `develop`:
- Ejecuta linter
- Ejecuta tests
- Construye el proyecto
- Guarda el build como artefacto

### 2. Deploy Workflow (deploy.yml)
Despliegue manual mediante `workflow_dispatch`:
- Permite elegir entre `staging` o `production`
- Ejecuta tests antes de desplegar
- Despliega a Vercel (production)

### 3. Vercel Preview (vercel-preview.yml)
Despliegue automático de previews:
- En cada push a cualquier rama (excepto master/main)
- En Pull Requests (con label 'preview')

## URLs de Despliegue

Después de configurar, tendrás:

- **Production**: `https://secure-shield-pro.vercel.app` (o tu dominio personalizado)
- **Preview**: `https://secure-shield-pro-git-<branch>-<username>.vercel.app`

## Despliegue Manual

Para desplegar manualmente desde tu computadora:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar preview
vercel

# Desplegar a producción
vercel --prod
```

## Solución de Problemas

### Error: "Cannot find module"
- Asegúrate de que `npm ci` se ejecute correctamente
- Verifica que las dependencias estén en `package.json`

### Error: "Build failed"
- Revisa los logs del build en Vercel
- Ejecuta `npm run build` localmente para verificar

### Error: "Environment variables not found"
- Verifica que las variables estén configuradas en Vercel
- Para GitHub Actions, verifica los secrets

## Seguridad

⚠️ **Importante**: Nunca expongas tus credenciales de Supabase:
- Las variables `VITE_*` se incluyen en el build del cliente (son públicas)
- Usa Row Level Security (RLS) en Supabase para proteger datos
- El `anon key` es seguro para frontend, pero el `service_role key` NUNCA debe usarse en el cliente
