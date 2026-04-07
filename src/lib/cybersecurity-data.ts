// Shared types for the cybersecurity platform
export type RiskLevel = 'bajo' | 'medio' | 'alto' | 'crítico';
export type ActionStatus = 'pendiente' | 'en_progreso' | 'completada' | 'vencida';
export type ActionPriority = 'baja' | 'media' | 'alta' | 'crítica';

export interface Company {
  name: string;
  sector: string;
  employees: string;
  techLevel: 'bajo' | 'medio' | 'alto';
}

export interface DiagnosticResult {
  score: number;
  level: RiskLevel;
  answers: Record<string, number>;
  completedAt: Date;
}

export interface Risk {
  id: string;
  name: string;
  category: string;
  level: RiskLevel;
  description: string;
  icon: string;
  affected: string[];
}

export interface Action {
  id: string;
  riskId: string;
  title: string;
  description: string;
  priority: ActionPriority;
  status: ActionStatus;
  responsible: string;
  dueDate: string;
  category: string;
}

export interface Evidence {
  id: string;
  actionId: string;
  title: string;
  type: 'imagen' | 'documento' | 'captura';
  uploadedAt: Date;
  notes: string;
}

// Mock data
export const mockCompany: Company = {
  name: "TechPyme S.A.",
  sector: "Servicios financieros",
  employees: "11-50",
  techLevel: "medio",
};

export const mockRisks: Risk[] = [
  {
    id: "r1",
    name: "Phishing",
    category: "Ingeniería Social",
    level: "alto",
    description: "Riesgo de que empleados sean engañados mediante correos falsos para revelar credenciales.",
    icon: "🎣",
    affected: ["Correo electrónico", "Contraseñas", "Datos financieros"],
  },
  {
    id: "r2",
    name: "Ransomware",
    category: "Malware",
    level: "alto",
    description: "Software malicioso que puede cifrar archivos y exigir rescate para recuperarlos.",
    icon: "🔒",
    affected: ["Archivos", "Sistemas", "Base de datos"],
  },
  {
    id: "r3",
    name: "Accesos no autorizados",
    category: "Control de Acceso",
    level: "medio",
    description: "Contraseñas débiles o compartidas permiten acceso no controlado a sistemas.",
    icon: "🚪",
    affected: ["Sistemas internos", "Correo", "Nube"],
  },
  {
    id: "r4",
    name: "Fuga de información",
    category: "Protección de Datos",
    level: "medio",
    description: "Datos sensibles de clientes o la empresa pueden ser expuestos accidentalmente.",
    icon: "💧",
    affected: ["Datos de clientes", "Información financiera"],
  },
  {
    id: "r5",
    name: "Malware / Virus",
    category: "Malware",
    level: "alto",
    description: "Dispositivos sin protección antivirus son vulnerables a software malicioso.",
    icon: "🦠",
    affected: ["Computadoras", "Redes", "Servidores"],
  },
  {
    id: "r6",
    name: "Pérdida de datos",
    category: "Continuidad",
    level: "medio",
    description: "Sin backups regulares, la empresa puede perder información crítica ante un fallo.",
    icon: "💾",
    affected: ["Documentos", "Base de datos", "Historial"],
  },
];

export const mockActions: Action[] = [
  {
    id: "a1",
    riskId: "r1",
    title: "Activar autenticación de doble factor (2FA)",
    description: "Configurar 2FA en todas las cuentas de correo y sistemas críticos.",
    priority: "crítica",
    status: "pendiente",
    responsible: "Administrador TI",
    dueDate: "2025-02-15",
    category: "Autenticación",
  },
  {
    id: "a2",
    riskId: "r1",
    title: "Capacitar empleados en detección de phishing",
    description: "Realizar taller de 1 hora sobre identificación de correos maliciosos.",
    priority: "alta",
    status: "en_progreso",
    responsible: "RRHH",
    dueDate: "2025-02-28",
    category: "Capacitación",
  },
  {
    id: "a3",
    riskId: "r2",
    title: "Implementar solución de backup automático",
    description: "Configurar backup diario cifrado en la nube y backup semanal offline.",
    priority: "crítica",
    status: "pendiente",
    responsible: "Administrador TI",
    dueDate: "2025-02-10",
    category: "Backup",
  },
  {
    id: "a4",
    riskId: "r5",
    title: "Instalar antivirus en todos los dispositivos",
    description: "Desplegar solución antivirus corporativa en todos los equipos de la empresa.",
    priority: "alta",
    status: "completada",
    responsible: "Administrador TI",
    dueDate: "2025-01-31",
    category: "Protección",
  },
  {
    id: "a5",
    riskId: "r3",
    title: "Actualizar política de contraseñas",
    description: "Implementar contraseñas de mínimo 12 caracteres con renovación cada 90 días.",
    priority: "alta",
    status: "pendiente",
    responsible: "Gerencia",
    dueDate: "2025-01-25",
    category: "Contraseñas",
  },
  {
    id: "a6",
    riskId: "r4",
    title: "Clasificar y proteger datos sensibles",
    description: "Identificar, clasificar y aplicar controles de acceso a datos de clientes.",
    priority: "media",
    status: "pendiente",
    responsible: "DPO / Gerencia",
    dueDate: "2025-03-15",
    category: "Protección de Datos",
  },
];

