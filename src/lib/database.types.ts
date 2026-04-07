export type RiskLevel = 'bajo' | 'medio' | 'alto' | 'crítico';
export type ActionStatus = 'pendiente' | 'en_progreso' | 'completada' | 'vencida';
export type ActionPriority = 'baja' | 'media' | 'alta' | 'crítica';
export type EvidenceType = 'imagen' | 'documento' | 'captura';
export type AlertType = 'info' | 'warning' | 'error' | 'critical';
export type UserRole = 'admin' | 'responsable' | 'empleado';
export type PlanType = 'free' | 'basic' | 'pro';
export type DocumentState = 'actualizado' | 'pendiente' | 'obsoleto' | 'faltante';

export interface Empresa {
  id: string;
  nombre: string;
  sector: string | null;
  empleados: string | null;
  nivel_tech: 'bajo' | 'medio' | 'alto' | null;
  email: string;
  password_hash?: string | null;
  user_id?: string | null;
  plan: PlanType;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  cuenta_bloqueada?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Diagnostico {
  id: string;
  empresa_id: string;
  score: number;
  nivel: RiskLevel | null;
  respuestas: Record<string, number> | null;
  created_at: string;
}

export interface Accion {
  id: string;
  empresa_id: string;
  diagnostico_id: string | null;
  titulo: string;
  descripcion: string | null;
  prioridad: ActionPriority | null;
  estado: ActionStatus | null;
  responsable: string | null;
  fecha_limite: string | null;
  categoria: string | null;
  created_at: string;
  updated_at: string;
}

export interface Evidencia {
  id: string;
  accion_id: string;
  titulo: string;
  tipo: EvidenceType | null;
  archivo_url: string | null;
  notas: string | null;
  created_at: string;
}

export interface Alerta {
  id: string;
  empresa_id: string;
  titulo: string;
  descripcion: string | null;
  tipo: AlertType | null;
  leida: boolean;
  created_at: string;
}

export interface Configuracion {
  id: string;
  empresa_id: string;
  notificaciones_email: boolean;
  frecuencia_diagnostico: number;
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  empresa_id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  modulos: string[];
  created_at: string;
  updated_at: string;
}

export interface DocumentoCumplimiento {
  id: string;
  empresa_id: string;
  nombre: string;
  categoria: string | null;
  archivo_url: string | null;
  fecha_subida: string | null;
  fecha_vencimiento: string | null;
  estado: DocumentState;
  norma: string | null;
  descripcion: string | null;
  created_at: string;
}

export interface Vulnerabilidad {
  id: string;
  empresa_id: string;
  titulo: string;
  severidad: 'baja' | 'media' | 'alta' | 'crítica';
  estado: 'abierta' | 'en_proceso' | 'solucionada';
  descripcion: string | null;
  remediacion: string | null;
  created_at: string;
}

export interface ScoreHistory {
  id: string;
  empresa_id: string;
  score: number;
  mes: string; // Formato YYYY-MM
  created_at: string;
}

export interface CampañaPhishing {
  id: string;
  empresa_id: string;
  nombre: string;
  estado: 'programada' | 'en_curso' | 'finalizada';
  total_enviados: number;
  total_clicks: number;
  total_datos_ingresados: number;
  created_at: string;
}

export type Tables = {
  empresas: Empresa;
  diagnosticos: Diagnostico;
  acciones: Accion;
  evidencias: Evidencia;
  alertas: Alerta;
  configuraciones: Configuracion;
  usuarios: Usuario;
  cumplimiento_documentos: DocumentoCumplimiento;
  vulnerabilidades: Vulnerabilidad;
  score_history: ScoreHistory;
  campanas_phishing: CampañaPhishing;
};
