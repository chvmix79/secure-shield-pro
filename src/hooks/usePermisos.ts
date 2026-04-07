import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Usuario } from '@/lib/database.types';

export type Modulo = 
  | 'diagnostico' 
  | 'riesgos' 
  | 'acciones' 
  | 'evidencias' 
  | 'alertas' 
  | 'capacitacion' 
  | 'phishing' 
  | 'vulnerabilidades' 
  | 'microsoft365' 
  | 'documentos' 
  | 'chat';

export const MODULOS_DISPONIBLES: { id: Modulo; label: string; icon: string }[] = [
  { id: 'diagnostico', label: 'Diagnóstico', icon: '📊' },
  { id: 'riesgos', label: 'Riesgos', icon: '⚠️' },
  { id: 'acciones', label: 'Acciones', icon: '✅' },
  { id: 'evidencias', label: 'Evidencias', icon: '📁' },
  { id: 'alertas', label: 'Alertas', icon: '🔔' },
  { id: 'capacitacion', label: 'Capacitación', icon: '📚' },
  { id: 'phishing', label: 'Phishing', icon: '🎣' },
  { id: 'vulnerabilidades', label: 'Vulnerabilidades', icon: '🔓' },
  { id: 'microsoft365', label: 'Microsoft 365', icon: '📧' },
  { id: 'documentos', label: 'Documentos', icon: '📄' },
  { id: 'chat', label: 'Chat IA', icon: '🤖' },
];

const TODOS_MODULOS = MODULOS_DISPONIBLES.map(m => m.id);

export function useUsuarioActual() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarUsuario() {
      const email = localStorage.getItem('user_email');
      if (!email) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (data) {
        setUsuario(data);
      }
      setLoading(false);
    }

    cargarUsuario();
  }, []);

  const tieneAcceso = (modulo: Modulo): boolean => {
    if (!usuario) return false;
    if (usuario.rol === 'admin') return true;
    return (usuario.modulos || []).includes(modulo);
  };

  const getModulosHabilitados = (): Modulo[] => {
    if (!usuario) return [];
    if (usuario.rol === 'admin') return TODOS_MODULOS;
    return (usuario.modulos || []) as Modulo[];
  };

  return { usuario, loading, tieneAcceso, getModulosHabilitados };
}