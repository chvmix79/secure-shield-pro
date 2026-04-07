import { supabase } from '@/lib/supabase';
import type { PlanType } from '@/lib/database.types';

export type MetodoPago = 'transferencia' | 'consignacion' | 'nequi' | 'daviplata';

export interface SolicitudPago {
  id?: string;
  empresa_id: string;
  plan: PlanType;
  metodo: MetodoPago;
  monto: number;
  ciclo?: 'mensual' | 'anual';
  fecha_solicitud: string;
  comprobante_url?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fecha_pago?: string;
  notas?: string;
}

export const informacionPago = {
  banco: "Banco de Colombia",
  cuenta: "Cuenta de Ahorros 123-456-789",
  nit: "900.123.456-7",
  concepto: "Pago CHV Ciberdefensa - [NOMBRE EMPRESA]",
  contacto: "pagos@chvciberdefensa.com",
};

export const pagoService = {
  async crearSolicitud(data: Omit<SolicitudPago, 'id' | 'fecha_solicitud' | 'estado'>) {
    const { data: solicitud, error } = await supabase
      .from('solicitudes_pago')
      .insert({
        ...data,
        fecha_solicitud: new Date().toISOString(),
        estado: 'pendiente',
      })
      .select()
      .single();
    if (error) throw error;
    return solicitud;
  },

  async getSolicitudesPorEmpresa(empresaId: string) {
    const { data, error } = await supabase
      .from('solicitudes_pago')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('fecha_solicitud', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getSolicitudesPendientes() {
    const { data, error } = await supabase
      .from('solicitudes_pago')
      .select('*, empresas(nombre, email)')
      .eq('estado', 'pendiente')
      .order('fecha_solicitud', { ascending: false });
    if (error) throw error;
    return data;
  },

  async aprobarSolicitud(solicitudId: string, empresaId: string, plan: PlanType, ciclo: 'mensual' | 'anual' = 'mensual') {
    const { data: solicitud, error: errorUpdate } = await supabase
      .from('solicitudes_pago')
      .update({
        estado: 'aprobado',
        fecha_pago: new Date().toISOString(),
      })
      .eq('id', solicitudId)
      .select()
      .single();

    if (errorUpdate) throw errorUpdate;

    const fechaFin = new Date();
    if (ciclo === 'anual') {
      fechaFin.setDate(fechaFin.getDate() + 365);
    } else {
      fechaFin.setDate(fechaFin.getDate() + 30);
    }

    await supabase
      .from('empresas')
      .update({
        plan: plan,
        fecha_inicio: new Date().toISOString(),
        fecha_fin: fechaFin.toISOString(),
        subscription_status: 'active',
        cuenta_bloqueada: false,
        fecha_bloqueo: null,
      })
      .eq('id', empresaId);

    return solicitud;
  },

  async desbloquearCuenta(empresaId: string, plan: PlanType, durationDays: number = 30) {
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + durationDays);

    const { data, error } = await supabase
      .from('empresas')
      .update({
        plan: plan,
        fecha_inicio: new Date().toISOString(),
        fecha_fin: fechaFin.toISOString(),
        subscription_status: 'active',
        cuenta_bloqueada: false,
        fecha_bloqueo: null,
      })
      .eq('id', empresaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async rechazarSolicitud(solicitudId: string, motivo: string) {
    const { data, error } = await supabase
      .from('solicitudes_pago')
      .update({
        estado: 'rechazado',
        notas: motivo,
      })
      .eq('id', solicitudId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getMontoPorPlan(plan: PlanType, ciclo: 'mensual' | 'anual' = 'mensual'): number {
    const preciosMensuales: Record<PlanType, number> = {
      free: 0,
      basic: 150000,
      pro: 350000,
    };
    const preciosAnuales: Record<PlanType, number> = {
      free: 0,
      basic: 1500000,
      pro: 3500000,
    };
    return ciclo === 'anual' ? preciosAnuales[plan] : preciosMensuales[plan];
  },

  getDescripcionMetodo(metodo: MetodoPago): string {
    const metodos: Record<MetodoPago, string> = {
      transferencia: 'Transferencia bancaria',
      consignacion: 'Consignación en cuenta',
      nequi: 'Transferencia Nequi',
      daviplata: 'Transferencia Daviplata',
    };
    return metodos[metodo];
  },
};