# 🛣️ ROADMAP - Plan de Desarrollo

## 🎯 Objetivo del roadmap
Definir la evolución técnica y de negocio del proyecto CHV Ciberdefensa de forma controlada, segura y escalable, priorizando la integridad de los datos de las empresas auditadas y la estabilidad de las integraciones.

---

# 📌 FASE 1 - FUNDACIÓN

## Objetivo:
Base funcional estable y estructurada.

### 🔹 Tareas
- [x] Estructura inicial del proyecto basada en React, Vite y TypeScript.
- [x] Configuración de entornos de desarrollo y variables de entorno del cliente (`.env`).
- [x] Funcionalidad básica operativa: Inicio de sesión (Auth Supabase) y carga del Dashboard.

### ⚠️ Riesgos
- Mala estructura inicial en la jerarquía de componentes que cause acoplamiento.
- Falta de control de cambios al configurar de forma inconsistente las llaves públicas.

---

# 📌 FASE 2 - FUNCIONALIDADES CORE

## Objetivo:
Implementar funcionalidades principales de ciberseguridad y negocio.

### 🔹 Tareas
- [x] Módulo principal de Diagnóstico y cálculo automatizado de CiberScore.
- [x] Módulo de Plan de Acción para la asignación y carga de evidencias de seguridad.
- [x] Modales de administración (Control de planes Básico/Profesional y gestión de Leads).
- [x] Integración con APIs avanzadas de terceros (Auditoría Microsoft 365 y simulador Phishing).
- [x] Validaciones de datos y tipado estricto en formularios críticos.

### 🧪 Validaciones
- Flujo completo funcional verificado en local (Login -> Dashboard -> Cambiar Plan -> Diagnóstico).
- Manejo de errores controlado (evitar ReferenceError al pasar variables nulas).

---

# 📌 FASE 3 - SEGURIDAD

## Objetivo:
Proteger el sistema y los datos multi-tenant de las empresas clientes.

### 🔹 Tareas
- [x] Habilitar Row Level Security (RLS) en todas las tablas del esquema público de Supabase.
- [x] Configurar permisos explícitos mediante directivas `GRANT` para roles `anon`, `authenticated` y `service_role` (Reglas de Seguridad 2026).
- [x] Implementar triggers de auditoría automática en base de datos conectados a la tabla `audit_logs` con columnas correctas (`entity_type`, `entity_id`, etc.).
- [x] Validación y sanitización de todas las entradas del frontend contra inyecciones maliciosas.

### 🔐 Controles
- No exposición de credenciales privadas o service role en el cliente web.
- Sanitización estricta de payloads JSON en logs del sistema.

---

# 📌 FASE 4 - OPTIMIZACIÓN

## Objetivo:
Mejorar el rendimiento del renderizado, la calidad del código y la usabilidad.

### 🔹 Tareas
- [x] Refactorización controlada de los modales pesados en `Admin.tsx` para modularizarlos en componentes independientes.
- [x] Optimización de procesos: Implementar paginación y debouncing en búsquedas de tablas y leads.
- [x] Mejora de UX/UI: Consistencia del tema oscuro, transiciones más suaves y visualizaciones claras del score de riesgo.

---

# 📌 FASE 5 - ESCALABILIDAD

## Objetivo:
Preparar el sistema para un alto volumen de empresas concurrentes.

### 🔹 Tareas
- [x] Modularización avanzada: Separar lógicas de negocio pesadas en Custom Hooks específicos (e.g. useAdminData, useDashboardData).
- [x] Separación de servicios: Mudar integraciones de escaneo y auditoría pesadas a Supabase Edge Functions para evitar sobrecarga en cliente (Edge Functions implementadas: scan-vulnerabilities, send-phishing, chat-ai).
- [x] Mejora de arquitectura: Adaptar el flujo de datos para admitir sub-auditorías departamentales por empresa.

---

# 📌 FASE 6 - DESPLIEGUE

## Objetivo:
Salida limpia y monitoreada a producción.

### 🔹 Tareas
- [x] Configuración del entorno productivo independiente en Supabase y Vercel/Netlify.
- [x] Pruebas finales en base de datos espejo (Shadow Database).
- [x] Monitoreo de actividad, alertas de fallos en llamadas API y revisión periódica de logs.

---

# 🔄 REGLAS DEL ROADMAP

## 🚨 CRÍTICAS
- **No avanzar sin validar la fase anterior:** No se pueden iniciar optimizaciones si los módulos core presentan vulnerabilidades de seguridad o errores de RLS.
- **No implementar cambios masivos:** Toda actualización a la base de datos se debe hacer de forma incremental y modular.
- **No romper funcionalidades existentes:** Verificar la retrocompatibilidad en cada cambio de base de datos.

---

## 🔁 CONTROL DE CAMBIOS
Cada tarea nueva o modificación debe seguir este flujo:
1. **Analizar impacto:** Evaluar qué componentes o tablas se verán afectadas.
2. **Implementar cambios pequeños:** Codificar en partes modulares fácilmente testables.
3. **Validar funcionamiento:** Comprobar localmente y pasar los tests correspondientes.
4. **Documentar cambios:** Actualizar de inmediato la documentación técnica y arquitectónica.

---

## 🧪 VALIDACIÓN CONTINUA
- Pruebas constantes de los flujos críticos del usuario.
- Verificación manual minuciosa de cada modal y comportamiento de roles (admin vs usuario estándar).
- Control y reporte proactivo de errores mediante logs estructurados.

---

## 📊 PRIORIDADES
1. **Estabilidad:** El sistema debe funcionar sin crasheos en producción.
2. **Seguridad:** Los datos de ciberseguridad corporativa están blindados contra fugas de información.
3. **Funcionalidad:** Los módulos deben cumplir sus reglas de negocio al 100%.
4. **Rendimiento:** Cargas rápidas y óptima interacción de interfaz.

---

## 🧠 USO DE IA
Las IAs de desarrollo asistido que colaboren en el proyecto deben:
- Seguir fielmente las directrices arquitectónicas del archivo `AGENT.md`.
- **No realizar cambios destructivos:** Evitar borrar o sobrescribir componentes enteros sin validar dependencias.
- **Explicar antes de modificar:** Justificar técnicamente el motivo y alcance de cada cambio propuesto.

---

# 📌 BACKLOG (FUTURO)
- [x] Módulo simulador de phishing con plantillas de correo editables por el auditor.
- [x] Integración automática mediante Webhooks para auditoría continua de endpoints.
- [x] Exportación avanzada de informes ejecutivos en formatos PDF personalizables y XLSX.

---

# 📈 MÉTRICAS DE ÉXITO
- Sistema 100% estable sin fallos de ejecución a nivel de cliente.
- Cero vulnerabilidades de fuga de datos gracias a políticas RLS validadas.
- Funcionalidad completa y validada de actualización de planes y registro de auditorías.
- Código mantenible, tipado de forma estricta y documentado profesionalmente.

---

# 🚀 VISIÓN FINAL
Un sistema SaaS de auditoría y gestión de ciberseguridad corporativa que sea:
- **Escalable:** Capaz de admitir miles de empresas simultáneamente.
- **Seguro:** Con estándares estrictos de protección de datos.
- **Mantenible:** Estructurado de forma modular para fácil actualización a largo plazo.
- **Profesional:** Listo para auditorías y certificaciones de cumplimiento de TI a nivel corporativo.
