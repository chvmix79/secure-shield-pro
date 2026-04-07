import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CuentaBloqueada() {
  const [empresa, setEmpresa] = useState<{ nombre: string; email: string; plan: string } | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('empresas')
          .select('nombre, email, plan')
          .eq('id', user.id)
          .single();
        if (data) setEmpresa(data);
      }
    }
    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cuenta Bloqueada</h1>
        <p className="text-gray-600 mb-6">
          Tu suscripción ha vencido y tu cuenta ha sido bloqueada temporalmente.
        </p>

        {empresa && (
          <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600">Empresa: <strong>{empresa.nombre}</strong></p>
            <p className="text-sm text-gray-600">Plan anterior: <strong>{empresa.plan}</strong></p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Para desbloquear tu cuenta, por favor contacta al equipo de soporte:
          </p>
          <a
            href="mailto:soporte@chvciberdefensa.com?subject=Desbloqueo de cuenta"
            className="block w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Contactar Soporte
          </a>
          <a
            href="/planes"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Ver Planes de Renovación
          </a>
        </div>
      </div>
    </div>
  );
}
