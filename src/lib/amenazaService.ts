import { supabase } from './supabase';

export interface CVEData {
  id: string;
  description: string;
  severity: string;
  cvss: number;
  published: string;
  affectedProducts: string[];
  references: string[];
}

export interface AlertaAutomatica {
  empresa_id: string;
  titulo: string;
  descripcion: string;
  tipo_alerta: 'cve' | 'phishing' | 'capacitacion' | 'recordatorio';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  link_externo?: string;
}

const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

export const amenazaService = {
  async fetchLatestCVEs(daysBack: number = 7): Promise<CVEData[]> {
    try {
      const pubStartDate = new Date();
      pubStartDate.setDate(pubStartDate.getDate() - daysBack);
      const pubStart = pubStartDate.toISOString().split('T')[0];
      const pubEnd = new Date().toISOString().split('T')[0];

      const url = `${NVD_API_BASE}?pubStartDate=${pubStart}&pubStartDate=${pubStart}&resultsPerPage=50`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('NVD API error:', response.status);
        return [];
      }

      const data = await response.json();
      const cves: CVEData[] = [];

      if (data.vulnerabilities) {
        for (const vuln of data.vulnerabilities) {
          const cve = vuln.cve;
          const metrics = cve.metrics?.cvssMetricV31?.[0]?.cvssData || 
                         cve.metrics?.cvssMetricV30?.[0]?.cvssData ||
                         cve.metrics?.cvssMetricV2?.[0]?.cvssData;

          cves.push({
            id: cve.id,
            description: cve.descriptions?.[0]?.value || 'Sin descripción',
            severity: metrics?.baseSeverity || 'UNKNOWN',
            cvss: metrics?.baseScore || 0,
            published: cve.published,
            affectedProducts: cve.configurations?.flatMap((c: { nodes?: { cpeMatch?: { criteria: string }[] }[] }) => 
              c.nodes?.flatMap((n) => 
                n.cpeMatch?.map((m) => m.criteria) || []
              ) || []
            ) || [],
            references: cve.references?.map((r: { url: string }) => r.url) || []
          });
        }
      }

      return cves;
    } catch (error) {
      console.error('Error fetching CVEs:', error);
      return [];
    }
  },

  async checkAndCreateAlertas(): Promise<number> {
    const cves = await this.fetchLatestCVEs(7);
    let alertasCreadas = 0;

    for (const cve of cves) {
      const cvss = cve.cvss;
      let prioridad: 'baja' | 'media' | 'alta' | 'critica' = 'baja';
      
      if (cvss >= 9) prioridad = 'critica';
      else if (cvss >= 7) prioridad = 'alta';
      else if (cvss >= 4) prioridad = 'media';

      const { data: empresas } = await supabase
        .from('empresas')
        .select('id');

      if (empresas && empresas.length > 0) {
        const descripcionCorta = cve.description.length > 200 
          ? cve.description.substring(0, 200) + '...' 
          : cve.description;

        const { data: existente } = await supabase
          .from('alertas')
          .select('id')
          .eq('titulo', `CVE: ${cve.id}`)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (!existente || existente.length === 0) {
          for (const empresa of empresas) {
            await supabase.from('alertas').insert({
              empresa_id: empresa.id,
              titulo: `CVE: ${cve.id} - Vulnerabilidad ${cve.severity}`,
              descripcion: descripcionCorta,
              tipo: prioridad === 'critica' || prioridad === 'alta' ? 'error' : 'warning',
              tipo_alerta: 'cve',
              prioridad: prioridad,
              leida: false,
              link_externo: cve.references[0] || null
            });
            alertasCreadas++;
          }
        }
      }
    }

    return alertasCreadas;
  },

  async searchCVEs(keyword: string): Promise<CVEData[]> {
    try {
      const url = `${NVD_API_BASE}?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=20`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) return [];

      const data = await response.json();
      const cves: CVEData[] = [];

      if (data.vulnerabilities) {
        for (const vuln of data.vulnerabilities) {
          const cve = vuln.cve;
          const metrics = cve.metrics?.cvssMetricV31?.[0]?.cvssData || 
                         cve.metrics?.cvssMetricV30?.[0]?.cvssData;

          cves.push({
            id: cve.id,
            description: cve.descriptions?.[0]?.value || 'Sin descripción',
            severity: metrics?.baseSeverity || 'UNKNOWN',
            cvss: metrics?.baseScore || 0,
            published: cve.published,
            affectedProducts: [],
            references: cve.references?.map((r: { url: string }) => r.url) || []
          });
        }
      }

      return cves;
    } catch (error) {
      console.error('Error searching CVEs:', error);
      return [];
    }
  },

  async getAlertasNoLeidas(empresaId: string): Promise<number> {
    const { count } = await supabase
      .from('alertas')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('leida', false);

    return count || 0;
  }
};
