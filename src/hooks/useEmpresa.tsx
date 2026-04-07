import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { empresaService, diagnosticoService, accionService, evidenciaService, alertaService } from '@/lib/services';
import type { Empresa, Diagnostico, Accion, Evidencia, Alerta } from '@/lib/database.types';

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
      const isGlobalAdmin = localStorage.getItem("is_admin") === "true";
      
      if (!empresaId && !isGlobalAdmin) {
        setEmpresa(null);
        setDiagnostico(null);
        setAcciones([]);
        setEvidencias([]);
        setAlertas([]);
        setLoading(false);
        return;
      }
      
      if (isGlobalAdmin && !empresaId) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }
      
      const emp = await empresaService.getById(empresaId);
      
      if (!emp) {
        localStorage.removeItem("empresa_id");
        setEmpresa(null);
        setLoading(false);
        return;
      }
      
      setEmpresa(emp);
      
      const diagnosticos = await diagnosticoService.getByEmpresa(emp.id);
      if (diagnosticos && diagnosticos.length > 0) {
        setDiagnostico(diagnosticos[0]);
      } else {
        setDiagnostico(null);
      }
      
      const accs = await accionService.getByEmpresa(emp.id);
      setAcciones(accs || []);
      
      const evids: Evidencia[] = [];
      for (const acc of accs || []) {
        const e = await evidenciaService.getByAccion(acc.id);
        if (e) evids.push(...e);
      }
      setEvidencias(evids);
      
      const alts = await alertaService.getByEmpresa(emp.id);
      setAlertas(alts || []);
      
      // Verificar admin global usando variable de entorno (nunca hardcodeada)
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase() || '';
      if (isGlobalAdmin) {
        setIsAdmin(true);
        localStorage.setItem("is_admin", "true");
      } else if (adminEmail && emp && emp.email.toLowerCase() === adminEmail) {
        setIsAdmin(true);
        localStorage.setItem("is_admin", "true");
      } else {
        // Sin detección por patrón de email — solo el admin definido en env tiene acceso
        setIsAdmin(false);
        localStorage.setItem("is_admin", "false");
      }
    } catch (error) {
      console.error('Error loading empresa data:', error);
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