export const diagnosticQuestions = [
  // ========== GESTIÓN DE CONTRASEÑAS ==========
  {
    id: "q1",
    category: "Contraseñas",
    icon: "🔑",
    question: "¿Tu empresa tiene una política de contraseñas seguras?",
    description: "Contraseñas de 8+ caracteres, combinando letras, números y símbolos.",
    options: [
      { label: "Sí, todos usan contraseñas fuertes y las cambian regularmente", score: 10 },
      { label: "Algunas personas, pero no es obligatorio", score: 5 },
      { label: "No, la mayoría usa contraseñas simples o las mismas en todo", score: 0 },
    ],
  },
  {
    id: "q1b",
    category: "Contraseñas",
    icon: "🔑",
    question: "¿Las contraseñas se almacenan de forma cifrada?",
    description: "Uso de hash (bcrypt, scrypt) nunca texto plano.",
    options: [
      { label: "Sí, todas las contraseñas tienen hash con salt", score: 10 },
      { label: "Algunas están cifradas", score: 5 },
      { label: "No, se almacenan en texto plano", score: 0 },
    ],
  },
  {
    id: "q1c",
    category: "Contraseñas",
    icon: "🔑",
    question: "¿Se usa un gestor de contraseñas empresarial?",
    description: "Bitwarden, 1Password, LastPass, Dashlane, etc.",
    options: [
      { label: "Sí, toda la empresa usa un gestor centralizado", score: 10 },
      { label: "Algunos equipos lo usan", score: 5 },
      { label: "No usamos gestor de contraseñas", score: 0 },
    ],
  },

  // ========== AUTENTICACIÓN Y 2FA ==========
  {
    id: "q2",
    category: "Autenticación",
    icon: "📱",
    question: "¿Usan doble factor de autenticación (2FA) en cuentas críticas?",
    description: "Verificación adicional por SMS, app o correo al iniciar sesión.",
    options: [
      { label: "Sí, en correo, banca y sistemas principales", score: 10 },
      { label: "Solo en algunos servicios", score: 5 },
      { label: "No usamos doble factor en ningún sistema", score: 0 },
    ],
  },
  {
    id: "q2b",
    category: "Autenticación",
    icon: "📱",
    question: "¿El 2FA está habilitado en todas las cuentas de administrador?",
    description: "Acceso root/admin con autenticación multifactor.",
    options: [
      { label: "Sí, 100% de cuentas admin con 2FA", score: 10 },
      { label: "La mayoría, pero no todas", score: 5 },
      { label: "No hay 2FA para administradores", score: 0 },
    ],
  },
  {
    id: "q2c",
    category: "Autenticación",
    icon: "📱",
    question: "¿Tienen política de bloqueo de cuenta tras intentos fallidos?",
    description: "Bloqueo automático después de X intentos fallidos.",
    options: [
      { label: "Sí, después de 3-5 intentos fallidos", score: 10 },
      { label: "Tenemos algo, pero no configurado correctamente", score: 5 },
      { label: "No hay política de bloqueo", score: 0 },
    ],
  },

  // ========== ANTIVIRUS Y MALWARE ==========
  {
    id: "q3",
    category: "Antivirus",
    icon: "🛡️",
    question: "¿Todos los equipos de la empresa tienen antivirus activo y actualizado?",
    description: "Solución antivirus instalada y con actualizaciones automáticas.",
    options: [
      { label: "Sí, todos los equipos con antivirus corporativo actualizado", score: 10 },
      { label: "Algunos equipos tienen, otros no", score: 5 },
      { label: "No tenemos antivirus o está desactualizado", score: 0 },
    ],
  },
  {
    id: "q3b",
    category: "Antivirus",
    icon: "🛡️",
    question: "¿Tienen protección contra ransomware en tiempo real?",
    description: "Detección y bloqueo de comportamiento sospechoso.",
    options: [
      { label: "Sí, con protección específica contra ransomware", score: 10 },
      { label: "Solo antivirus básico", score: 5 },
      { label: "No hay protección específica", score: 0 },
    ],
  },
  {
    id: "q3c",
    category: "Antivirus",
    icon: "🛡️",
    question: "¿Se realizan análisis programados de malware semanalmente?",
    description: "Scans programados automático en todos los endpoints.",
    options: [
      { label: "Sí, análisis completo semanal automático", score: 10 },
      { label: "Ocasionalmente lo hacemos manualmente", score: 5 },
      { label: "No hacemos análisis programados", score: 0 },
    ],
  },

  // ========== BACKUPS ==========
  {
    id: "q4",
    category: "Backups",
    icon: "💾",
    question: "¿Realizan copias de seguridad (backup) de la información crítica?",
    description: "Respaldo regular de documentos, bases de datos y sistemas.",
    options: [
      { label: "Sí, backups automáticos diarios en la nube y copias offline", score: 10 },
      { label: "Hacemos backups ocasionalmente, no de forma sistemática", score: 5 },
      { label: "No realizamos backups regularmente", score: 0 },
    ],
  },
  {
    id: "q4b",
    category: "Backups",
    icon: "💾",
    question: "¿Los backups están cifrados y probados regularmente?",
    description: "Prueba de restauración mensual mínima.",
    options: [
      { label: "Sí, cifrados y probamos restauración cada mes", score: 10 },
      { label: "Están cifrados pero no probamos frecuentemente", score: 5 },
      { label: "No están cifrados ni probados", score: 0 },
    ],
  },
  {
    id: "q4c",
    category: "Backups",
    icon: "💾",
    question: "¿Tienen backup en ubicación geográfica diferente?",
    description: "3-2-1: 3 copias, 2 medios distintos, 1 fuera del sitio.",
    options: [
      { label: "Sí, tenemos backup fuera del país", score: 10 },
      { label: "Tenemos backup en otra ciudad", score: 5 },
      { label: "Todo está en el mismo lugar", score: 0 },
    ],
  },
  {
    id: "q4d",
    category: "Backups",
    icon: "💾",
    question: "¿Existe un plan de recuperación ante desastres documentado?",
    description: "RTO (Recovery Time Objective) y RPO (Recovery Point Objective) definidos.",
    options: [
      { label: "Sí, con RTO/RPO documentados y probados", score: 10 },
      { label: "Tenemos un plan básico", score: 5 },
      { label: "No hay plan documentado", score: 0 },
    ],
  },

  // ========== CORREO ELECTRÓNICO ==========
  {
    id: "q5",
    category: "Correo Electrónico",
    icon: "📧",
    question: "¿Tu empresa usa correo corporativo con dominio propio para todos los empleados?",
    description: "Correos @tuempresa.com en lugar de Gmail/Hotmail personales.",
    options: [
      { label: "Sí, todos usamos correo corporativo con filtros antispam", score: 10 },
      { label: "Algunos usan corporativo, otros personales", score: 5 },
      { label: "La mayoría usa correos personales para trabajo", score: 0 },
    ],
  },
  {
    id: "q5b",
    category: "Correo Electrónico",
    icon: "📧",
    question: "¿Tienen filtro antispam y antiphishing en el correo?",
    description: "Protección contra correos maliciosos entrantes.",
    options: [
      { label: "Sí, con filtrado avanzado y sandbox", score: 10 },
      { label: "Tenemos filtro básico", score: 5 },
      { label: "No hay filtro de correo", score: 0 },
    ],
  },
  {
    id: "q5c",
    category: "Correo Electrónico",
    icon: "📧",
    question: "¿El correo está configurado con DKIM, SPF y DMARC?",
    description: "Autenticación de correo para prevenir suplantación.",
    options: [
      { label: "Sí, los tres registros están configurados correctamente", score: 10 },
      { label: "SPF configurado, pero faltan los otros", score: 5 },
      { label: "No tenemos ninguna configuración", score: 0 },
    ],
  },

  // ========== CAPACITACIÓN ==========
  {
    id: "q6",
    category: "Capacitación",
    icon: "📚",
    question: "¿Los empleados han recibido capacitación en ciberseguridad básica?",
    description: "Formación sobre phishing, contraseñas, navegación segura.",
    options: [
      { label: "Sí, formación regular al menos una vez al año", score: 10 },
      { label: "Hemos dado algo de información pero no formalmente", score: 5 },
      { label: "No hemos dado capacitación en ciberseguridad", score: 0 },
    ],
  },
  {
    id: "q6b",
    category: "Capacitación",
    icon: "📚",
    question: "¿Se realizan simulaciones de phishing a los empleados?",
    description: "Envío de correos de prueba para evaluar vulnerabilidad.",
    options: [
      { label: "Sí, simulaciones mensuales con estadísticas", score: 10 },
      { label: "Ocasionalmente, no es regular", score: 5 },
      { label: "No hacemos simulaciones de phishing", score: 0 },
    ],
  },
  {
    id: "q6c",
    category: "Capacitación",
    icon: "📚",
    question: "¿Existe un programa de capacitación con certificado de cumplimiento?",
    description: "Training formal con documentación para auditorías.",
    options: [
      { label: "Sí, con certificados y registro para auditorías", score: 10 },
      { label: "Capacitamos pero sin certificados", score: 5 },
      { label: "No hay programa formal", score: 0 },
    ],
  },
  {
    id: "q6d",
    category: "Capacitación",
    icon: "📚",
    question: "¿Los nuevos empleados reciben onboarding de seguridad?",
    description: "Capacitación inicial obrigatória para nuevos ingresos.",
    options: [
      { label: "Sí, todos pasan por training de seguridad al entrar", score: 10 },
      { label: "Algunos, no es universal", score: 5 },
      { label: "No hay onboarding de seguridad", score: 0 },
    ],
  },

  // ========== REDES ==========
  {
    id: "q7",
    category: "Redes",
    icon: "📡",
    question: "¿La red WiFi de la empresa está protegida y separada de la de visitas?",
    description: "Red corporativa con contraseña fuerte y red separada para visitantes.",
    options: [
      { label: "Sí, red corporativa segura y red de invitados separada", score: 10 },
      { label: "Tenemos contraseña pero todos (empleados y visitas) comparten la misma red", score: 5 },
      { label: "La red no está protegida adecuadamente", score: 0 },
    ],
  },
  {
    id: "q7b",
    category: "Redes",
    icon: "📡",
    question: "¿Tienen firewall perimetral configurado?",
    description: "Firewall de borde con reglas de entrada/salida.",
    options: [
      { label: "Sí, con reglas específicas y monitoreo", score: 10 },
      { label: "Tenemos firewall básico", score: 5 },
      { label: "No hay firewall configurado", score: 0 },
    ],
  },
  {
    id: "q7c",
    category: "Redes",
    icon: "📡",
    question: "¿La red interna está segmentada por departamentos?",
    description: "VLANs o segmentación para limitar movimiento lateral.",
    options: [
      { label: "Sí, por departamentos y tipos de datos", score: 10 },
      { label: "Parcialmente, algunos departamentos", score: 5 },
      { label: "No hay segmentación", score: 0 },
    ],
  },
  {
    id: "q7d",
    category: "Redes",
    icon: "📡",
    question: "¿Monitorean el tráfico de red en tiempo real?",
    description: "IDS/IPS, SIEM o monitoreo de anomalías.",
    options: [
      { label: "Sí, con alertas automáticas", score: 10 },
      { label: "Revisamos logs ocasionalmente", score: 5 },
      { label: "No monitoreamos la red", score: 0 },
    ],
  },
  {
    id: "q7e",
    category: "Redes",
    icon: "📡",
    question: "¿El acceso a sistemas internos requiere VPN?",
    description: "Conexión segura desde ubicaciones remotas.",
    options: [
      { label: "Sí, VPN obligatoria para todo acceso remoto", score: 10 },
      { label: "Solo para algunos sistemas", score: 5 },
      { label: "No hay VPN, acceso directo", score: 0 },
    ],
  },

  // ========== ACTUALIZACIONES ==========
  {
    id: "q8",
    category: "Actualizaciones",
    icon: "🔄",
    question: "¿Los sistemas operativos y aplicaciones se mantienen actualizados?",
    description: "Parches de seguridad aplicados regularmente en todos los equipos.",
    options: [
      { label: "Sí, actualizaciones automáticas activadas en todos los sistemas", score: 10 },
      { label: "Actualizamos cuando recordamos o hay problemas", score: 5 },
      { label: "Muchos equipos tienen software desactualizado", score: 0 },
    ],
  },
  {
    id: "q8b",
    category: "Actualizaciones",
    icon: "🔄",
    question: "¿Tienen proceso de gestión de vulnerabilidades?",
    description: "Escaneo regular de vulnerabilidades y parcheo prioritized.",
    options: [
      { label: "Sí, escaneo mensual y parcheo dentro de 30 días", score: 10 },
      { label: "Escaneamos ocasionalmente", score: 5 },
      { label: "No hay proceso de gestión", score: 0 },
    ],
  },

  // ========== PROTECCIÓN DE DATOS ==========
  {
    id: "q9",
    category: "Protección de Datos",
    icon: "🔒",
    question: "¿Tienen clasificación de datos sensitivos?",
    description: "Identificación y categorización de datos críticos.",
    options: [
      { label: "Sí, clasificación completa documentada", score: 10 },
      { label: "Parcialmente, sabemos qué es importante", score: 5 },
      { label: "No hay clasificación de datos", score: 0 },
    ],
  },
  {
    id: "q9b",
    category: "Protección de Datos",
    icon: "🔒",
    question: "¿Los datos sensibles están cifrados en reposo?",
    description: "Cifrado de bases de datos, archivos y discos.",
    options: [
      { label: "Sí, todo cifrado con AES-256", score: 10 },
      { label: "Algunos datos están cifrados", score: 5 },
      { label: "No hay cifrado de datos", score: 0 },
    ],
  },
  {
    id: "q9c",
    category: "Protección de Datos",
    icon: "🔒",
    question: "¿Los datos en tránsito usan cifrado (TLS/SSL)?",
    description: "Todo el tráfico cifrado, especialmente en HTTPS.",
    options: [
      { label: "Sí, TLS 1.2+ en todas las conexiones", score: 10 },
      { label: "Solo en algunas conexiones", score: 5 },
      { label: "No hay cifrado en tránsito", score: 0 },
    ],
  },
  {
    id: "q9d",
    category: "Protección de Datos",
    icon: "🔒",
    question: "¿Tienen política de retención de datos?",
    description: "Cuánto tiempo se guardan y cómo se eliminan.",
    options: [
      { label: "Sí, política documentada con procedimiento de eliminación", score: 10 },
      { label: "Tenemos idea de cuánto guardamos", score: 5 },
      { label: "No hay política de retención", score: 0 },
    ],
  },
  {
    id: "q9e",
    category: "Protección de Datos",
    icon: "🔒",
    question: "¿Tienen DLP (Data Loss Prevention) implementado?",
    description: "Prevención de fuga de información sensible.",
    options: [
      { label: "Sí, DLP en correo y endpoints", score: 10 },
      { label: "Lo estamos implementando", score: 5 },
      { label: "No hay DLP", score: 0 },
    ],
  },

  // ========== CUMPLIMIENTO NORMATIVO ==========
  {
    id: "q10",
    category: "Cumplimiento",
    icon: "⚖️",
    question: "¿Tienen designado un responsable de protección de datos (DPO)?",
    description: "Encargado de privacidad y cumplimiento.",
    options: [
      { label: "Sí, DPO designado formalmente", score: 10 },
      { label: "Tenemos alguien que cumple esa función", score: 5 },
      { label: "No hay DPO", score: 0 },
    ],
  },
  {
    id: "q10b",
    category: "Cumplimiento",
    icon: "⚖️",
    question: "¿Han realizado una evaluación de impacto de privacidad (EIP/DPIA)?",
    description: "Análisis de riesgo para tratamientos de datos sensibles.",
    options: [
      { label: "Sí, para todos los procesos que lo requieren", score: 10 },
      { label: "Hemos hecho algunas evaluaciones", score: 5 },
      { label: "No hemos hecho evaluaciones", score: 0 },
    ],
  },
  {
    id: "q10c",
    category: "Cumplimiento",
    icon: "⚖️",
    question: "¿Tienen registro de actividades de tratamiento de datos?",
    description: "Inventario de qué datos procesan y cómo (Artículo 30 GDPR).",
    options: [
      { label: "Sí, completo y actualizado", score: 10 },
      { label: "Parcialmente", score: 5 },
      { label: "No hay registro", score: 0 },
    ],
  },
  {
    id: "q10d",
    category: "Cumplimiento",
    icon: "⚖️",
    question: "¿Tienen política de privacidad publicada y accesible?",
    description: "Aviso de privacidad para clientes y usuarios.",
    options: [
      { label: "Sí, en el sitio web y aceptada por usuarios", score: 10 },
      { label: "Tenemos una pero no está actualizada", score: 5 },
      { label: "No hay política de privacidad", score: 0 },
    ],
  },
  {
    id: "q10e",
    category: "Cumplimiento",
    icon: "⚖️",
    question: "¿Tienen proceso para atender solicitudes de derechos de los usuarios?",
    description: "Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición).",
    options: [
      { label: "Sí, proceso documentado y plazos definidos", score: 10 },
      { label: "Respondemos cuando nos piden, sin proceso formal", score: 5 },
      { label: "No hay proceso", score: 0 },
    ],
  },
  {
    id: "q10f",
    category: "Cumplimiento",
    icon: "⚖️",
    question: "¿Han tenido una auditoría de seguridad en los últimos 12 meses?",
    description: "Auditoría interna o externa de ciberseguridad.",
    options: [
      { label: "Sí, auditoría externa reciente", score: 10 },
      { label: "Auditoría interna hace más de 12 meses", score: 5 },
      { label: "No hemos tenido auditoría", score: 0 },
    ],
  },
  {
    id: "q10g",
    category: "Cumplimiento",
    icon: "⚖️",
    question: "¿Tienen certificaciones de seguridad vigentes?",
    description: "ISO 27001, SOC 2, PCI-DSS, etc.",
    options: [
      { label: "Sí, certificación vigente", score: 10 },
      { label: "En proceso de certificación", score: 5 },
      { label: "No tenemos certificaciones", score: 0 },
    ],
  },

  // ========== INCIDENTES ==========
  {
    id: "q11",
    category: "Incidentes",
    icon: "🚨",
    question: "¿Tienen plan de respuesta a incidentes documentado?",
    description: "Procedimiento ante brechas de seguridad.",
    options: [
      { label: "Sí, con equipo designado y simulações", score: 10 },
      { label: "Tenemos un plan básico", score: 5 },
      { label: "No hay plan de respuesta", score: 0 },
    ],
  },
  {
    id: "q11b",
    category: "Incidentes",
    icon: "🚨",
    question: "¿Tienen sistema de logging y retención de logs?",
    description: "Registros de actividad para investigación.",
    options: [
      { label: "Sí, logs centralizados por 12+ meses", score: 10 },
      { label: "Algunos logs, no centralizados", score: 5 },
      { label: "No hay logs", score: 0 },
    ],
  },
  {
    id: "q11c",
    category: "Incidentes",
    icon: "🚨",
    question: "¿Existe comunicación de incidentes a autoridades en 72 horas?",
    description: "Requisito GDPR y otras normativas.",
    options: [
      { label: "Sí, está documentado en el plan de respuesta", score: 10 },
      { label: "Lo investigaríamos si ocurre", score: 5 },
      { label: "No hay procedimiento", score: 0 },
    ],
  },

  // ========== SEGURIDAD FÍSICA ==========
  {
    id: "q12",
    category: "Seguridad Física",
    icon: "🏢",
    question: "¿Las instalaciones tienen control de acceso físico?",
    description: "Tarjetas, biometricos, registro de visitantes.",
    options: [
      { label: "Sí, control de acceso con registro", score: 10 },
      { label: "Solo en áreas principales", score: 5 },
      { label: "No hay control de acceso", score: 0 },
    ],
  },
  {
    id: "q12b",
    category: "Seguridad Física",
    icon: "🏢",
    question: "¿Los servidores están en sala segura con climatización y seguridad?",
    description: "Data center o cuarto de servidores dedicado.",
    options: [
      { label: "Sí, en data center con controles", score: 10 },
      { label: "En cuarto con básico control de acceso", score: 5 },
      { label: "Servidores en oficina sin seguridad", score: 0 },
    ],
  },

  // ========== ACCESO Y USUARIOS ==========
  {
    id: "q13",
    category: "Acceso y Usuarios",
    icon: "👥",
    question: "¿El acceso a sistemas sigue principio de mínimo privilegio?",
    description: "Solo acceso a lo necesario para cada rol.",
    options: [
      { label: "Sí, con roles y revisión periódica", score: 10 },
      { label: "Generalmente, pero no es estricto", score: 5 },
      { label: "Cualquiera tiene acceso a todo", score: 0 },
    ],
  },
  {
    id: "q13b",
    category: "Acceso y Usuarios",
    icon: "👥",
    question: "¿Los accesos se revocan automáticamente al terminar contrato?",
    description: "Proceso de offboarding automatizado.",
    options: [
      { label: "Sí, hay proceso de revocación inmediata", score: 10 },
      { label: "Generalmente se hace, pero puede delay", score: 5 },
      { label: "No hay proceso, a veces se olvida", score: 0 },
    ],
  },
  {
    id: "q13c",
    category: "Acceso y Usuarios",
    icon: "👥",
    question: "¿Se realiza auditoría trimestral de accesos?",
    description: "Revisión de quién tiene acceso a qué.",
    options: [
      { label: "Sí, auditoría trimestral documentada", score: 10 },
      { label: "Ocasionalmente lo revisamos", score: 5 },
      { label: "No revisamos accesos", score: 0 },
    ],
  },

  // ========== DESARROLLO SEGURO (si aplica) ==========
  {
    id: "q14",
    category: "Desarrollo Seguro",
    icon: "💻",
    question: "¿El código se revisa安全性mente antes de producción?",
    description: "Code review con enfoque en seguridad.",
    options: [
      { label: "Sí, siempre hay revisión de seguridad", score: 10 },
      { label: "A veces, no en todos los cambios", score: 5 },
      { label: "No hay revisión de seguridad", score: 0 },
    ],
  },
  {
    id: "q14b",
    category: "Desarrollo Seguro",
    icon: "💻",
    question: "¿Las aplicaciones web tienen protección contra OWASP Top 10?",
    description: "SQL injection, XSS, CSRF, etc.",
    options: [
      { label: "Sí, protección contra las principales amenazas", score: 10 },
      { label: "Parcialmente, algunas cosas", score: 5 },
      { label: "No hay protección específica", score: 0 },
    ],
  },
  {
    id: "q14c",
    category: "Desarrollo Seguro",
    icon: "💻",
    question: "¿Las APIs tienen autenticación y limitación de tasa?",
    description: "JWT, OAuth, rate limiting.",
    options: [
      { label: "Sí, con auth y rate limiting configurado", score: 10 },
      { label: "Algo de protección, pero incompleto", score: 5 },
      { label: "No hay protección en APIs", score: 0 },
    ],
  },

  // ========== CLOUD SECURITY ==========
  {
    id: "q15",
    category: "Cloud Security",
    icon: "☁️",
    question: "¿Tienen inventario de todos los recursos en la nube?",
    description: "Qué servicios cloud usan y qué recursos hay.",
    options: [
      { label: "Sí, inventario completo y actualizado", score: 10 },
      { label: "Parcial, conocemos algunos", score: 5 },
      { label: "No hay inventario", score: 0 },
    ],
  },
  {
    id: "q15b",
    category: "Cloud Security",
    icon: "☁️",
    question: "¿Los permisos en la nube siguen principio de mínimo privilegio?",
    description: "IAM con roles específicos.",
    options: [
      { label: "Sí, IAM bien configurado", score: 10 },
      { label: "Algunos usuarios tienen permisos excesivos", score: 5 },
      { label: "No hay control de permisos", score: 0 },
    ],
  },
  {
    id: "q15c",
    category: "Cloud Security",
    icon: "☁️",
    question: "¿El almacenamiento en la nube es privado (no público)?",
    description: "Buckets y containers con acceso restringido.",
    options: [
      { label: "Sí, todo privado por defecto", score: 10 },
      { label: "Algunos recursos están públicos", score: 5 },
      { label: "No hemos revisado configuraciones", score: 0 },
    ],
  },

  // ========== MOVIL ==========
  {
    id: "q16",
    category: "Dispositivos Móviles",
    icon: "📱",
    question: "¿Tienen MDM (Mobile Device Management) para dispositivos corporativos?",
    description: "Gestión centralizada de móviles y tablets.",
    options: [
      { label: "Sí, todos los dispositivos tienen MDM", score: 10 },
      { label: "Solo algunos", score: 5 },
      { label: "No hay MDM", score: 0 },
    ],
  },
  {
    id: "q16b",
    category: "Dispositivos Móviles",
    icon: "📱",
    question: "¿Los dispositivos móviles tienen código de bloqueo y cifrado?",
    description: "PIN/password y cifrado de disco.",
    options: [
      { label: "Sí, obligatorio para todos", score: 10 },
      { label: "Solo en algunos", score: 5 },
      { label: "No hay política móvil", score: 0 },
    ],
  },
  {
    id: "q16c",
    category: "Dispositivos Móviles",
    icon: "📱",
    question: "¿Tienen container/aplicación para trabajo remoto seguro?",
    description: "Perfiles separados para datos corporativos.",
    options: [
      { label: "Sí, con separación de datos", score: 10 },
      { label: "Usan MDM pero sin container", score: 5 },
      { label: "No hay separación", score: 0 },
    ],
  },

  // ========== PROVEEDORES ==========
  {
    id: "q17",
    category: "Proveedores",
    icon: "🤝",
    question: "¿Evalúan la seguridad de proveedores y terceros?",
    description: "Due diligence de ciberseguridad antes de contratar.",
    options: [
      { label: "Sí, evaluación formal de seguridad", score: 10 },
      { label: "Preguntamos pero no evaluamos formalmente", score: 5 },
      { label: "No evaluamos proveedores", score: 0 },
    ],
  },
  {
    id: "q17b",
    category: "Proveedores",
    icon: "🤝",
    question: "¿Tienen cláusulas de seguridad en contratos con proveedores?",
    description: "Términos de confidencialidad y seguridad.",
    options: [
      { label: "Sí, en todos los contratos importantes", score: 10 },
      { label: "En algunos, no en todos", score: 5 },
      { label: "No hay cláusulas", score: 0 },
    ],
  },
  {
    id: "q17c",
    category: "Proveedores",
    icon: "🤝",
    question: "¿Monitorean el acceso de proveedores a sistemas?",
    description: "Logs y acceso restringido a solo lo necesario.",
    options: [
      { label: "Sí, con acceso limitado y logged", score: 10 },
      { label: "Tienen acceso pero no monitoreamos", score: 5 },
      { label: "Proveedores tienen acceso libre", score: 0 },
    ],
  },

  // ========== DOCUMENTACIÓN ==========
  {
    id: "q18",
    category: "Documentación",
    icon: "📄",
    question: "¿Tienen política de seguridad de la información documentada?",
    description: "Documento oficial de políticas de seguridad.",
    options: [
      { label: "Sí, aprobada por gerencia y comunicada", score: 10 },
      { label: "Tenemos algo documentado", score: 5 },
      { label: "No hay política documentada", score: 0 },
    ],
  },
  {
    id: "q18b",
    category: "Documentación",
    icon: "📄",
    question: "¿Tienen mapa de activos y red documentado?",
    description: "Inventario de hardware, software, datos.",
    options: [
      { label: "Sí, completo y actualizado", score: 10 },
      { label: "Parcial, falta actualizar", score: 5 },
      { label: "No hay mapa de activos", score: 0 },
    ],
  },
  {
    id: "q18c",
    category: "Documentación",
    icon: "📄",
    question: "¿Las políticas de seguridad se revisan anualmente?",
    description: "Revisión y actualización de políticas.",
    options: [
      { label: "Sí, revisión anual documentada", score: 10 },
      { label: "Hace más de un año que no revisamos", score: 5 },
      { label: "Nunca hemos revisado", score: 0 },
    ],
  },
];

