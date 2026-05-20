# Guía de Entorno y Configuración de Supabase - CIBERSEGURIDAD

Esta guía establece los parámetros críticos de configuración para el proyecto de Ciberseguridad/Ciberdefensa. Es imperativo seguir estas instrucciones para evitar la contaminación cruzada con otros proyectos (como RIESGOS o AMBIENTAL).

## Información del Proyecto

- **Nombre en Supabase:** SEGURIDAD
- **ID del Proyecto (Reference ID):** `gjchgjojvdwfmtnxnkzc`
- **URL de la API:** `https://gjchgjojvdwfmtnxnkzc.supabase.co`

## Configuración del Entorno (.env)

El archivo `.env` en la raíz del proyecto debe contener EXCLUSIVAMENTE estas referencias:

```env
VITE_SUPABASE_URL=https://gjchgjojvdwfmtnxnkzc.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY_DE_SEGURIDAD
```

## Precauciones Críticas

> [!CAUTION]
> **NO COMPARTIR BASE DE DATOS:** Bajo ninguna circunstancia se debe apuntar este código a la base de datos de los proyectos "RIESGOS" o "AMBIENTAL". Los esquemas son incompatibles y causarían pérdida de datos o errores en cascada.

> [!WARNING]
> **Personal Access Tokens (sbp_):** El token personal que comienza con `sbp_` otorga acceso a todos tus proyectos. No lo incluyas nunca en el código fuente ni en el archivo `.env`. Utiliza sólo la `anon_key` específica del proyecto.

## Estructura de Datos Core

La aplicación depende de las siguientes tablas en el esquema `public`:
- `empresas`: Datos principales de la organización y suscripción.
- `diagnosticos`: Evaluaciones de ciberseguridad realizadas.
- `acciones`: Plan de acción derivado del diagnóstico.
- `alertas`: Notificaciones de seguridad.
- `usuarios`: Gestión de usuarios secundarios y permisos.
- `vulnerabilidades`: Reporte de fallos detectados.
- `cumplimiento_documentos`: Gestión de archivos y evidencias.
- `score_history`: Trazabilidad del puntaje de seguridad (CiberScore).

---
*Última limpieza y auditoría de entorno: 24 de Abril, 2026.*
