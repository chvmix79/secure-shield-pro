import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { pagoService } from "@/lib/pago";
import { toast } from "sonner";
import { PLANES } from "@/lib/suscripcion";

export interface EmpresaStats {
  id: string;
  nombre: string;
  sector: string;
  email: string;
  diagnosticos_count: number;
  ultimo_diagnostico: string | null;
  score_promedio: number;
  acciones_pendientes: number;
  acciones_completadas: number;
  plan: string;
}

export interface Tool {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: string;
  sitio_web: string;
  tier: string;
  logo: string;
  affiliate_link: string | null;
  commission_percent: number | null;
}

export interface Lead {
  id: string;
  empresa: { nombre: string };
  tipo_servicio: string;
  mensaje: string;
  estado: string;
  created_at: string;
}

export function useAdminData(isAdmin: boolean) {
  const [empresas, setEmpresas] = useState<EmpresaStats[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadAll();
    }
  }, [isAdmin]);

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEmpresas().catch(e => console.error("Error loading empresas:", e)), 
        loadTools().catch(e => console.error("Error loading tools:", e)), 
        loadLeads().catch(e => console.error("Error loading leads:", e)), 
        loadSolicitudes().catch(e => console.error("Error loading requests:", e))
      ]);
    } catch (err) {
      console.error("Error in loadAll:", err);
    } finally {
      setLoading(false);
    }
  };

  async function loadEmpresas() {
    const { data: statsData } = await supabase.from("v_empresas_stats").select("*");
    if (statsData) {
      setEmpresas(statsData.map(stat => ({
        id: stat.id,
        nombre: stat.nombre,
        sector: stat.sector,
        email: stat.email,
        diagnosticos_count: stat.diagnosticos_count || 0,
        ultimo_diagnostico: stat.ultimo_diagnostico,
        score_promedio: Math.round(stat.score_promedio || 0),
        acciones_pendientes: stat.acciones_pendientes || 0,
        acciones_completadas: stat.acciones_completadas || 0,
        plan: stat.plan || 'free'
      })));
    }
  }

  async function loadTools() {
    try {
      const { data, error } = await supabase.from("herramientas").select("*").order("nombre");
      if (error) {
        console.error("Error loading tools:", error);
        return;
      }
      if (data) setTools(data as Tool[]);
    } catch (e) {
      console.error("Exception loading tools:", e);
    }
  }

  async function loadLeads() {
    try {
      const { data, error } = await supabase
        .from("leads_marketplace")
        .select("*, empresa:empresas(nombre)")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error loading leads:", error);
        return;
      }
      if (data) setLeads(data as unknown as Lead[]);
    } catch (e) {
      console.error("Exception loading leads:", e);
    }
  }

  async function loadSolicitudes() {
    try {
      const data = await pagoService.getSolicitudesPendientes();
      if (data) setSolicitudes(data);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
    }
  }

  const handleAprobarPago = async (solicitud: any) => {
    if (!confirm(`¿Aprobar el pago de ${solicitud.monto.toLocaleString()} para el plan ${PLANES[solicitud.plan as keyof typeof PLANES]?.nombre}?`)) return;
    
    try {
      await pagoService.aprobarSolicitud(solicitud.id, solicitud.empresa_id, solicitud.plan, solicitud.ciclo || 'mensual');
      toast.success("Pago aprobado y plan activado");
      loadSolicitudes();
      loadEmpresas();
    } catch (error) {
      toast.error("Error al aprobar el pago");
    }
  };

  const handleRechazarPago = async (solicitud: any) => {
    const motivo = prompt("Motivo del rechazo:");
    if (!motivo) return;
    
    try {
      await pagoService.rechazarSolicitud(solicitud.id, motivo);
      toast.success("Pago rechazado");
      loadSolicitudes();
    } catch (error) {
      toast.error("Error al rechazar el pago");
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!confirm("¿Eliminar esta herramienta?")) return;
    const { error } = await supabase.from("herramientas").delete().eq("id", id);
    if (!error) {
      toast.success("Eliminada");
      loadTools();
    }
  };

  const updateLeadStatus = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase.from("leads_marketplace").update({ estado: nuevoEstado }).eq("id", id);
    if (!error) {
      toast.success("Estado actualizado");
      loadLeads();
    }
  };

  const handleDeleteEmpresa = async (id: string, nombre: string) => {
    if (!isAdmin) return;
    if (!confirm(`¿Estás SEGURO de eliminar por completo la empresa "${nombre}" y todos sus datos? Esta acción crítica no se puede deshacer.`)) return;
    
    try {
      const { error } = await supabase.from('empresas').delete().eq('id', id);
      if (error) throw error;
      toast.success('Empresa eliminada correctamente');
      loadEmpresas();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al eliminar la empresa. Asegúrate de eliminar primero todas las referencias (usuarios, diagnósticos) o configurar el borrado en cascada en la base de datos.");
    }
  };

  return {
    empresas,
    tools,
    leads,
    solicitudes,
    loading,
    setLeads,
    loadEmpresas,
    loadTools,
    loadLeads,
    loadSolicitudes,
    handleAprobarPago,
    handleRechazarPago,
    handleDeleteTool,
    updateLeadStatus,
    handleDeleteEmpresa
  };
}
