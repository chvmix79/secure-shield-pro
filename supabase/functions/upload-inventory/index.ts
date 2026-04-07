import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseServer = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { empresa_id, software } = await req.json()
    if (!empresa_id) throw new Error('empresa_id is required')
    if (!software || !Array.isArray(software)) throw new Error('software array is required')

    // Filter valid software entries
    const validSoftware = software
      .filter((s: any) => s.nombre && s.nombre.length > 2)
      .map((s: any) => ({
        empresa_id,
        nombre: String(s.nombre).substring(0, 255),
        version: s.version ? String(s.version).substring(0, 50) : 'Desconocida',
        proveedor: s.proveedor ? String(s.proveedor).substring(0, 100) : 'Desconocido',
        tipo: 'software'
      }));

    if (validSoftware.length === 0) {
      return new Response(JSON.stringify({ success: true, inserted: 0, message: 'No valid software found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Since we don't want duplicates, we can either clear old inventory or use upsert.
    // For simplicity, we just delete existing ones and re-insert to keep it fresh.
    await supabaseServer
      .from('productos_empresa')
      .delete()
      .eq('empresa_id', empresa_id);

    const { data, error } = await supabaseServer
      .from('productos_empresa')
      .insert(validSoftware)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, inserted: validSoftware.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
