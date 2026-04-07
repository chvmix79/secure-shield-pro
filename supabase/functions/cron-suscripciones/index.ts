const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Empresa {
  id: string;
  nombre: string;
  email: string;
  plan: string;
  fecha_fin: string | null;
  subscription_status: string;
  cuenta_bloqueada: boolean;
}

const PLANES_PRECIOS: Record<string, number> = {
  basic: 150000,
  pro: 350000,
};

const PLANES_NOMBRES: Record<string, string> = {
  basic: 'Básico',
  pro: 'Profesional',
};

async function enviarEmail(destinatario: string, asunto: string, html: string, supabaseUrl: string, supabaseKey: string) {
  console.log(`Enviando email a ${destinatario}: ${asunto}`);
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/enviar_correo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        destinatario,
        asunto,
        html,
      }),
    });

    if (!response.ok) {
      console.log('RPC enviar_correo no disponible, guardando notificación en BD');
      return false;
    }
    return true;
  } catch (error) {
    console.log('Error enviando email, guardando notificación:', error);
    return false;
  }
}

async function registrarNotificacion(supabaseUrl: string, supabaseKey: string, empresaId: string, tipo: string) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/notificaciones_suscripcion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        empresa_id: empresaId,
        tipo,
      }),
    });
  } catch (error) {
    console.error('Error registrando notificación:', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  try {
    const ahora = new Date();
    const cincoDias = new Date();
    cincoDias.setDate(cincoDias.getDate() + 5);
    
    const dosDiasAtras = new Date();
    dosDiasAtras.setDate(dosDiasAtras.getDate() - 2);

    const empresasResponse = await fetch(
      `${supabaseUrl}/rest/v1/empresas?select=id,nombre,email,plan,fecha_fin,subscription_status,cuenta_bloqueada&subscription_status=eq.active&cuenta_bloqueada=eq.false`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const empresas: Empresa[] = await empresasResponse.json();
    console.log(`Procesando ${empresas.length} empresas con suscripción activa`);

    let notificacionesEnviadas = 0;
    let cuentasBloqueadas = 0;

    for (const empresa of empresas) {
      if (!empresa.fecha_fin) continue;

      const fechaFin = new Date(empresa.fecha_fin);
      const diasRestantes = Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));

      // 1. BLOQUEO DEFINITIVO (Después de 2 días de gracia)
      if (diasRestantes <= -2) {
        console.log(`Empresa ${empresa.nombre} vencido hace ${Math.abs(diasRestantes)} días (fuera de gracia), bloqueando...`);
        
        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/empresas?id=eq.${empresa.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              cuenta_bloqueada: true,
              fecha_bloqueo: ahora.toISOString(),
              subscription_status: 'expired',
            }),
          }
        );

        if (updateResponse.ok) {
          cuentasBloqueadas++;
          await registrarNotificacion(supabaseUrl, supabaseKey, empresa.id, 'suscripcion_bloqueada');
          
          const htmlBloqueado = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #dc2626; text-align: center;">⚠️ Cuenta Bloqueada</h2>
              <p>Hola <strong>${empresa.nombre}</strong>,</p>
              <p>Tu suscripción ha sido <strong>bloqueada</strong> debido a que el periodo de gracia de 2 días ha finalizado sin recibir la renovación.</p>
              <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 0; color: #991b1b;"><strong>Acceso Restringido:</strong> No podrás acceder a los módulos premium hasta que se confirme el pago.</p>
              </div>
              <p>Para recuperar el acceso, por favor realiza el pago en el panel de suscripciones.</p>
              <p style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 0.8em; color: #6b7280;">Equipo Evidence Shield Sys</p>
            </div>
          `;
          
          await enviarEmail(empresa.email, '⚠️ ACCESO BLOQUEADO - Renovación Pendiente', htmlBloqueado, supabaseUrl, supabaseKey);
        }
      }
      // 2. PERIODICO DE GRACIA (El día que vence o 1 día después)
      else if (diasRestantes <= 0) {
        console.log(`Empresa ${empresa.nombre} vencido, en periodo de gracia. Días: ${diasRestantes}`);
        
        const htmlGracia = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #f59e0b; text-align: center;">⏳ Periodo de Gracia - Suscripción Vencida</h2>
            <p>Hola <strong>${empresa.nombre}</strong>,</p>
            <p>Tu suscripción venció el <strong>${fechaFin.toLocaleDateString('es-CO')}</strong>. Te hemos otorgado <strong>2 días de gracia</strong> para que realices tu pago sin perder el acceso.</p>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;"><strong>Atención:</strong> Tu acceso será bloqueado automáticamente en 48 horas si no se registra el pago.</p>
            </div>
            <p>Evita interrupciones en tu plan de ciberseguridad realizando el pago hoy mismo.</p>
            <p style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 0.8em; color: #6b7280;">Equipo Evidence Shield Sys</p>
          </div>
        `;
        
        await registrarNotificacion(supabaseUrl, supabaseKey, empresa.id, 'periodo_gracia');
        await enviarEmail(empresa.email, '⏳ Suscripción Vencida - Cuentas con 2 días de gracia', htmlGracia, supabaseUrl, supabaseKey);
        notificacionesEnviadas++;
      }
      // 3. RECORDATORIO INMINENTE (2 días antes)
      else if (diasRestantes <= 2) {
        console.log(`Empresa ${empresa.nombre} vence en ${diasRestantes} días (inminente)`);
        
        const precio = PLANES_PRECIOS[empresa.plan] || 0;
        const nombrePlan = PLANES_NOMBRES[empresa.plan] || empresa.plan;
        
        const htmlInminente = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #dc2626; text-align: center;">⏰ Tu suscripción vence en ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}</h2>
            <p>Hola <strong>${empresa.nombre}</strong>,</p>
            <p>Te recordamos que tu suscripción <strong>${nombrePlan}</strong> vence muy pronto.</p>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Monto a pagar:</strong> $${precio.toLocaleString('es-CO')} COP</p>
              <p style="margin: 5px 0 0 0;"><strong>Fecha límite:</strong> ${fechaFin.toLocaleDateString('es-CO')}</p>
            </div>
            <p>Realiza tu pago ahora para asegurar la continuidad de tu protección.</p>
            <p style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 0.8em; color: #6b7280;">Equipo Evidence Shield Sys</p>
          </div>
        `;
        
        await registrarNotificacion(supabaseUrl, supabaseKey, empresa.id, 'vencimiento_inminente');
        await enviarEmail(empresa.email, `⏰ ¡Últimos días! Tu suscripción vence en ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}`, htmlInminente, supabaseUrl, supabaseKey);
        notificacionesEnviadas++;
      }
      // 4. RECORDATORIO INICIAL (5 días antes)
      else if (diasRestantes <= 5) {
        console.log(`Empresa ${empresa.nombre} vence en ${diasRestantes} días (recordatorio)`);
        
        const precio = PLANES_PRECIOS[empresa.plan] || 0;
        const nombrePlan = PLANES_NOMBRES[empresa.plan] || empresa.plan;
        
        const htmlRecordatorio = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #2563eb; text-align: center;">🔔 Recordatorio de Renovación</h2>
            <p>Hola <strong>${empresa.nombre}</strong>,</p>
            <p>Te informamos que tu suscripción <strong>${nombrePlan}</strong> vencerá en <strong>${diasRestantes} días</strong>.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Próximo vencimiento:</strong> ${fechaFin.toLocaleDateString('es-CO')}</p>
              <p style="margin: 5px 0 0 0;"><strong>Valor renovación:</strong> $${precio.toLocaleString('es-CO')} COP</p>
            </div>
            <p>Te invitamos a realizar el proceso de pago con tiempo para evitar contratiempos.</p>
            <p style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 0.8em; color: #6b7280;">Equipo Evidence Shield Sys</p>
          </div>
        `;
        
        await registrarNotificacion(supabaseUrl, supabaseKey, empresa.id, 'recordatorio_renovacion');
        await enviarEmail(empresa.email, `🔔 Recordatorio: Tu suscripción vence en ${diasRestantes} días`, htmlRecordatorio, supabaseUrl, supabaseKey);
        notificacionesEnviadas++;
      }
    }

    const response = {
      success: true,
      message: `Procesado: ${empresas.length} empresas | Notificaciones enviadas: ${notificacionesEnviadas} | Cuentas bloqueadas: ${cuentasBloqueadas}`,
      timestamp: ahora.toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error en cron-suscripciones:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
