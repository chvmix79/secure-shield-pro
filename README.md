# 🚀 CHV Ciberdefensa (Secure Shield Pro)

## 📌 Descripción
CHV Ciberdefensa es una plataforma web integral de gestión de riesgos, auditoría y ciberseguridad diseñada para evaluar, monitorear y mitigar vulnerabilidades tecnológicas en organizaciones. El sistema permite administrar múltiples empresas, ofreciendo diagnósticos detallados, planes de acción, herramientas de concientización (como simulaciones de phishing) e integración con inteligencia artificial para la protección proactiva de la infraestructura IT.

---

## 🎯 Objetivo
Centralizar y simplificar la gestión de la ciberseguridad corporativa. Aporta valor al permitir a auditores y administradores evaluar el "CiberScore" de las empresas, gestionar planes de suscripción, automatizar reportes de cumplimiento y educar a los empleados para prevenir incidentes de seguridad, todo desde un único panel de control intuitivo y seguro.

---

## 🧩 Funcionalidades principales
- **Gestión Multi-tenant:** Administración centralizada de empresas con control de suscripciones y planes (Básico, Profesional, etc.).
- **Diagnósticos y CiberScore:** Evaluaciones de seguridad que generan una calificación de riesgo en tiempo real.
- **Planes de Acción y Evidencias:** Seguimiento de vulnerabilidades con carga de evidencias para cumplimiento.
- **Módulos Especializados:** 
  - Simulador de Phishing corporativo.
  - Gestión de Vulnerabilidades.
  - Auditoría de Microsoft 365.
- **Marketplace y Leads:** Directorio de herramientas de ciberseguridad recomendadas y gestión de clientes potenciales.
- **Asistente IA:** Módulo de chat impulsado por inteligencia artificial para consultas de seguridad.
- **Generación de Reportes:** Exportación automatizada de informes de diagnóstico en PDF.

---

## 🏗️ Arquitectura (Resumen)
El sistema utiliza una arquitectura **Serverless** orientada a microservicios administrados. El frontend es una Single Page Application (SPA) altamente reactiva que se comunica directamente con una plataforma Backend-as-a-Service (BaaS) mediante clientes fuertemente tipados. El backend gestiona la autenticación, la base de datos relacional y las políticas de seguridad a nivel de fila (RLS), garantizando que cada empresa acceda exclusivamente a su información.

---

## 📂 Estructura del proyecto

```text
/src
 ├── /components   # Componentes UI reutilizables (Botones, Tablas, Modales)
 ├── /hooks        # Custom hooks de React (manejo de estado, auth, empresas)
 ├── /lib          # Configuración de clientes (Supabase, utilidades, tipos)
 ├── /pages        # Vistas completas de la aplicación (Admin, Dashboard, etc.)
 ├── /types        # Definiciones de interfaces y tipos de TypeScript
 └── /test         # Archivos de pruebas unitarias y de integración
```

- **components:** Lógica de interfaz agnóstica de negocio y componentes base (`shadcn/ui`).
- **hooks:** Lógica de estado y llamadas a base de datos encapsuladas para fácil reutilización.
- **lib:** Configuraciones críticas de servicios de terceros (Supabase) y funciones core de validación.
- **pages:** Estructura de navegación principal y ensamblaje de componentes de nivel superior.

---

## ⚙️ Tecnologías utilizadas

- **Lenguajes:** TypeScript, HTML5, CSS3
- **Framework Frontend:** React 18 (construido y empaquetado con Vite)
- **Ecosistema UI:** TailwindCSS, Radix UI, shadcn/ui y Lucide Icons
- **Backend y Base de Datos:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Gestión de Estado y Enrutamiento:** React Router DOM, Zustand (opcional según módulo)

---

## 🔐 Seguridad

Buenas prácticas aplicadas de manera estricta:
- **Autenticación Segura:** Manejo de sesiones y tokens mediante JWT nativo de Supabase Auth.
- **Row Level Security (RLS):** Toda la base de datos PostgreSQL tiene habilitado RLS de manera obligatoria. Los usuarios solo acceden a los registros permitidos explícitamente por las `Policies`.
- **Políticas de Privilegio Mínimo:** Implementación estricta de `GRANT SELECT, INSERT, UPDATE, DELETE` separados por roles (`anon`, `authenticated`, `service_role`).
- **Control de Permisos de Roles (RBAC):** Uso de funciones integradas en base de datos (`is_global_admin()`) para restringir operaciones destructivas o críticas de negocio al equipo de administradores globales.
- **Validación de Datos:** Sanitización estricta de variables e inputs tanto en el frontend como en los triggers del backend.

---

## 🚀 Instalación

Sigue este paso a paso para desplegar el entorno de desarrollo local:

