import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  diagnosticoService, 
  scoreHistoryService, 
  vulnerabilidadService, 
  documentoService, 
  microsoft365Service, 
  phishingService 
} from "@/lib/services";
import { suscripcionService, EstadoSuscripcion } from "@/lib/suscripcion";
import { DocumentoCumplimiento, Vulnerabilidad, ScoreHistory } from "@/lib/database.types";

export interface DocumentStats {
  total: number;
  actualizados: number;
  pendiente: number;
  faltantes: number;
}

export interface TrainingStats {
  total: number;
  completados: number;
}

export function useDashboardData(empresaId: string | undefined) {
  const [diagnosticos, setDiagnosticos] = useState<{ score: number }[]>([]);
  const [docStats, setDocStats] = useState<DocumentStats>({ total: 15, actualizados: 3, pendiente: 5, faltantes: 7 });
  const [trainingStats, setTrainingStats] = useState<TrainingStats>({ total: 6, completados: 0 });
  const [vulnerabilidades, setVulnerabilidades] = useState<Vulnerabilidad[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [m365Audit, setM365Audit] = useState<any>(null);
  const [phishingStats, setPhishingStats] = useState<any[]>([]);
  const [plan, setPlan] = useState<string>('free');
  const [estadoSuscripcion, setEstadoSuscripcion] = useState<EstadoSuscripcion | null>(null);

  useEffect(() => {
    async function loadDiagnosticos() {
      if (!empresaId) return;
      const data = await diagnosticoService.getByEmpresa(empresaId);
      setDiagnosticos(data || []);
      
      const e = await suscripcionService.getEstadoSuscripcion(empresaId);
      setEstadoSuscripcion(e);
      setPlan(e.plan);
    }
    loadDiagnosticos();
  }, [empresaId]);

  useEffect(() => {
    async function loadDynamicStats() {
      if (!empresaId) return;
      
      try {
        const [docsResult, docs, history, vulns, m365, phishing] = await Promise.all([
          supabase.from('progreso_capacitacion').select('modulo_id, completado, usuarios!inner(empresa_id)').eq('usuarios.empresa_id', empresaId).catch(() => ({ data: [] })),
          documentoService.getByEmpresa(empresaId).catch(() => []),
          scoreHistoryService.getByEmpresa(empresaId).catch(() => []),
          vulnerabilidadService.getByEmpresa(empresaId).catch(() => []),
          microsoft365Service.getAuditStatus(empresaId).catch(() => null),
          phishingService.getCampañas(empresaId).catch(() => [])
        ]);
        
        if (docsResult.data) {
          setTrainingStats({
            total: 6,
            completados: docsResult.data.filter((d: { completado: boolean }) => d.completado).length
          });
        }
        
        if (docs) {
          setDocStats({
            total: docs.length || 15,
            actualizados: docs.filter(d => d.estado === 'actualizado').length,
            pendiente: docs.filter(d => d.estado === 'pendiente').length,
            faltantes: docs.filter(d => d.estado === 'faltante' || d.estado === 'obsoleto').length
          });
        }

        setScoreHistory(history || []);
        setVulnerabilidades(vulns || []);
        setM365Audit(m365);
        setPhishingStats(phishing || []);
      } catch (error) {
        console.error("Error loading dynamic stats:", error);
      }
    }
    loadDynamicStats();
  }, [empresaId]);

  return {
    diagnosticos,
    docStats,
    trainingStats,
    vulnerabilidades,
    scoreHistory,
    m365Audit,
    phishingStats,
    plan,
    estadoSuscripcion
  };
}