export const sectorQuestions: Record<string, typeof diagnosticQuestions> = {
  salud: [
    {
      id: "salud1",
      category: "Datos de Pacientes",
      icon: "🏥",
      question: "¿Los datos de pacientes están cifrados en reposo y en tránsito?",
      description: "Cifrado de historias clínicas y información sensible.",
      options: [
        { label: "Sí, toda la información está cifrada con estándares HIPAA", score: 10 },
        { label: "Parcialmente, algunos sistemas tienen cifrado", score: 5 },
        { label: "No, los datos no están cifrados", score: 0 },
      ],
    },
    {
      id: "salud2",
      category: "Cumplimiento",
      icon: "📋",
      question: "¿Cumples con regulations de protección de datos de salud (HIPAA/LGPD)?",
      description: "Cumplimiento con leyes de privacidad médica.",
      options: [
        { label: "Sí, tenemos auditorías regulares", score: 10 },
        { label: "Estamos en proceso de cumplimiento", score: 5 },
        { label: "No hemos evaluado el cumplimiento", score: 0 },
      ],
    },
  ],
  tecnologia: [
    {
      id: "tech1",
      category: "Desarrollo Seguro",
      icon: "⚙️",
      question: "¿Tienen proceso de revisión de seguridad en el desarrollo de software?",
      description: "Code review y pruebas de seguridad en el ciclo de desarrollo.",
      options: [
        { label: "Sí, seguridad integrada en CI/CD", score: 10 },
        { label: "Ocasionalmente hacemos revisiones", score: 5 },
        { label: "No tenemos proceso de seguridad", score: 0 },
      ],
    },
    {
      id: "tech2",
      category: "Infraestructura",
      icon: "☁️",
      question: "¿La infraestructura en la nube está configurada correctamente?",
      description: "Políticas de IAM, VPCs, y configuraciones seguras.",
      options: [
        { label: "Sí, auditorías mensuales de configuración", score: 10 },
        { label: "Hemos revisado algunas veces", score: 5 },
        { label: "No hemos revisado la configuración", score: 0 },
      ],
    },
  ],
  comercio: [
    {
      id: "comercio1",
      category: "Pagos",
      icon: "💳",
      question: "¿Cumples con PCI-DSS para procesamiento de pagos?",
      description: "Estándares de seguridad para tarjetas de pago.",
      options: [
        { label: "Sí, somos certificados PCI-DSS", score: 10 },
        { label: "En proceso de certificación", score: 5 },
        { label: "No procesamos pagos directamente", score: 10 },
      ],
    },
    {
      id: "comercio2",
      category: "Datos de Clientes",
      icon: "👥",
      question: "¿Los datos de clientes están protegidos y tienes política de privacidad?",
      description: "Protección de información personal de clientes.",
      options: [
        { label: "Sí, política de privacidad y protección de datos", score: 10 },
        { label: "Parcialmente, necesitamos mejorarla", score: 5 },
        { label: "No tenemos política de privacidad", score: 0 },
      ],
    },
  ],
  industria: [
    {
      id: "industria1",
      category: "SCADA/ICS",
      icon: "🏭",
      question: "¿Los sistemas de control industrial (SCADA) están aislados de la red IT?",
      description: "Segmentación entre sistemas operativos y de control.",
      options: [
        { label: "Sí, redes completamente separadas", score: 10 },
        { label: "Parcialmente, hay algunos puntos de conexión", score: 5 },
        { label: "No hay segmentación", score: 0 },
      ],
    },
    {
      id: "industria2",
      category: "Seguridad Física",
      icon: "🔒",
      question: "¿Las instalaciones industriales tienen control de acceso físico?",
      description: "Control de acceso a áreas críticas.",
      options: [
        { label: "Sí, con tarjetas y registro de accesos", score: 10 },
        { label: "Solo algunas áreas tienen control", score: 5 },
        { label: "No hay control de acceso físico", score: 0 },
      ],
    },
  ],
  educacion: [
    {
      id: "edu1",
      category: "Datos de Estudiantes",
      icon: "🎓",
      question: "¿Los datos de estudiantes están protegidos conforme a FERPA/LGPD?",
      description: "Privacidad de información académica.",
      options: [
        { label: "Sí, cumplimiento total de privacidad", score: 10 },
        { label: "Parcialmente, en proceso", score: 5 },
        { label: "No hemos evaluado el cumplimiento", score: 0 },
      ],
    },
    {
      id: "edu2",
      category: "Acceso de Usuarios",
      icon: "🎫",
      question: "¿Los estudiantes tienen acceso solo a recursos apropiados para su edad?",
      description: "Control parental y de contenido.",
      options: [
        { label: "Sí, con filtros de contenido y controles parentales", score: 10 },
        { label: "Tenemos algunos filtros básicos", score: 5 },
        { label: "No hay controles de contenido", score: 0 },
      ],
    },
  ],
  restaurante: [
    {
      id: "rest1",
      category: "Pagos",
      icon: "🍽️",
      question: "¿Los sistemas de punto de venta (POS) están protegidos?",
      description: "Seguridad de sistemas de cobro y comandas.",
      options: [
        { label: "Sí, con actualizaciones y monitoreo", score: 10 },
        { label: "做一些基本保护", score: 5 },
        { label: "No tenemos protección especial", score: 0 },
      ],
    },
  ],
  transporte: [
    {
      id: "trans1",
      category: "Flota",
      icon: "🚚",
      question: "¿Los vehículos tienen sistemas de rastreo con acceso seguro?",
      description: "Seguridad de GPS y sistemas de rastreo.",
      options: [
        { label: "Sí, con autenticación y monitoreo", score: 10 },
        { label: "Tenemos rastreo básico", score: 5 },
        { label: "No tenemos sistemas de rastreo", score: 0 },
      ],
    },
  ],
};

