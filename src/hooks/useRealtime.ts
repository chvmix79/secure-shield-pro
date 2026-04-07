import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Alerta } from '@/lib/database.types';

interface RealtimeAlert {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string | null;
  leida: boolean;
  empresa_id: string;
  created_at: string;
}

export function useRealtimeAlerts(empresaId: string | undefined) {
  const [alerts, setAlerts] = useState<Alerta[]>([]);
  const [newAlert, setNewAlert] = useState<Alerta | null>(null);

  useEffect(() => {
    if (!empresaId) return;

    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('alertas')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) setAlerts(data);
    };

    fetchAlerts();

    const channel = supabase
      .channel('alertas-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alertas',
          filter: `empresa_id=eq.${empresaId}`,
        },
        (payload: { new: RealtimeAlert }) => {
          const newAlert = payload.new as unknown as Alerta;
          setAlerts(prev => [newAlert, ...prev]);
          setNewAlert(newAlert);
          
          setTimeout(() => setNewAlert(null), 5000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alertas',
          filter: `empresa_id=eq.${empresaId}`,
        },
        (payload: { new: RealtimeAlert }) => {
          const updatedAlert = payload.new as unknown as Alerta;
          setAlerts(prev => 
            prev.map(a => a.id === updatedAlert.id ? updatedAlert : a)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId]);

  return { alerts, newAlert };
}

export function useRealtimeAcciones(empresaId: string | undefined) {
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (!empresaId) return;

    const channel = supabase
      .channel('acciones-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'acciones',
          filter: `empresa_id=eq.${empresaId}`,
        },
        () => {
          setUpdated(true);
          setTimeout(() => setUpdated(false), 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId]);

  return updated;
}

export function useRealtimeDiagnosticos(empresaId: string | undefined) {
  const [newDiagnostic, setNewDiagnostic] = useState(false);

  useEffect(() => {
    if (!empresaId) return;

    const channel = supabase
      .channel('diagnosticos-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'diagnosticos',
          filter: `empresa_id=eq.${empresaId}`,
        },
        () => {
          setNewDiagnostic(true);
          setTimeout(() => setNewDiagnostic(false), 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresaId]);

  return newDiagnostic;
}
