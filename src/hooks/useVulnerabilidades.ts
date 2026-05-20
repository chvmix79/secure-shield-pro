import { useState, useEffect, useCallback } from "react";
import { supabase, supabaseAnonKey } from "@/lib/supabase";
import { useEmpresa } from "@/hooks/useEmpresa";
import { toast } from "sonner";

export interface Vulnerability {
  id: string;
  empresa_id: string;
  producto_id: string | null;
  cve_id: string | null;
  descripcion: string | null;
  severity: string | null;
  cvss: number | null;
  afectada: boolean;
  parchada: boolean;
  created_at: string;
  nueva?: boolean;
  fuente?: string;
  producto?: {
    nombre: string;
  } | null;
}

export interface Producto {
  id: string;
  nombre: string;
  version: string;
  proveedor: string;
  tipo: string;
}

export function useVulnerabilidades() {
  const { empresa } = useEmpresa();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [vulnerabilidades, setVulnerabilidades] = useState<Vulnerability[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [checkThreatsLoading, setCheckThreatsLoading] = useState(false);
  
  // States for new product
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    nombre: "", 
    version: "", 
    proveedor: "", 
    tipo: "software" 
  });

  const loadData = useCallback(async () => {
    if (!empresa?.id) return;
    setLoading(true);
    try {
      // Load Vulnerabilities
      const { data: vData } = await supabase
        .from('vulnerabilidades')
        .select(`
          *,
          producto:productos_empresa(nombre)
        `)
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false });
      
      if (vData) {
        setVulnerabilidades(vData as unknown as Vulnerability[]);
      }

      // Load Products
      const { data: pData } = await supabase
        .from('productos_empresa')
        .select('*')
        .eq('empresa_id', empresa.id);
      
      if (pData) {
        setProductos(pData as Producto[]);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }, [empresa?.id]);

  useEffect(() => {
    if (empresa?.id) {
      loadData();
    }
  }, [empresa?.id, loadData]);

  const handleAddProduct = async () => {
    if (!empresa?.id || !newProduct.nombre) return;
    
    try {
      const { error } = await supabase.from('productos_empresa').insert({
        empresa_id: empresa.id,
        ...newProduct
      });

      if (error) throw error;
      
      toast.success("Producto añadido al inventario");
      setIsAddProductOpen(false);
      setNewProduct({ nombre: "", version: "", proveedor: "", tipo: "software" });
      loadData();
    } catch (error) {
      toast.error("Error al añadir producto");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('productos_empresa').delete().eq('id', id);
      if (error) throw error;
      toast.success("Producto eliminado");
      loadData();
    } catch (error) {
      toast.error("Error al eliminar producto");
    }
  };

  const runVulnerabilityScan = async () => {
    if (!empresa?.id) return;
    if (productos.length === 0) {
      toast.error("Agrega productos a tu inventario primero");
      return;
    }

    setCheckThreatsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scan-vulnerabilities', {
        body: { empresa_id: empresa.id }
      });

      if (error) throw error;
      
      const nuevasVulns = data?.nuevas_vulnerabilidades ?? 0;
      toast.success(`Escaneo completado: ${nuevasVulns} nuevas vulnerabilidades encontradas`);
      loadData();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Scan error:', error);
      toast.error("Error durante el escaneo de vulnerabilidades");
    }
    setCheckThreatsLoading(false);
  };

  const downloadScanner = () => {
    toast.info("Generando script de escaneo seguro...", { duration: 3000 });

    if (!empresa?.id) {
      toast.error('No se ha detectado la empresa activa. Por favor selecciona una empresa en el Dashboard.');
      return;
    }
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/upload-inventory`;
    
    const ps1Script = `# Evidence Shield Sys - Escaner de Inventario de Software
$empresa_id = "${empresa.id}"
$endpoint = "${edgeFunctionUrl}"
$anon_key = "${supabaseAnonKey}"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   Evidence Shield Sys - Escaner de Software" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Iniciando escaneo de este equipo..." -ForegroundColor White
Write-Host "Empresa ID: $empresa_id" -ForegroundColor Gray

try {
    $paths = @(
        "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*",
        "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*"
    )

    $installedSoftware = Get-ItemProperty $paths -ErrorAction SilentlyContinue | 
        Where-Object { $_.DisplayName -ne $null -and $_.DisplayName -notmatch "Security Update|Update for Windows" } |
        Select-Object @{Name="nombre";Expression={$_.DisplayName}}, 
                      @{Name="version";Expression={$_.DisplayVersion}}, 
                      @{Name="proveedor";Expression={$_.Publisher}}

    $uniqueSoftware = $installedSoftware | Sort-Object nombre -Unique | ForEach-Object {
        [PSCustomObject]@{
            nombre = [string]$_.nombre
            version = if ($_.version) { [string]$_.version } else { "N/A" }
            proveedor = if ($_.proveedor) { [string]$_.proveedor } else { "Desconocido" }
        }
    }

    Write-Host "Se encontraron $($uniqueSoftware.Count) programas instalados." -ForegroundColor Yellow
    Write-Host "Enviando datos de forma segura..." -ForegroundColor Cyan

    $headers = @{
        "apikey" = $anon_key
        "Authorization" = "Bearer $anon_key"
        "Content-Type" = "application/json"
    }

    $payload = @{
        empresa_id = $empresa_id
        software = @($uniqueSoftware)
    } | ConvertTo-Json -Depth 5 -Compress

    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Body ([System.Text.Encoding]::UTF8.GetBytes($payload)) -Headers $headers
    
    Write-Host ""
    Write-Host "✅ ¡INVENTARIO ACTUALIZADO CON EXITO!" -ForegroundColor Green
    Write-Host "Ya puedes cerrar esta ventana y recargar tu panel web." -ForegroundColor White
} catch {
    Write-Host ""
    Write-Host "❌ ERROR AL ENVIAR LOS DATOS" -ForegroundColor Red
    Write-Host "Mensaje: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Codigo HTTP: $([int]$_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
`;

    try {
      const blob = new Blob([ps1Script], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'Escaner_EvidenceShield.ps1';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("¡Script listo! Ejecútalo con clic derecho -> 'Ejecutar con PowerShell'", { duration: 8000 });
    } catch (err) {
      console.error("Download error:", err);
      window.alert("Error al generar la descarga: " + err);
    }
  };

  const markAsParched = async (id: string) => {
    try {
      await supabase
        .from('vulnerabilidades')
        .update({ parchada: true, nueva: false })
        .eq('id', id);
      loadData();
      toast.success("Vulnerabilidad marcada como corregida");
    } catch (error) {
      toast.error("Error al actualizar la vulnerabilidad");
    }
  };

  const handleRefresh = () => {
    loadData();
    setLastUpdate(new Date());
    toast.success("Datos actualizados");
  };

  const filteredVulnerabilidades = vulnerabilidades.filter((vuln) => {
    const matchesSearch = 
      (vuln.cve_id?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (vuln.descripcion?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesSeverity = !severityFilter || vuln.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const stats = {
    productos: productos.length,
    vulnerabilidades: vulnerabilidades.length,
    critical: vulnerabilidades.filter(v => v.severity === 'critical').length,
    high: vulnerabilidades.filter(v => v.severity === 'high').length,
    medium: vulnerabilidades.filter(v => v.severity === 'medium').length,
    low: vulnerabilidades.filter(v => v.severity === 'low').length,
  };

  return {
    empresa,
    search,
    setSearch,
    severityFilter,
    setSeverityFilter,
    loading,
    vulnerabilidades,
    productos,
    lastUpdate,
    checkThreatsLoading,
    isAddProductOpen,
    setIsAddProductOpen,
    newProduct,
    setNewProduct,
    handleAddProduct,
    handleDeleteProduct,
    runVulnerabilityScan,
    downloadScanner,
    markAsParched,
    handleRefresh,
    filteredVulnerabilidades,
    stats,
  };
}