export function getQuestionsBySector(sector: string | null | undefined): typeof diagnosticQuestions {
  if (!sector || !sectorQuestions[sector]) {
    return diagnosticQuestions;
  }
  return [...diagnosticQuestions, ...sectorQuestions[sector]];
}

export function getQuestionsWithNormativas(): typeof diagnosticQuestions {
  const normativasQuestions = [
    // ========== ISO 27001 ==========
    {
      id: "iso1",
      category: "ISO 27001",
      icon: "🏆",
      question: "¿Tienen un SGSI (Sistema de Gestión de Seguridad de la Información) implementado?",
      description: "Sistema formal de gestión de seguridad basado en ISO 27001.",
      options: [
        { label: "Sí, certificado o en proceso de certificación", score: 10 },
        { label: "Tenemos un sistema parcialmente implementado", score: 5 },
        { label: "No tenemos SGSI", score: 0 },
      ],
    },
    {
      id: "iso2",
      category: "ISO 27001",
      icon: "🏆",
      question: "¿Han identificado y documentado todos los activos de información?",
      description: "Inventario de activos con clasificación.",
      options: [
        { label: "Sí, completo con clasificación de sensibilidad", score: 10 },
        { label: "Parcialmente", score: 5 },
        { label: "No hay inventario de activos", score: 0 },
      ],
    },
    // ========== NIST FRAMEWORK ==========
    {
      id: "nist1",
      category: "NIST",
      icon: "🇺🇸",
      question: "¿Utilizan el NIST Cybersecurity Framework para gestionar riesgos?",
      description: "Identificar, Proteger, Detectar, Responder, Recuperar.",
      options: [
        { label: "Sí, siguiendo las 5 funciones del NIST", score: 10 },
        { label: "Parcialmente, algunas funciones", score: 5 },
        { label: "No usamos NIST", score: 0 },
      ],
    },
    // ========== GDPR / LGPD ==========
    {
      id: "gdpr1",
      category: "GDPR/LGPD",
      icon: "🇪🇺",
      question: "¿Cumplen con GDPR (si procesan datos de ciudadanos europeos) o LGPD (Colombia)?",
      description: "Reglamento General de Protección de Datos.",
      options: [
        { label: "Sí, cumplimiento total verificado", score: 10 },
        { label: "En proceso de cumplimiento", score: 5 },
        { label: "No hemos evaluado cumplimiento", score: 0 },
      ],
    },
    // ========== PCI-DSS ==========
    {
      id: "pci1",
      category: "PCI-DSS",
      icon: "💳",
      question: "¿Procesan datos de tarjetas de pago y cumplen PCI-DSS?",
      description: "Payment Card Industry Data Security Standard.",
      options: [
        { label: "Sí, certificado PCI-DSS vigente", score: 10 },
        { label: "Cumplimos requisitos básicos", score: 5 },
        { label: "No procesamos pagos con tarjeta", score: 10 },
      ],
    },
    {
      id: "pci2",
      category: "PCI-DSS",
      icon: "💳",
      question: "¿Los sistemas de pago están aislados de la red general?",
      description: "Segmentación de red para datos de tarjeta.",
      options: [
        { label: "Sí, red completamente aislada (cardholder data environment)", score: 10 },
        { label: "Parcialmente aislados", score: 5 },
        { label: "No hay segmentación", score: 0 },
      ],
    },
    // ========== HIPAA ==========
    {
      id: "hipaa1",
      category: "HIPAA",
      icon: "🏥",
      question: "¿Cumplen con HIPAA para protección de información de salud (PHI)?",
      description: "Health Insurance Portability and Accountability Act.",
      options: [
        { label: "Sí, con BAA firmados con todos los proveedores", score: 10 },
        { label: "Parcialmente, algunos proveedores", score: 5 },
        { label: "No procesamos PHI", score: 10 },
      ],
    },
    // ========== SOC 2 ==========
    {
      id: "soc1",
      category: "SOC 2",
      icon: "📊",
      question: "¿Tienen informe SOC 2 (Type I o Type II)?",
      description: "Service Organization Control para servicios digitales.",
      options: [
        { label: "Sí, SOC 2 Type II vigente", score: 10 },
        { label: "SOC 2 Type I o en proceso", score: 5 },
        { label: "No tenemos SOC 2", score: 0 },
      ],
    },
    // ========== CIBERSEGURIDAD COLOMBIA ==========
    {
      id: "col1",
      category: "Colombia",
      icon: "🇨🇴",
      question: "¿Conocen y cumplen con la Ley 1581 de 2012 de Protección de Datos Personales?",
      description: "Régimen general de protección de datos en Colombia.",
      options: [
        { label: "Sí, completamente adaptados", score: 10 },
        { label: "En proceso de adaptación", score: 5 },
        { label: "No conocemos la ley", score: 0 },
      ],
    },
    {
      id: "col2",
      category: "Colombia",
      icon: "🇨🇴",
      question: "¿Han reportado incidentes de seguridad a la SIC o MinTIC cuando es requerido?",
      description: "Obligatoriedad de Reporte según normativa.",
      options: [
        { label: "Sí, sabemos el procedimiento y lo hemos hecho", score: 10 },
        { label: "Conocemos el procedimiento pero no hemos reportado", score: 5 },
        { label: "No conocemos el procedimiento", score: 0 },
      ],
    },
    {
      id: "col3",
      category: "Colombia",
      icon: "🇨🇴",
      question: "¿Tienen contacto con el CSIRT (Equipo de Respuesta a Incidentes) de MinTIC?",
      description: "Coordinación con autoridades de ciberseguridad.",
      options: [
        { label: "Sí, estamos registrados y comunicado", score: 10 },
        { label: "Lo conocemos pero no estamos registrados", score: 5 },
        { label: "No conocemos el CSIRT", score: 0 },
      ],
    },
  ];
  
  return [...diagnosticQuestions, ...normativasQuestions];
}

export function calculateSecurityLevel(score: number): { level: RiskLevel; label: string; color: string; description: string } {
  if (score >= 75) return {
    level: 'bajo',
    label: 'BUENO',
    color: 'text-risk-low',
    description: 'Tu empresa tiene buenas prácticas de seguridad. Continúa mejorando.',
  };
  if (score >= 50) return {
    level: 'medio',
    label: 'MODERADO',
    color: 'text-risk-medium',
    description: 'Hay aspectos importantes por mejorar. Actúa en las recomendaciones.',
  };
  if (score >= 25) return {
    level: 'alto',
    label: 'RIESGO ALTO',
    color: 'text-risk-high',
    description: 'Tu empresa tiene vulnerabilidades serias. Requiere acción inmediata.',
  };
  return {
    level: 'crítico',
    label: 'CRÍTICO',
    color: 'text-risk-critical',
    description: 'Situación de riesgo crítico. Implementa acciones de seguridad urgentemente.',
  };
}
