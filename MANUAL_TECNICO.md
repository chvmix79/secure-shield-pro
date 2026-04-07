# 🖥️ Manual Técnico y Arquitectura: CHV CyberDefense

Este documento detalla la estructura técnica, stack tecnológico y lógica de negocio de la plataforma **CHV CyberDefense**.

## 1. Stack Tecnológico
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion (para animaciones).
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime).
- **IA**: Modelos avanzados (Anthropic/Google/OpenAI) integrados mediane Edge Functions.
- **Reportes**: jsPDF + jspdf-autotable.
- **Charts**: Recharts (para visualizaciones de seguridad en el Dashboard).

## 2. Estructura de la Base de Datos (Supabase)
### 🏢 Empresas (`empresas`)
Almacena el perfil corporativo de cada cliente, su sector y cantidad de empleados para ajustar el diagnóstico.

### 📋 Diagnósticos (`diagnosticos`)
Guarda las respuestas a los cuestionarios de seguridad y el **score** calculado (0-100).
- `respuestas`: JSON que contiene el puntaje por cada uno de los 5 pilares de seguridad.

### ✅ Acciones y Evidencias (`acciones`, `evidencias`)
- `acciones`: Tareas generadas automáticamente tras un diagnóstico.
- `evidencias`: Archivos multimedia vinculados a las acciones para certificar su cumplimiento.

### 📧 Phishing (`campanas_phishing`, `leads_phishing`)
Sistema de simulación para medir la susceptibilidad de los empleados ante ataques dirigidos.

### 🛡️ Vulnerabilidades (`vulnerabilidades`)
Mapeo de activos contra la base de datos de vulnerabilidades (CVEs) para alertar sobre software obsoletos.

## 3. Lógica de Negocio
### Cálculo del CiberScore
El puntaje de seguridad se calcula dinámicamente:
- **60%**: Resultados del diagnóstico base.
- **20%**: Proporción de acciones completadas.
- **10%**: Progreso en capacitación.
- **10%**: Cumplimiento de documentación crítica.

### Generación de Reportes
Se realiza del lado del cliente utilizando `reportService.ts`. La plataforma extrae la información en tiempo real del estado de la empresa y genera un documento PDF profesional sin que los datos sensibles salgan del entorno del navegador del usuario.

## 4. Despliegue y Configuración
1. Clonar el repositorio.
2. Configurar las variables de entorno (`.env`) con las llaves de Supabase (URL y Anon Key).
3. Ejecutar `npm install` y `npm run dev` para iniciar el entorno de desarrollo.
4. Para producción, usar `node build` o desplegar en Vercel/Netlify.

---
*© 2024 CHV CyberDefense - Arquitectura Robusta para un Futuro Protegido.*
