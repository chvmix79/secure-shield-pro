# Documento de Arquitectura - CHV Ciberdefensa (Secure Shield Pro)

Este documento define la arquitectura estructural, lógica y de seguridad para la plataforma B2B de gestión de ciberseguridad, auditoría y control de vulnerabilidades corporativas.

---

## 🧩 1. Visión General de la Arquitectura

- **Tipo de Arquitectura:** Modular Orientada a Servicios Basada en Eventos (Serverless Backend) con Single Page Application (SPA).
- **Justificación técnica:** El uso de una arquitectura con backend administrado (Supabase) permite delegar el mantenimiento de la infraestructura de base de datos, autenticación y almacenamiento. La separación estricta del frontend (React/Vite) y el backend a través de APIs y Edge Functions garantiza alta escalabilidad, rápido desarrollo y cumplimiento de normativas al usar seguridad a nivel de fila (RLS) en lugar de intermediarios middleware pesados. La estructura modular del frontend facilita la inyección de nuevas funcionalidades (phishing, M365, auditorías) sin romper el core del sistema.

---

## 🏛️ 2. Capas del Sistema

- **Capa de Presentación (UI):** React 18, renderizado en el cliente. Responsable de mostrar interfaces dinámicas (`shadcn/ui`, `TailwindCSS`), recolectar input del usuario y reaccionar a cambios en tiempo real. Completamente agnóstica a la lógica de persistencia.
- **Capa de Lógica de Negocio (Hooks/Context):** Estado local manejado por React Context o Hooks (`useEmpresa`, `useAuth`). Actúa como coordinador entre las acciones del usuario y las mutaciones/consultas hacia el backend.
- **Capa de Acceso a Datos (Data Access / Lib):** Funciones y clases orientadas a servicios (ej. `suscripcionService`, `pagoService`). Encapsula las llamadas directas al cliente SDK de Supabase o a APIs REST externas.
- **Capa de Backend y Persistencia (Supabase):** PostgreSQL con reglas estrictas de RLS. Autoridad absoluta en validaciones de integridad, operaciones transaccionales y control de permisos (RBAC multi-tenant).

---

## 📂 3. Estructura de Carpetas

```text
/src
 ├── /components   # UI pura: componentes atómicos y compuestos (Botones, Modales, Tarjetas)
 ├── /hooks        # Lógica de estado y coordinación de negocio (useEmpresa, etc.)
 ├── /lib          # Acceso a datos, configuración de Supabase, validadores, tipos y constantes
 ├── /pages        # Ensamblaje de vistas de nivel superior enrutables (Dashboard, Admin)
 ├── /types        # Interfaces y tipos de TypeScript globales
 ├── /assets       # Recursos estáticos locales, tipografías e imágenes estáticas
 └── /test         # Pruebas unitarias y de integración
```

- **components:** Debe mantener un acoplamiento nulo con la lógica de base de datos.
- **lib:** Contiene los adaptadores del sistema (puertos a Supabase y servicios externos).
- **pages:** El único lugar donde se orquesta la vista enlazando la interfaz con los adaptadores.

---

## 🔄 4. Flujo del Sistema

**Paso a paso de una solicitud típica (Ej: Actualización de Plan):**
1. **Interacción:** El administrador hace clic en "Actualizar Plan" en la UI.
2. **Validación de Capa (Frontend):** Los hooks validan la coherencia de los datos en el estado local (tipos y campos requeridos).
3. **Llamada a Capa de Datos:** La UI invoca a `suscripcionService.upgradePlan()`, pasando los DTOs (Data Transfer Objects).
4. **Petición Segura:** El cliente Supabase inyecta automáticamente el JWT de sesión en la cabecera de la petición REST.
5. **Autenticación (DB):** Supabase evalúa el JWT mediante `auth.uid()` y valida a través de la función `is_global_admin()`.
6. **Ejecución y RLS:** La Base de Datos comprueba si la "Policy" de `UPDATE` permite el cambio. Si se permite, el plan se actualiza y se dispara el trigger `audit_empresas_changes`.
7. **Auditoría Interna:** El trigger inserta automáticamente el registro de cambio en `audit_logs` con `action_by`.
8. **Respuesta:** Se devuelve el objeto de éxito al frontend, disparando un Toast de éxito o gestionando el error en un bloque `catch` para retroalimentación en la UI.

---

## 🔗 5. Integraciones

- **Supabase (Backend Core):** Base de datos, Autenticación de sesiones, Almacenamiento S3 (Evidencias) y Edge Functions.
- **Gateway de Pagos (e.g. Stripe / Local):** Gestión transaccional. Dependencia estricta por token; el backend se debe asegurar mediante Webhooks validados criptográficamente.
- **Servicios de Ciberseguridad (Microsoft 365 Graph API, Phishing Engines):** Consumo asíncrono.
- **Seguridad de Integración:** Toda API key, secret y token debe estar fuera del cliente web. Los secretos críticos residen únicamente en `.env` (consumido local) y en los Secretos de las Edge Functions para operaciones externas.

---

## 🔐 6. Seguridad en la Arquitectura

