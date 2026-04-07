import { supabase } from './supabase';
import type { PlanType } from './database.types';

export interface PlanFeatures {
  maxUsuarios: number;
  diagnosticosIlimitados: boolean;
  moduloPhishing: boolean;
  moduloVulnerabilidades: boolean;
  moduloMicrosoft365: boolean;
  moduloChatIA: boolean;
  moduloDocumentos: boolean;
  exportarPDF: boolean;
  soportePrioritario: boolean;
}

export interface EstadoSuscripcion {
  plan: PlanType;
  fecha_fin: string | null;
  fecha_inicio: string | null;
  subscription_status: string;
  cuenta_bloqueada: boolean;
  diasRestantes: number;
  estaVencida: boolean;
  estaBloqueada: boolean;
}

export const PLANES: Record<PlanType, { nombre: string; precio: number; precio_anual: number; features: PlanFeatures }> = {
  free: {
    nombre: "Prueba Gratis",
    precio: 0,
    precio_anual: 0,
    features: {
      maxUsuarios: 1,
      diagnosticosIlimitados: false,
      moduloPhishing: false,
      moduloVulnerabilidades: false,
      moduloMicrosoft365: false,
      moduloChatIA: false,
      moduloDocumentos: false,
      exportarPDF: false,
      soportePrioritario: false,
    },
  },
  basic: {
    nombre: "Básico",
    precio: 150000,
    precio_anual: 1500000, // Descuento: 2 meses gratis (1.8M -> 1.5M)
    features: {
      maxUsuarios: 3,
      diagnosticosIlimitados: true,
      moduloPhishing: true,
      moduloVulnerabilidades: false,
      moduloMicrosoft365: false,
      moduloChatIA: true,
      moduloDocumentos: true,
      exportarPDF: true,
      soportePrioritario: false,
    },
  },
  pro: {
    nombre: "Profesional",
    precio: 350000,
    precio_anual: 3500000, // Descuento: 2 meses gratis (4.2M -> 3.5M)
    features: {
      maxUsuarios: 999,
      diagnosticosIlimitados: true,
      moduloPhishing: true,
      moduloVulnerabilidades: true,
      moduloMicrosoft365: true,
      moduloChatIA: true,
      moduloDocumentos: true,
      exportarPDF: true,
      soportePrioritario: true,
    },
  },
};

export const suscripcionService = {
  async getEstadoSuscripcion(empresaId: string): Promise<EstadoSuscripcion> {
    const { data } = await supabase
      .from('empresas')
      .select('plan, fecha_fin, fecha_inicio, subscription_status, cuenta_bloqueada')
      .eq('id', empresaId)
      .single();
    
    if (!data) {
      return {
        plan: 'free',
        fecha_fin: null,
        fecha_inicio: null,
        subscription_status: 'active',
        cuenta_bloqueada: false,
        diasRestantes: 0,
        estaVencida: false,
        estaBloqueada: false,
      };
    }
    
    const ahora = new Date();
    const fechaFin = data.fecha_fin ? new Date(data.fecha_fin) : null;
    const diasRestantes = fechaFin ? Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const estaVencida = fechaFin ? fechaFin < ahora : false;
    const estaBloqueada = data.cuenta_bloqueada === true;
    
    let plan = data.plan as PlanType;
    let subscription_status = data.subscription_status;
    
    if (estaBloqueada) {
      subscription_status = 'blocked';
    } else if (data.subscription_status === 'cancelled' || data.subscription_status === 'expired') {
      plan = 'free';
    } else if (estaVencida) {
      await supabase
        .from('empresas')
        .update({ subscription_status: 'expired' })
        .eq('id', empresaId);
      subscription_status = 'expired';
    }
    
    return {
      plan,
      fecha_fin: data.fecha_fin,
      fecha_inicio: data.fecha_inicio,
      subscription_status,
      cuenta_bloqueada: estaBloqueada,
      diasRestantes,
      estaVencida,
      estaBloqueada,
    };
  },

  async getPlan(empresaId: string): Promise<PlanType> {
    const estado = await this.getEstadoSuscripcion(empresaId);
    return estado.plan;
  },

  async estaBloqueada(empresaId: string): Promise<boolean> {
    const estado = await this.getEstadoSuscripcion(empresaId);
    return estado.estaBloqueada;
  },

  async upgradePlan(empresaId: string, nuevoPlan: PlanType, durationDays: number = 30) {
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + durationDays);

    const { data, error } = await supabase
      .from('empresas')
      .update({
        plan: nuevoPlan,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        subscription_status: 'active',
      })
      .eq('id', empresaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async renewPlan(empresaId: string, durationDays: number = 30) {
    const { data: empresa } = await supabase
      .from('empresas')
      .select('fecha_fin, plan')
      .eq('id', empresaId)
      .single();

    if (!empresa) return null;

    let fechaFin = empresa.fecha_fin ? new Date(empresa.fecha_fin) : new Date();
    if (fechaFin < new Date()) {
      fechaFin = new Date();
    }
    fechaFin.setDate(fechaFin.getDate() + durationDays);

    const { data, error } = await supabase
      .from('empresas')
      .update({
        fecha_inicio: new Date().toISOString(),
        fecha_fin: fechaFin.toISOString(),
        subscription_status: 'active',
      })
      .eq('id', empresaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelPlan(empresaId: string) {
    const { data, error } = await supabase
      .from('empresas')
      .update({ subscription_status: 'cancelled' })
      .eq('id', empresaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  puedeAcceder(modulo: string, plan: PlanType): boolean {
    const features = PLANES[plan].features;
    
    switch (modulo) {
      case 'phishing': return features.moduloPhishing;
      case 'vulnerabilidades': return features.moduloVulnerabilidades;
      case 'microsoft365': return features.moduloMicrosoft365;
      case 'chat': return features.moduloChatIA;
      case 'documentos': return features.moduloDocumentos;
      default: return true;
    }
  },

  puedeExportarPDF(plan: PlanType): boolean {
    return PLANES[plan].features.exportarPDF;
  },

  puedeCrearUsuario(plan: PlanType, usuariosActuales: number): boolean {
    return usuariosActuales < PLANES[plan].features.maxUsuarios;
  },
};