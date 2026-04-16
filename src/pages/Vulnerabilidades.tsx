import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Shield, AlertTriangle, Search, ExternalLink, Calendar, Cpu, RefreshCw, CheckCircle2, XCircle, AlertOctagon, AlertCircle, Info, Database, Bell, Globe, Bug, Plus, Trash2, Package, FileDown, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase, supabaseAnonKey } from "@/lib/supabase";
import { useEmpresa } from "@/hooks/useEmpresa";
import { amenazaService, type CVEData } from "@/lib/amenazaService";
import { toast } from "sonner";

interface Vulnerability {
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
}

interface Producto {
  id: string;
  nombre: string;
  version: string;
  proveedor: string;
  tipo: string;
}

const VulnerabilityCard = ({ vuln, onMarkParched }: { vuln: any, onMarkParched: (id: string) => void }) => {
  const getSeverityColor = (severity: string | null) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-risk-high text-white";
      case "high": return "bg-risk-high/80 text-white";
      case "medium": return "bg-warning text-black";
      case "low": return "bg-success text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityIcon = (severity: string | null) => {
    switch (severity?.toLowerCase()) {
      case "critical": return <AlertOctagon size={14} />;
      case "high": return <AlertTriangle size={14} />;
      case "medium": return <AlertCircle size={14} />;
      case "low": return <Info size={14} />;
      default: return null;
    }
  };

  return (
    <Card className={cn("card-glass transition-all hover:border-primary/20", vuln.severity === "critical" && "border-l-4 border-l-risk-high")}>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getSeverityColor(vuln.severity)}>
                {getSeverityIcon(vuln.severity)}
                <span className="ml-1 uppercase tracking-tight text-[10px] font-bold">{(vuln.severity || '').toUpperCase()}</span>
              </Badge>
              <span className="font-mono font-bold text-sm tracking-tight">{vuln.cve_id}</span>
              {vuln.cvss && (
                <Badge variant="outline" className="text-[10px]">CVSS {vuln.cvss}</Badge>
              )}
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                PRODUCTO: {vuln.producto?.nombre || 'General'}
              </Badge>
              {vuln.parchada ? (
                <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20 text-[10px]">
                  <CheckCircle2 size={10} className="mr-1" /> RESOLVIDO
                </Badge>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => onMarkParched(vuln.id)} className="h-6 text-[10px] text-success hover:bg-success/10 py-0 font-bold">
                  <CheckCircle2 size={12} className="mr-1" /> Marcar como corregido
                </Button>
              )}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{vuln.descripcion}</p>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(vuln.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Globe size={12} />
                Fuente: {vuln.fuente || 'NVD NIST'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Vulnerabilidades() {
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
      
      if (vData) setVulnerabilidades(vData);

      // Load Products
      const { data: pData } = await supabase
        .from('productos_empresa')
        .select('*')
        .eq('empresa_id', empresa.id);
      
      if (pData) setProductos(pData);
      
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
    // Feedback inmediato para confirmar que la función se activa
    toast.info("Generando script de escaneo seguro...", { duration: 3000 });

    if (!empresa?.id) {
      toast.error('No se ha detectado la empresa activa. Por favor selecciona una empresa en el Dashboard.');
      return;
    }
    
    // Usamos las variables importadas directamente para evitar conflictos de redeclaración
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/upload-inventory`;
    
    // Generamos el script de PowerShell
    // Eliminamos el BOM y usamos un formato más limpio para asegurar compatibilidad
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
    await supabase
      .from('vulnerabilidades')
      .update({ parchada: true, nueva: false })
      .eq('id', id);
    loadData();
  };

  const handleRefresh = () => {
    loadData();
    setLastUpdate(new Date());
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

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="text-primary" />
              Vulnerabilidades CVE
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Escaneo dinámico basado en tu inventario de software
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={runVulnerabilityScan}
              disabled={checkThreatsLoading || loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Bug size={16} className={checkThreatsLoading ? "animate-spin mr-2" : "mr-2"} />
              {checkThreatsLoading ? 'Escaneando...' : 'Escanear ahora'}
            </Button>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={runVulnerabilityScan} 
                disabled={checkThreatsLoading || productos.length === 0}
                className="gap-2 border-risk-high/30 hover:bg-risk-high/5 text-risk-high font-bold"
            >
              {checkThreatsLoading ? <RefreshCw size={16} className="animate-spin" /> : <Shield size={16} />}
              Analizar Vulnerabilidades
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {/* Inventory Summary */}
        <Card className="card-glass border-primary/10">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Package className="text-primary" size={20} />
                  Inventario de Software
                </CardTitle>
                <CardDescription>Gestiona los productos que deseas monitorear</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/acciones`}>
                  <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1 border border-primary/20">
                    Ver Plan de Acción
                    <ArrowRight size={12} />
                  </Button>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                      <ExternalLink size={16} /> Escáner Automático
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Escáner de Software Automático</DialogTitle>
                      <DialogDescription>
                        Descarga nuestro script seguro para leer automáticamente los programas instalados en tus equipos Windows y enviarlos a este panel.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground space-y-2">
                      <p><strong>Instrucciones:</strong></p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Haz clic en descargar para obtener el archivo <code className="text-primary bg-primary/10 px-1 rounded">.ps1</code></li>
                        <li>Ve a tu carpeta de Descargas.</li>
                        <li>Haz clic derecho sobre el archivo y selecciona <strong>"Ejecutar con PowerShell"</strong>.</li>
                        <li>Espera unos segundos y recarga esta página.</li>
                      </ol>
                    </div>
                    <DialogFooter>
                      <Button onClick={downloadScanner} className="w-full gap-2">
                        <FileDown size={18} /> Descargar Escáner (.ps1)
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus size={16} /> Manual
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Añadir Producto al Inventario</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre del Software (ej: Apache, Windows)</label>
                      <Input 
                        placeholder="Nombre" 
                        value={newProduct.nombre}
                        onChange={e => setNewProduct({...newProduct, nombre: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Versión</label>
                        <Input 
                          placeholder="Versión (opcional)" 
                          value={newProduct.version}
                          onChange={e => setNewProduct({...newProduct, version: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Proveedor</label>
                        <Input 
                          placeholder="Vendor" 
                          value={newProduct.proveedor}
                          onChange={e => setNewProduct({...newProduct, proveedor: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddProduct} disabled={!newProduct.nombre}>Guardar Producto</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {productos.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-xl bg-background/50">
                <Cpu size={40} className="mx-auto text-primary/30 mb-3" />
                <h3 className="font-semibold text-lg mb-1">Tu inventario está vacío</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                  Añade productos manualmente o descarga el Escáner Automático para poblar tu lista rápidamente.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {productos.map(p => (
                  <Badge key={p.id} variant="secondary" className="pl-3 pr-2 py-1 gap-2 border-primary/10 bg-primary/5 text-foreground group">
                    <span className="font-bold">{p.nombre}</span>
                    <span className="text-xs opacity-70">{p.version}</span>
                    <button onClick={() => handleDeleteProduct(p.id)} className="hover:text-destructive transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="card-glass border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-2">
              <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Productos</p>
              <p className="text-2xl font-extrabold">{stats.productos}</p>
            </CardContent>
          </Card>
          <Card className="card-glass border-muted-foreground/20">
            <CardContent className="pt-4 pb-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Vulns. Totales</p>
              <p className="text-2xl font-extrabold">{stats.vulnerabilidades}</p>
            </CardContent>
          </Card>
          <Card className="card-glass border-risk-high/30 bg-risk-high/5">
            <CardContent className="pt-4 pb-2">
              <p className="text-[10px] uppercase font-bold text-risk-high tracking-widest">Críticas</p>
              <p className="text-2xl font-extrabold text-risk-high">{stats.critical}</p>
            </CardContent>
          </Card>
          <Card className="card-glass border-risk-high/10">
            <CardContent className="pt-4 pb-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Altas</p>
              <p className="text-2xl font-extrabold text-risk-high/80">{stats.high}</p>
            </CardContent>
          </Card>
          <Card className="card-glass border-warning/10">
            <CardContent className="pt-4 pb-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Medias</p>
              <p className="text-2xl font-extrabold text-warning">{stats.medium}</p>
            </CardContent>
          </Card>
          <Card className="card-glass border-success/10">
            <CardContent className="pt-4 pb-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Bajas</p>
              <p className="text-2xl font-extrabold text-success">{stats.low}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar CVE o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 border-primary/10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Button variant={severityFilter === null ? "default" : "outline"} size="sm" onClick={() => setSeverityFilter(null)}>
              Todos
            </Button>
            <Button variant={severityFilter === "critical" ? "destructive" : "outline"} size="sm" onClick={() => setSeverityFilter("critical")}>
              Crítico
            </Button>
            <Button variant={severityFilter === "high" ? "destructive" : "outline"} size="sm" onClick={() => setSeverityFilter("high")}>
              Alto
            </Button>
            <Button variant={severityFilter === "medium" ? "secondary" : "outline"} size="sm" onClick={() => setSeverityFilter("medium")}>
              Medio
            </Button>
          </div>
        </div>

        {/* List */}
        {vulnerabilidades.length === 0 ? (
          <Card className="card-glass py-12">
            <CardContent className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <Database size={32} className="text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sin hallazgos pendientes</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                No se han detectado vulnerabilidades para tu inventario actual. Inicia un escaneo para verificar amenazas externas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="todos" className="space-y-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="todos">Todos ({filteredVulnerabilidades.length})</TabsTrigger>
              <TabsTrigger value="sin-patch">Pendientes ({vulnerabilidades.filter(v => !v.parchada).length})</TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="space-y-4">
              <div className="grid gap-3">
                {filteredVulnerabilidades.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground text-sm font-medium italic">No se encontraron resultados para tu búsqueda</p>
                ) : (
                  filteredVulnerabilidades.map((vuln: any) => (
                    <VulnerabilityCard key={vuln.id} vuln={vuln} onMarkParched={markAsParched} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sin-patch" className="space-y-4">
              <div className="grid gap-3">
                {vulnerabilidades.filter(v => !v.parchada).length === 0 ? (
                  <div className="card-glass p-8 text-center border-dashed border-2">
                    <CheckCircle2 size={32} className="mx-auto text-success mb-2 opacity-50" />
                    <p className="text-sm font-medium text-muted-foreground">¡Todo al día! No hay vulnerabilidades pendientes de parche.</p>
                  </div>
                ) : (
                  vulnerabilidades
                    .filter(v => !v.parchada)
                    .map((vuln: any) => (
                      <VulnerabilityCard key={vuln.id} vuln={vuln} onMarkParched={markAsParched} />
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* External Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <Card className="card-glass border-primary/10 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => window.open('https://nvd.nist.gov', '_blank')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-primary border border-primary/10">
                <ExternalLink size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">NVD NIST Dashboard</p>
                <p className="text-xs text-muted-foreground">Consulta la base de datos oficial del gobierno de EE.UU.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-glass border-primary/10 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => window.open('https://cve.mitre.org', '_blank')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-primary border border-primary/10">
                <Globe size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">MITRE CVE Program</p>
                <p className="text-xs text-muted-foreground">Estándar internacional para identificadores de vulnerabilidades.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
