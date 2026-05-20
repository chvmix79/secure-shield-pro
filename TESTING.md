# 🧪 TESTING.md - Plan de Pruebas

## 🎯 Objetivo
Garantizar que el sistema CHV Ciberdefensa funcione de manera correcta, estable y segura en cada una de sus iteraciones, asegurando que las nuevas actualizaciones de base de datos o lógica de frontend no afecten negativamente a las funcionalidades ya existentes.

---

# 🧩 TIPOS DE PRUEBAS

## 1. Pruebas funcionales
Verifican que los componentes del sistema (como los módulos de actualización de planes, simulador de phishing e informes de diagnóstico) hagan exactamente lo que el negocio y los requerimientos exigen.

## 2. Pruebas de regresión
Verifican que la implementación de nuevos módulos, parches o cambios en las políticas de bases de datos no alteren ni dañen los flujos anteriormente verificados (por ejemplo, el bloqueo de cuentas vencidas o el inicio de sesión).

## 3. Pruebas de errores
Validan que cuando ocurra un fallo (pérdida de conexión, error de RLS, error de formato de datos), el sistema responda con un mensaje controlado y legible en pantalla, evitando pantallas en blanco o bloqueos totales.

---

# 🔄 PROCESO DE PRUEBAS

1. **Identificar funcionalidad:** Analizar qué módulo o endpoint está siendo afectado por el código nuevo.
2. **Definir escenarios:** Estructurar las entradas (datos correctos, datos con typos, ataques, credenciales incorrectas).
3. **Ejecutar pruebas:** Aplicar pruebas automáticas en el entorno de desarrollo y pruebas manuales integradas.
4. **Validar resultados:** Comparar la respuesta obtenida frente a los criterios de aceptación técnicos y visuales establecidos.

---

# 📋 CASOS DE PRUEBA

## Ejemplo 1: Gestión de Suscripciones (Actualización de Planes)

### Caso 1 (Dato Válido)
- **Entrada:** Selección de plan "Básico", duración "30 días", usuario con permisos de administrador global.
- **Resultado esperado:** Actualización exitosa en la base de datos (con fecha de finalización calculada + 2 días de gracia), cierre automático del modal y despliegue del Toast de éxito.

### Caso 2 (Dato Inválido / Error de Permisos)
- **Entrada:** Intento de actualización de plan por un usuario sin permisos de administrador global (ej: email no registrado en `is_global_admin()`).
- **Resultado esperado:** Retorno de código de error de Supabase (42501 / Violación RLS) y alerta en pantalla que indica "Error al actualizar el plan: permiso denegado" de forma controlada.

---

# ⚠️ CASOS CRÍTICOS

En CHV Ciberdefensa, se consideran casos críticos prioritarios:
- **Validación de Datos:** Coherencia de fechas de finalización y control de límites de usuarios máximos por plan.
- **Procesos Principales:** Creación de empresas, cálculo de CiberScore en diagnósticos y carga de evidencias en los planes de acción.
- **Integraciones Externas:** Sincronización en tiempo real del SDK de Supabase Auth con los estados locales del cliente.

---

# 🔁 PRUEBAS DE REGRESIÓN

Después de cada cambio, se deben ejecutar obligatoriamente las siguientes verificaciones para evitar regresiones:
- **Verificar funcionalidades existentes:** Asegurar que la corrección de un bug en un modal de administración (ej. gestionar plan) no rompa el listado de empresas o la visualización de Leads.
- **Validar flujos completos:** Realizar el camino completo del usuario: Iniciar sesión -> Consultar Dashboard -> Completar Diagnóstico -> Verificar cálculo de score en el panel.

---

# 🪞 PRUEBAS EN BASE DE DATOS ESPEJO (SHADOW DATABASE)

Para la **FASE 6 - DESPLIEGUE**, se exige probar cambios críticos contra una Shadow Database (Base de datos espejo) antes de impactar producción.

1. **Creación del entorno de Shadow DB:**
   Supabase permite el uso de *Branching* para crear entornos efímeros. Para crear una shadow DB:
   ```bash
   supabase branch create feature-testing
   ```
