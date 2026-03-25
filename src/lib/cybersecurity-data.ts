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
];

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
