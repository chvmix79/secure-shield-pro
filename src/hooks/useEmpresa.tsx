import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { empresaService, diagnosticoService, accionService, evidenciaService, alertaService } from '@/lib/services';
import type { Empresa, Diagnostico, Accion, Evidencia, Alerta } from '@/lib/database.types';
import { esAdminGlobal } from '@/lib/admin-utils';
import { supabase } from '@/lib/supabase';

interface EmpresaContextType {
  empresa: Empresa | null;
  diagnostico: Diagnostico | null;
  acciones: Accion[];
  evidencias: Evidencia[];
  alertas: Alerta[];
  loading: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  createEvidencia: (data: Omit<Evidencia, 'id' | 'created_at'>) => Promise<void>;
  markAlertaRead: (id: string) => Promise<void>;
  markAllAlertasRead: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

const EMPRESA_DEMO_ID = '00000000-0000-0000-0000-000000000001';

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      
      const empresaId = localStorage.getItem("empresa_id");
      const { data: authData } = await supabase.auth.getSession();
      const userEmail = authData?.session?.user?.email?.toLowerCase() || localStorage.getItem("user_email")?.toLowerCase() || "";
      
      // Administrador global basado en esAdminGlobal (central) o roles app_metadata
      const isGlobalAdmin = esAdminGlobal(userEmail);
      const sessionIsAdmin = authData?.session?.user?.app_metadata?.isAdmin === true;
      const isActuallyAdmin = isGlobalAdmin || sessionIsAdmin;
      
      setIsAdmin(isActuallyAdmin);

      // Caso: Admin sin empresa seleccionada
      if (isActuallyAdmin && !empresaId) {
        setEmpresa(null);
        setDiagnostico(null);
        setAcciones([]);
        setEvidencias([]);
        setAlertas([]);
        setLoading(false);
        return;
      }

      // Caso: No admin y sin empresaID
      if (!empresaId) {
        setEmpresa(null);
        setDiagnostico(null);
        setAcciones([]);
        setEvidencias([]);
        setAlertas([]);
        setLoading(false);
        return;
      }

      let emp = await empresaService.getById(empresaId).catch(() => null);
      
      // Fallback robusto: si falla carga directa (por ej. por latencia o RLS) y es admin, cargamos desde la vista
      if (!emp && isActuallyAdmin) {
        const { data: v_emp } = await supabase.from('v_empresas_stats').select('*').eq('id', empresaId).single();
        if (v_emp) {
          emp = {
            id: v_emp.id,
            nombre: v_emp.nombre,
            email: v_emp.email,
            sector: v_emp.sector,
            plan: v_emp.plan || 'free',
            user_id: 'admin-view',
            cuenta_bloqueada: false,
            created_at: v_emp.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any;
        }
      }
      
      if (!emp) {
        localStorage.removeItem("empresa_id");
        setEmpresa(null);
        setDiagnostico(null);
        setAcciones([]);
        setEvidencias([]);
        setAlertas([]);
        setLoading(false);
        return;
      }
      
      setEmpresa(emp);
      
      // Carga paralela de datos de la empresa
      const [diags, accs, alts] = await Promise.all([
        diagnosticoService.getByEmpresa(emp.id).catch(() => []),
        accionService.getByEmpresa(emp.id).catch(() => []),
        alertaService.getByEmpresa(emp.id).catch(() => [])
      ]);

      if (diags && diags.length > 0) {
        setDiagnostico(diags[0]);
      } else {
        setDiagnostico(null);
      }
      
      setAcciones(accs || []);
      setAlertas(alts || []);

      // Carga de evidencias
      if (accs && accs.length > 0) {
        const evids: Evidencia[] = [];
        const targetAccs = accs.slice(0, 20); 
        for (const acc of targetAccs) {
          const e = await evidenciaService.getByAccion(acc.id).catch(() => []);
          if (e) evids.push(...e);
        }
        setEvidencias(evids);
      } else {
        setEvidencias([]);
      }

    } catch (error) {
      console.error('CRITICAL: Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvidencia = async (data: Omit<Evidencia, 'id' | 'created_at'>) => {
    await evidenciaService.create(data);
    await refresh();
  };

  const markAlertaRead = async (id: string) => {
    await alertaService.markAsRead(id);
    await refresh();
  };

  const markAllAlertasRead = async () => {
    if (!empresa?.id) return;
    await alertaService.markAllAsRead(empresa.id);
    await refresh();
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <EmpresaContext.Provider value={{ empresa, diagnostico, acciones, evidencias, alertas, loading, isAdmin, refresh, createEvidencia, markAlertaRead, markAllAlertasRead }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa must be used within EmpresaProvider');
  }
  return context;
}