2. **Ejecución de Pruebas Automáticas:**
   Conecta tus tests a esta URL ejecutando el script especializado:
   ```bash
   npm run test:shadow
   ```
   *Nota: Este script requerirá que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` apunten a las credenciales del branch (Shadow DB).*
3. **Validaciones de Migraciones:**
   La Shadow Database es crucial para probar migraciones DDL (`supabase db push`) sin riesgo de corrupción en producción. Verifica siempre la retrocompatibilidad.

---

# 🧪 PRUEBAS DE SEGURIDAD

- **Inputs maliciosos:** Intentar inyectar scripts (XSS) o sentencias SQL en los campos de búsqueda de empresas o formularios de contacto.
- **Datos inesperados:** Enviar campos vacíos, fechas pasadas o IDs con formatos UUID inválidos hacia la API de Supabase para corroborar que el backend los rechaza debidamente.
- **Manipulación de parámetros:** Intentar actualizar o leer empresas ajenas cambiando el ID de la URL o el cuerpo del payload desde la consola del navegador. Las políticas RLS deben bloquearlo de inmediato (Código 42501).

---

# 🛠️ PRUEBAS MANUALES

- **Navegación completa:** Recorrer todos los menús laterales y tabs (Empresas, Marketplace, Leads, Pagos) para asegurar que el enrutamiento responde correctamente.
- **Uso real del sistema:** Completar un flujo de simulación de phishing o de análisis de Microsoft 365 tal como lo haría un cliente final.
- **Validación de UX:** Confirmar que los componentes responsivos no colapsen en pantallas de dispositivos móviles y que los loaders carguen de manera fluida.

---

# 🤖 PRUEBAS CON IA

Cuando un agente de IA realice cambios en el código, debe seguir las siguientes pautas de control:
- **Proponer casos de prueba:** Definir y documentar qué escenarios de prueba aplican al módulo modificado.
- **Identificar riesgos:** Advertir al desarrollador si el cambio en una tabla (por ejemplo, `audit_logs`) requiere triggers específicos o si alterará dependencias en otras vistas.
- **Validar impacto:** Comprobar mediante scripts de prueba o análisis estático que no existan typos ni variables sin definir (evitando errores como variables de fecha nulas).

---

# 📊 CRITERIOS DE ÉXITO

- **Sin errores críticos:** La suite de ejecución y la consola del navegador no deben arrojar excepciones de runtime (`ReferenceError`, `TypeError`, etc.).
- **Funcionalidad estable:** Los cambios se guardan y reflejan correctamente en la UI tras la respuesta de la base de datos.
- **Respuestas correctas:** Los cálculos de CiberScore y las fechas límite de planes coinciden exactamente con la lógica de negocio.

---

# 🚨 CRITERIOS DE FALLA

- **Función rota:** Un flujo previo o nuevo deja de responder o genera pantallas en blanco.
- **Error no controlado:** Alertas genéricas que no indican al usuario el motivo del fallo, o caídas de conexión sin reintento automático.
- **Datos incorrectos:** Modificaciones de base de datos que omitan campos requeridos (como dejar la auditoría sin `entity_type`).

---

# 🔄 FRECUENCIA

- **Antes de cada cambio:** Al iniciar una rama de desarrollo para asegurar una base limpia.
- **Después de cada implementación:** Inmediatamente al finalizar la escritura de código en el entorno de desarrollo local y pre-producción.

---

# 📌 REGLAS

- **No desplegar sin pruebas:** Está estrictamente prohibido pasar cambios a la rama principal (`main`) sin haber completado este plan de pruebas.
- **No asumir funcionamiento:** El éxito de una compilación local no garantiza el funcionamiento de la lógica de negocio ni de los permisos RLS. Debe validarse cada flujo de forma real.
- **Validar siempre:** Comprobar la respuesta de la base de datos tanto para perfiles de usuario estándar como para administradores globales.

---

# 🧠 NOTA FINAL

👉 **Si no se prueba, no está terminado.** La calidad del software es responsabilidad de todos.