- **Validación de Datos (Frontend & Backend):** Validación estructural con `Zod` o Tipos fuertes de TypeScript en frontend, pero respaldada obligatoriamente por validadores `CHECK` en PostgreSQL y funciones restrictivas.
- **Manejo de Credenciales:** Inexistencia de contraseñas hardcodeadas. Auth delegado 100% a Supabase con tokens JWT seguros.
- **Protección contra Vulnerabilidades:**
  - Prevención de SQL Injection delegando consultas a ORMs/SDK nativos de Supabase.
  - Multi-tenancy blindado: Toda tabla pública debe contar con directivas `ENABLE ROW LEVEL SECURITY` y `GRANT` explícito por Rol para evitar fuga de datos (Data Leakage). Las Políticas restringen el acceso mediante cruces forzosos por `user_id` de la sesión.

---

## ⚙️ 7. Manejo de Configuración

- **Variables de Entorno:**
  - Se utilizan prefijos `VITE_` única y exclusivamente para llaves públicas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - Todo token de administración profunda reside en el entorno Server.
- **Separación de Ambientes:** Tres entornos definidos e inconexos (Proyectos diferentes en Supabase):
  1. `Dev` (Local / Pruebas en máquina de desarrollador).
  2. `Staging` (Para validación QA y cliente).
  3. `Production` (Alta disponibilidad).

---

## 💾 8. Manejo de Datos

- **Validación:** Fuertemente tipada desde TypeScript hasta el Schema de base de datos.
- **Sanitización:** Los payloads JSON enviados a logs (ej. `audit_logs`) o bases de datos se formatean nativamente y no aceptan HTML renderizable sin escape explícito.
- **Persistencia y Auditoría:** Se exige el patrón **"No-Delete"** o Soft-Deletes en tablas críticas (facturas, empresas) o registros de auditoría obligatorios administrados por *Triggers de base de datos*, garantizando inmutabilidad.

---

## 🧪 9. Estrategia de Pruebas

- **Qué se debe probar:** 
  1. **Reglas de Seguridad (RLS):** Crucial validar que el Tenant A no acceda al Tenant B en backend usando la herramienta Supabase CLI test/lint.
  2. **Flujos Core (E2E):** Ingreso al Dashboard, Generación de Informes, Procesamiento de Pagos/Actualización de Planes.
  3. **Lógica Compleja (Unitarias):** Algoritmos de cálculo de CiberScore, adaptadores de fechas.
- **Cómo evitar romper funcionalidades:** Integración de Git Hooks (`husky`) para correr linters y type-checking pre-commit. Prohibido hacer PRs sin aprobar validaciones automáticas y pruebas unitarias mínimas.

---

## 🚀 10. Escalabilidad

- **Sin cuellos de botella locales:** Al no tener servidor monolítico tradicional de backend (Node/Express), el ancho de banda y la computación dependen de la arquitectura serverless que escala de forma independiente para Auth, REST y Database.
- **Crecimiento de Bases de Datos:** Manejo de paginación obligatoria desde la capa de UI. Uso de índices en la base de datos para consultas frecuentes por `empresa_id` y `user_id`.
- **Despliegue Global:** El frontend compilado puede servirse en cualquier CDN (Edge Network) sin interdependencias físicas del servidor de DB.

---

## ⚠️ 11. Riesgos Técnicos

- **Riesgo 1: Degradación por Errores RLS:** Configurar políticas mal formuladas que devuelvan múltiples filas vacías al hacer un Join pesado.
  - **Mitigación:** Hacer EXPLAIN ANALYZE a consultas en cascada. Optimizar policies simplificadas.
- **Riesgo 2: Regresiones silenciosas por cambios en DB.**
  - **Mitigación:** Aplicar migraciones automatizadas y pruebas en base de datos de sombra antes de empujar a producción.
- **Riesgo 3: Desincronización de Tipos TypeScript-Base de Datos.**
  - **Mitigación:** Ejecutar regeneración de tipos automatizada (`supabase gen types typescript`) tras toda migración.

---

## 📌 12. Reglas Arquitectónicas

1. **La seguridad reside en el Backend:** La validación de la UI es estrictamente para la Experiencia de Usuario (UX). El backend JAMÁS asume que el frontend envía información veraz.
2. **No Mezclar Capas:** Un Componente UI `.tsx` jamás debe incluir sentencias directas de SQL o lógica compleja; debe llamar a la capa de servicios `/lib/` o usar Hooks personalizados.
3. **Regla de Privilegio Cero:** Toda nueva entidad de datos nace restringida, sin permisos públicos. Para usarla, debe otorgarse el `GRANT` correcto y configurarse explícitamente su `RLS Policy`.
4. **No duplicar lógica:** Lógica repetible (ej. cálculo de scores o validación de fechas de planes) se centraliza obligatoriamente en un único adaptador dentro de `/lib` o en funciones PostgreSQL.
5. **Compatibilidad hacia atrás:** Ninguna nueva migración debe eliminar columnas productivas usadas activamente; si se requiere refactorizar, se realiza en múltiples fases con retrocompatibilidad temporal.
