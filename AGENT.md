# AGENT.md - Contexto y Reglas del Proyecto

Este archivo sirve como brújula y memoria para el asistente de IA (Antigravity) que colabora en el desarrollo de **Evidence Shield Sys**. Debe ser consultado antes de iniciar cualquier tarea para asegurar la continuidad y el cumplimiento de los estándares del proyecto.

## 📜 Reglas de Documentación

Para cada cambio o implementación realizada, se deben seguir estrictamente estas reglas:

1.  **Explicación en 3 Niveles**:
    *   **Nivel General**: ¿Qué hace el cambio y por qué es importante para el negocio o el usuario? (Lenguaje no técnico).
    *   **Nivel Técnico**: ¿Cómo está estructurado? ¿Qué archivos se modificaron? ¿Qué servicios de Supabase o librerías se utilizaron?
    *   **Nivel Detallado**: Explicación paso a paso de la lógica interna, manejo de errores y flujos de datos específicos.

2.  **Comentarios en el Código**: Todo código generado debe tener comentarios internos que expliquen la intención de bloques complejos.
3.  **No Asumir Conocimiento**: El manual de usuario y las explicaciones generales deben ser comprensibles para alguien sin formación técnica.
4.  **Documentación Automática**: Al completar una tarea significativa, se debe actualizar el archivo `walkthrough.md`.
5.  **Manual de Usuario**: Al finalizar un módulo completo, se debe generar o actualizar un manual de usuario en la carpeta `/docs`.

---

## 🏗️ Arquitectura del Proyecto (Contexto Actual)

**Evidence Shield Sys** es una plataforma SaaS de ciberseguridad multi-inquilino (multi-tenant).

### Stack Tecnológico
- **Frontend**: React 18 (Vite), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth, Storage).
- **Seguridad**: Row Level Security (RLS) basado en roles (Admin vs. Usuario).

### Reglas de Seguridad Críticas
- **Administrador Global**: El correo `chvmix79@gmail.com` es el administrador único con acceso total (Bypass de RLS vía funciones `SECURITY DEFINER`).
- **Inquilinos (Tenants)**: Los usuarios normales solo pueden ver datos asociados a su `empresa_id`.

---

## 🚀 Módulos Implementados

1.  **Tablero Central (Dashboard)**: Visualización de métricas de riesgo, score de seguridad y progreso de cumplimiento.
2.  **Administración**: Gestión de empresas, marketplace de herramientas, leads y registros de pago.
3.  **Vulnerabilidades (CVE)**: Escaneo dinámico de software. Incluye un escáner basado en PowerShell (`.ps1`) para inventario automático.
4.  **Plan de Acción**: Seguimiento de tareas correctivas con carga de evidencias.
5.  **Phishing**: Simulaciones de ataques dirigidos para capacitación.

---

## 📋 Estado de la Última Sesión

- **Seguridad**: Se unificaron las políticas de RLS para garantizar que el administrador vea todos los módulos (Marketplace, Leads, Pagos).
- **Estabilidad**: Se corrigieron errores de referencia en el hook `useEmpresa`.
- **Integración**: Se restauró la conectividad del escáner PowerShell desactivando el requisito de JWT en la función `upload-inventory`.

---

*Nota: Este archivo debe ser actualizado por Antigravity cada vez que se realice un cambio significativo en la arquitectura o las reglas del proyecto.*
