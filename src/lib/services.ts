import { supabase } from './supabase';
import type { 
  Empresa, 
  Diagnostico, 
  Accion, 
  Evidencia, 
  Alerta, 
  Configuracion,
  RiskLevel,
  ActionStatus,
  ActionPriority
} from './database.types';

export const empresaService = {
  async create(data: Omit<Empresa, 'id' | 'created_at' | 'updated_at'>) {
    const { data: empresa, error } = await supabase
      .from('empresas')
      .insert(data)
      .select()
      .single();
    if (error) throw error;

    // Inicializar documentos de cumplimiento automáticamente
    try {
      await documentoService.initialize(empresa.id);
    } catch (e) {
      console.warn("Failed to auto-init documents", e);
    }

    // Crear alerta de bienvenida
    try {
      await alertaService.create({
        empresa_id: empresa.id,
        titulo: "¡Bienvenido a Evidence Shield!",
        descripcion: "Tu panel de ciberseguridad ha sido activado. Comienza realizando el diagnóstico inicial.",
        tipo: "info",
        leida: false
      });
    } catch (e) {
      console.warn("Failed to create welcome alert", e);
    }

    return empresa;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('email', email)
      .single();
    if (error) return null;
    return data;
  },

  async update(id: string, data: Partial<Empresa>) {
    const { data: empresa, error } = await supabase
      .from('empresas')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return empresa;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export const diagnosticoService = {
  async create(data: Omit<Diagnostico, 'id' | 'created_at'>) {
    const { data: diagnostico, error } = await supabase
      .from('diagnosticos')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return diagnostico;
  },

  async getByEmpresa(empresaId: string) {
    const { data, error } = await supabase
      .from('diagnosticos')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getLatest(empresaId: string) {
    const { data, error } = await supabase
      .from('diagnosticos')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) return null;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('diagnosticos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
};

export const accionService = {
  async create(data: Omit<Accion, 'id' | 'created_at' | 'updated_at'>) {
    const { data: accion, error } = await supabase
      .from('acciones')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return accion;
  },

  async createMany(data: Omit<Accion, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data: acciones, error } = await supabase
      .from('acciones')
      .insert(data)
      .select();
    if (error) throw error;
    return acciones;
  },

  async getByEmpresa(empresaId: string) {
    const { data, error } = await supabase
      .from('acciones')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('acciones')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, data: Partial<Accion>) {
    const { data: accion, error } = await supabase
      .from('acciones')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return accion;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('acciones')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateStatus(id: string, estado: ActionStatus) {
    return this.update(id, { estado });
  }
};

export const evidenciaService = {
  async create(data: Omit<Evidencia, 'id' | 'created_at'>) {
    const { data: evidencia, error } = await supabase
      .from('evidencias')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return evidencia;
  },

  async getByAccion(accionId: string) {
    const { data, error } = await supabase
      .from('evidencias')
      .select('*')
      .eq('accion_id', accionId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('evidencias')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export const alertaService = {
  async create(data: Omit<Alerta, 'id' | 'created_at'>) {
    const { data: alerta, error } = await supabase
      .from('alertas')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return alerta;
  },

  async getByEmpresa(empresaId: string, unreadOnly = false) {
    let query = supabase
      .from('alertas')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });
    
    if (unreadOnly) {
      query = query.eq('leida', false);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('alertas')
      .update({ leida: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAllAsRead(empresaId: string) {
    const { error } = await supabase
      .from('alertas')
      .update({ leida: true })
      .eq('empresa_id', empresaId)
      .eq('leida', false);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('alertas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

export const configuracionService = {
  async create(data: Omit<Configuracion, 'id' | 'created_at' | 'updated_at'>) {
    const { data: config, error } = await supabase
      .from('configuraciones')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return config;
  },

  async getByEmpresa(empresaId: string) {
    const { data, error } = await supabase
      .from('configuraciones')
      .select('*')
      .eq('empresa_id', empresaId)
      .single();
    if (error) return null;
    return data;
  },

  async update(empresaId: string, data: Partial<Configuracion>) {
    const { data: config, error } = await supabase
      .from('configuraciones')
      .update(data)
      .eq('empresa_id', empresaId)
      .select()
      .single();
    if (error) throw error;
    return config;
  }
};

export const usuarioService = {
  async create(data: Omit<import('./database.types').Usuario, 'id' | 'created_at' | 'updated_at'>) {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return usuario;
  },

  async getByEmpresa(empresaId: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, data: Partial<import('./database.types').Usuario>) {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return usuario;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('usuarios')
      .update({ activo: false })
      .eq('id', id);
    if (error) throw error;
  },

  async updateModulos(id: string, modulos: string[]) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ modulos })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const vulnerabilidadService = {
  async getByEmpresa(empresaId: string) {
    const { data, error } = await supabase
      .from('vulnerabilidades')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

export const documentoService = {
  async getByEmpresa(empresaId: string) {
    const { data, error } = await supabase
      .from('cumplimiento_documentos')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('categoria', { ascending: true });
    if (error) throw error;
    return data;
  },

  async update(id: string, data: Partial<import('./database.types').DocumentoCumplimiento>) {
    const { data: doc, error } = await supabase
      .from('cumplimiento_documentos')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return doc;
  },

  async initialize(empresaId: string) {
    const { data: existing } = await supabase
      .from('cumplimiento_documentos')
      .select('id')
      .eq('empresa_id', empresaId)
      .limit(1);

    if (existing && existing.length > 0) return;

    const defaultDocs = [
      { nombre: "Política de Seguridad de la Información", categoria: "Políticas", norma: "ISO 27001", estado: "faltante" },
      { nombre: "Manual de Protección de Datos", categoria: "Legal", norma: "GDPR/Habeas Data", estado: "faltante" },
      { nombre: "Plan de Continuidad del Negocio", categoria: "Operaciones", norma: "ISO 22301", estado: "faltante" },
      { nombre: "Registro de Activos de Información", categoria: "Gestión de Activos", norma: "ISO 27001", estado: "faltante" },
      { nombre: "Matriz de Riesgos Ciber", categoria: "Gestión de Riesgos", norma: "NIST CSF", estado: "faltante" },
      { nombre: "Plan de Respuesta a Incidentes", categoria: "Operaciones", norma: "NIST SP 800-61", estado: "faltante" },
      { nombre: "Control de Accesos y Usuarios", categoria: "Políticas", norma: "ISO 27001", estado: "faltante" },
      { nombre: "Política de Escritorio Limpio", categoria: "Políticas", norma: "ISO 27001", estado: "faltante" },
      { nombre: "Acuerdos de Confidencialidad (NDA)", categoria: "Legal", norma: "Legal", estado: "faltante" },
      { nombre: "Registro de Capacitación en Seguridad", categoria: "Humano", norma: "ISO 27001", estado: "faltante" },
      { nombre: "Política de Uso de Activos", categoria: "Políticas", norma: "ISO 27001", estado: "faltante" },
      { nombre: "Procedimiento de Backup", categoria: "Técnico", norma: "ISO 27001", estado: "faltante" },
      { nombre: "Registro de Mantenimiento de Hardware", categoria: "Técnico", norma: "ISO 27001", estado: "faltante" },
      { nombre: "Evaluación de Proveedores Tech", categoria: "Terceros", norma: "ISO 27001", estado: "faltante" },
      { nombre: "Política de Teletrabajo Seguro", categoria: "Políticas", norma: "ISO 27001", estado: "faltante" }
    ];

    const docsToInsert = defaultDocs.map(doc => ({
      ...doc,
      empresa_id: empresaId
    }));

    const { error } = await supabase
      .from('cumplimiento_documentos')
      .insert(docsToInsert);
    
    if (error) throw error;
  }
};

export const scoreHistoryService = {
  async getByEmpresa(empresaId: string) {
    const { data, error } = await supabase
      .from('score_history')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('mes', { ascending: true });
    if (error) throw error;
    return data;
  },

  async recordScore(empresaId: string, score: number) {
    const mes = new Date().toISOString().substring(0, 7); // YYYY-MM
    const { data, error } = await supabase
      .from('score_history')
      .upsert({ empresa_id: empresaId, score, mes }, { onConflict: 'empresa_id,mes' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const phishingService = {
  async getCampañas(empresaId: string) {
    const { data, error } = await supabase
      .from('campanas_phishing')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createCampaña(data: Omit<import('./database.types').CampañaPhishing, 'id' | 'created_at'>) {
    const { data: campaña, error } = await supabase
      .from('campanas_phishing')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return campaña;
  },

  async recordEvent(campañaId: string, type: 'click' | 'data') {
    const field = type === 'click' ? 'total_clicks' : 'total_datos_ingresados';
    
    // Incremento directo via update
    const { data: current } = await supabase
      .from('campanas_phishing')
      .select(field)
      .eq('id', campañaId)
      .single();
      
    if (current) {
      await supabase
        .from('campanas_phishing')
        .update({ [field]: (current[field as keyof typeof current] || 0) + 1 })
        .eq('id', campañaId);
    }
  }
};

export const microsoft365Service = {
  async getAuditStatus(empresaId: string) {
    // Simulación de auditoría real de Azure AD / M365
    // En producción, esto llamaría a Microsoft Graph API
    return {
      connected: true,
      lastAudit: new Date().toISOString(),
      issues: [
        { id: 1, title: "SharePoint: Acceso anónimo detectado en Carpeta 'Finanzas'", severity: "crítica" },
        { id: 2, title: "Outlook: Reglas de reenvió externo activas en 3 buzones", severity: "alta" },
        { id: 3, title: "Azure AD: 5 usuarios sin MFA habilitado", severity: "media" }
      ]
    };
  }
};