1. **Clonar repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd CIBERSEGURIDAD
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crea un archivo `.env` o `.env.local` en la raíz del proyecto y configura tus accesos:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase_aqui
   VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase_aqui
   VITE_ADMIN_EMAIL=tu_correo_admin_aqui
   ```

4. **Ejecutar proyecto**
   ```bash
   npm run dev
   ```

---

## ▶️ Uso

1. Ingresa a la aplicación a través de la ruta proporcionada por Vite (usualmente `http://localhost:5173`).
2. Inicia sesión con tus credenciales de administrador global o como cliente estándar de una empresa.
3. **Rol de Administrador:** Navega a la vista "Admin" para gestionar perfiles de empresas, cambiar configuraciones de suscripciones (pruebas, básico, profesional), visualizar leads y aprobar solicitudes de pago.
4. **Rol de Cliente:** Revisa métricas en el "Dashboard Central", ejecuta auditorías continuas y marca como resueltos los incidentes en el "Plan de Acción" respaldando con evidencias.

---

## 🔄 Flujo de trabajo

El trabajo colaborativo en este repositorio sigue estas reglas inquebrantables:
- **Cambios controlados:** Todo nuevo desarrollo debe hacerse en ramas de funcionalidad aisladas (`feature/nombre-del-modulo`) y aprobarse mediante Pull Request.
- **Validaciones:** Comprobar siempre que no haya errores de tipado en TypeScript y que el linter no reporte conflictos antes de fusionar código.
- **Uso de AGENT.md:** Seguir las pautas arquitectónicas marcadas en la documentación de agentes para preservar la consistencia visual y de datos.

---

## 🧪 Pruebas

Para validar que el sistema funciona correctamente:
- Ejecuta los comandos de validación locales (linter, types).
- Realiza pruebas End-to-End manuales de los flujos críticos (Login seguro, Pasarela o confirmación de Planes, Exportación PDF de resultados).
- Al modificar backend, se debe usar una base de datos local conectada mediante `supabase-cli` para validar que los cambios en Policies (RLS) impidan cruce de información entre empresas.

---

## 📦 Despliegue

El sistema está configurado y optimizado para despliegues mediante CI/CD:
1. Construir el compilado para producción:
   ```bash
   npm run build
   ```
2. La carpeta resultante `dist/` se debe subir al entorno de alojamiento estático o CDN configurado (Vercel, AWS S3, Cloudflare Pages, etc.).
3. Configurar todas las Variables de Entorno de producción en el panel de control del proveedor de hosting.
4. En Supabase, aplicar las migraciones de producción asegurando que no haya exposición del esquema `public`.

---

## 📈 Estado del proyecto

- **Activo** y en fase de despliegue continuo con nuevas iteraciones del modelo de negocio.

---

## 🛣️ Roadmap

Contamos con un archivo independiente `ROADMAP.md` donde se listan las mejoras de interfaz planificadas, nuevas funcionalidades de auditoría y migraciones de reglas en base de datos.

---

## 👨‍💻 Autor / Equipo

Diseñado, desarrollado y mantenido en exclusividad por el equipo de Desarrollo e Ingeniería de CHV Ciberdefensa / INFORMATICA.

---

## 📄 Licencia

**Uso Comercial Restringido**. Todo el código, bases de datos y lógicas de negocio contenidas en este repositorio son propiedad intelectual de la organización responsable y no pueden ser distribuidas, alteradas ni reutilizadas sin autorización corporativa expresa.

---

## ⚠️ Notas importantes

Reglas críticas aplicables a todo el proyecto:
- **No romper funcionalidad existente:** La fiabilidad del panel de administración y control de planes es la columna vertebral de la plataforma; validaciones cruzadas son estrictamente requeridas antes de guardar cambios.
- **Seguir estándares del proyecto:** Reutilizar utilidades globales, evitar librerías CSS externas que rompan la estandarización gráfica de Tailwind y no hardcodear credenciales en el cliente.
- **Seguridad primero:** Toda nueva tabla en Base de Datos está forzada, por directriz técnica de 2026, a llevar permisos explícitos de `GRANT` y políticas de RLS bajo advertencia de bloqueo (42501 permission denied).

---

## 🤖 Uso de IA

Este repositorio está optimizado para el desarrollo co-asistido mediante agentes de Inteligencia Artificial (AI Coding Agents). Las reglas de colaboración son:
- Consultar y acatar lo dispuesto en el archivo `AGENT.md`.
- **Cambios controlados y progresivos:** La IA debe realizar modificaciones atómicas para no desestabilizar interfaces mayores.
- **Validación antes de implementar:** La IA **NUNCA** generará tablas ni migraciones de Supabase sin permisos explícitos `GRANT`, `ENABLE ROW LEVEL SECURITY`, y `CREATE POLICY`. La seguridad por defecto no es negociable. La compatibilidad con API Edge/REST/GraphQL debe estar validada antes de dar por completado un cambio.
