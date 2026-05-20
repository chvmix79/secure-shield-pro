import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "No token provided" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar la empresa asociada al token
    const { data: integracion, error: dbError } = await supabase
      .from("integraciones_webhook")
      .select("empresa_id, proveedor, activo")
      .eq("secret_token", token)
      .single();

    if (dbError || !integracion || !integracion.activo) {
      return new Response(JSON.stringify({ error: "Invalid or inactive token" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Leer el payload (puede ser de CrowdStrike, Wazuh, etc.)
    const payload = await req.json().catch(() => ({}));

    // Determinar título y descripción según el payload
    const titulo = payload.title || `Alerta de seguridad automática (${integracion.proveedor})`;
    const descripcion = payload.description || `Evento detectado: ${JSON.stringify(payload).substring(0, 500)}`;
    const severidadPayload = payload.severity?.toLowerCase() || 'high';
    const prioridad = severidadPayload.includes('crit') ? 'crítica' : 'alta';

    // Insertar la alerta en la tabla alertas
    const { error: insertError } = await supabase.from("alertas").insert({
      empresa_id: integracion.empresa_id,
      titulo,
      descripcion,
      tipo: "seguridad",
      leida: false,
    });

    if (insertError) {
      console.error("Error insertando alerta:", insertError);
      return new Response(JSON.stringify({ error: "Error saving alert" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Webhook processed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
