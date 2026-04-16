import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PLANES } from '@/lib/suscripcion';
import type { PlanType } from '@/lib/database.types';

interface EmpresaInfo {
  nombre: string;
  email: string;
  plan: PlanType;
  fecha_fin: string | null;
}

export default function CuentaBloqueada() {
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      const empresaId = localStorage.getItem('empresa_id');
      if (!empresaId) return;

      const { data } = await supabase
        .from('empresas')
        .select('nombre, email, plan, fecha_fin')
        .eq('id', empresaId)
        .single();

      if (data) setEmpresa(data as EmpresaInfo);
    }
    cargarDatos();
  }, []);

  const fechaVencimiento = empresa?.fecha_fin
    ? new Date(empresa.fecha_fin).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const fechaBloqueo = empresa?.fecha_fin
    ? new Date(new Date(empresa.fecha_fin).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(
        'es-CO',
        { day: '2-digit', month: 'long', year: 'numeric' }
      )
    : null;

  const diasDesdeVencimiento = empresa?.fecha_fin
    ? Math.floor((Date.now() - new Date(empresa.fecha_fin).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const planNombre = empresa?.plan
    ? PLANES[empresa.plan]?.nombre || empresa.plan
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card principal */}
        <div className="bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl p-8 text-center space-y-6">

          {/* Icono */}
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/40">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🔒 Cuenta Bloqueada</h1>
            <p className="text-red-300 text-sm">
              Tu suscripción ha vencido y el período de gracia expiró.
            </p>
          </div>

          {/* Información de la empresa */}
          {empresa && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Empresa</span>
                <span className="text-white font-semibold text-sm">{empresa.nombre}</span>
              </div>
              {planNombre && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Plan</span>
                  <span className="text-yellow-400 font-bold text-sm">{planNombre}</span>
                </div>
              )}
              {fechaVencimiento && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Vencimiento</span>
                  <span className="text-red-400 font-semibold text-sm">{fechaVencimiento}</span>
                </div>
              )}
              {fechaBloqueo && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Bloqueo desde</span>
                  <span className="text-red-400 font-semibold text-sm">{fechaBloqueo}</span>
                </div>
              )}
              {diasDesdeVencimiento > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Días sin acceso</span>
                  <span className="text-white font-black text-sm bg-red-600 px-2 py-0.5 rounded-full">
                    {diasDesdeVencimiento - 2} {(diasDesdeVencimiento - 2) === 1 ? 'día' : 'días'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Información */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-left">
            <p className="text-blue-300 text-sm font-medium mb-1">ℹ️ ¿Cómo desbloquear?</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Contacta al equipo de CHV Ciberdefensa para renovar tu plan.
              Una vez el administrador active tu suscripción, el acceso se restaurará
              <strong className="text-white"> de forma automática e inmediata</strong>.
            </p>
          </div>

          {/* Acciones */}
          <div className="space-y-3 pt-2">
            <a
              href="mailto:chv.79@hotmail.com?subject=Solicitud de renovación de cuenta"
              className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold transition-all duration-200 hover:shadow-lg hover:shadow-red-600/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contactar Soporte
            </a>
            <a
              href="https://wa.me/573008820783?text=Hola,%20necesito%20renovar%20mi%20suscripción%20CHV%20Ciberdefensa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-bold transition-all duration-200 hover:shadow-lg hover:shadow-green-600/30"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp: +57 300 882 0783
            </a>
            <a
              href="/planes"
              className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-semibold transition-colors border border-white/10"
            >
              Ver Planes de Renovación
            </a>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          CHV Ciberdefensa • chv.79@hotmail.com
        </p>
      </div>
    </div>
  );
}
