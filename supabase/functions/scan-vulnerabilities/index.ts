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
    const { empresa_id } = await req.json()
    if (!empresa_id) throw new Error('empresa_id is required')

    // 1. Get company products
    const { data: productos, error: pError } = await supabaseServer
      .from('productos_empresa')
      .select('*')
      .eq('empresa_id', empresa_id)

    if (pError) throw pError
    if (!productos || productos.length === 0) {
      return new Response(JSON.stringify({ nuevas_vulnerabilidades: 0, message: 'No products in inventory' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let totalNuevas = 0
    const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0'
    
    // 2. Fetch CVEs for each product
    for (const producto of productos) {
      const keyword = `${producto.nombre} ${producto.version || ''}`.trim()
      const url = `${NVD_API_BASE}?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=10`
      
      try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } })
        if (!response.ok) continue

        const data = await response.json()
        if (!data.vulnerabilities) continue

        for (const vuln of data.vulnerabilities) {
          const cve = vuln.cve;
          const metrics = cve.metrics?.cvssMetricV31?.[0]?.cvssData || 
                         cve.metrics?.cvssMetricV30?.[0]?.cvssData ||
                         cve.metrics?.cvssMetricV2?.[0]?.cvssData;

          const severity = metrics?.baseSeverity?.toLowerCase() || 'unknown'
          const cvss = metrics?.baseScore || 0
          const description = cve.descriptions?.[0]?.value || 'Sin descripción'

          // 3. Check if already recorded
          const { data: existing } = await supabaseServer
            .from('vulnerabilidades')
            .select('id')
            .eq('empresa_id', empresa_id)
            .eq('cve_id', cve.id)
            .limit(1)

          if (!existing || existing.length === 0) {
            // 4. Insert new vulnerability
            const { error: iError } = await supabaseServer.from('vulnerabilidades').insert({
              empresa_id,
              producto_id: producto.id,
              cve_id: cve.id,
              descripcion: description,
              severity: severity,
              cvss: cvss,
              afectada: true,
              parchada: false
            })

            if (!iError) {
              totalNuevas++
              
              // 5. Create alert for High/Critical
              if (severity === 'high' || severity === 'critical') {
                await supabaseServer.from('alertas').insert({
                  empresa_id,
                  titulo: `ALERTA: Vulnerabilidad ${severity.toUpperCase()} detectada`,
                  descripcion: `Se detectó ${cve.id} afectando a ${producto.nombre}. ${description.substring(0, 100)}...`,
                  tipo: severity === 'critical' ? 'error' : 'warning',
                  tipo_alerta: 'cve',
                  prioridad: severity === 'critical' ? 'critica' : 'alta',
                  link_externo: `https://nvd.nist.gov/vuln/detail/${cve.id}`
                })
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error scanning ${keyword}:`, err)
      }
    }

    return new Response(JSON.stringify({ nuevas_vulnerabilidades: totalNuevas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
