import { useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useEmpresa } from "@/hooks/useEmpresa";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Shield,
  Loader2,
  CheckCircle2,
  Database,
  Clock,
  HardDrive,
  AlertTriangle,
  RefreshCw,
  Info,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BackupSection {
  key: string;
  label: string;
  table: string;
  icon: React.ReactNode;
  description: string;
}

const BACKUP_SECTIONS: BackupSection[] = [
  { key: "diagnosticos", label: "Diagnósticos", table: "diagnosticos", icon: <Shield size={18} />, description: "Resultados de evaluaciones de seguridad" },
  { key: "acciones", label: "Plan de Acción", table: "acciones", icon: <CheckCircle2 size={18} />, description: "Acciones correctivas y preventivas" },
  { key: "evidencias", label: "Evidencias", table: "evidencias", icon: <HardDrive size={18} />, description: "Archivos y registros de evidencia" },
  { key: "alertas", label: "Alertas", table: "alertas", icon: <AlertTriangle size={18} />, description: "Historial de notificaciones" },
  { key: "cumplimiento_documentos", label: "Documentos de Cumplimiento", table: "cumplimiento_documentos", icon: <FileJson size={18} />, description: "Estado de documentación normativa" },
  { key: "vulnerabilidades", label: "Vulnerabilidades", table: "vulnerabilidades", icon: <Database size={18} />, description: "Vulnerabilidades detectadas" },
  { key: "campanas_phishing", label: "Campañas de Phishing", table: "campanas_phishing", icon: <RefreshCw size={18} />, description: "Simulaciones de phishing realizadas" },
  { key: "score_history", label: "Historial de Puntuación", table: "score_history", icon: <Clock size={18} />, description: "Evolución del score de seguridad" },
  { key: "configuraciones", label: "Configuración", table: "configuraciones", icon: <Info size={18} />, description: "Ajustes y preferencias de la empresa" },
];

function convertToCSV(data: any[], tableName: string): string {
  if (!data || data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        // Escapar comillas y envolver en comillas si contiene coma o salto de línea
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType }); // BOM para UTF-8 en Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Backup() {
  const { empresa } = useEmpresa();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(BACKUP_SECTIONS.map((s) => s.key))
  );
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem("last_backup_date")
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (key: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedSections(new Set(BACKUP_SECTIONS.map((s) => s.key)));
  };

  const deselectAll = () => {
    setSelectedSections(new Set());
  };

  const fetchAllData = async () => {
    if (!empresa?.id) return null;

    const result: Record<string, any[]> = {};
    const selected = BACKUP_SECTIONS.filter((s) => selectedSections.has(s.key));

    for (let i = 0; i < selected.length; i++) {
      const section = selected[i];
      setProgress(`Exportando ${section.label} (${i + 1}/${selected.length})...`);

      try {
        const { data, error } = await supabase
          .from(section.table)
          .select("*")
          .eq("empresa_id", empresa.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn(`Error fetching ${section.table}:`, error);
          result[section.key] = [];
        } else {
          result[section.key] = data || [];
        }
      } catch (err) {
        console.warn(`Error fetching ${section.table}:`, err);
        result[section.key] = [];
      }
    }

    return result;
  };

  const handleExportJSON = async () => {
    if (!empresa?.id) {
      toast.error("No hay empresa seleccionada");
      return;
    }
    if (selectedSections.size === 0) {
      toast.error("Selecciona al menos una sección para exportar");
      return;
    }

    setLoading(true);
    try {
      const allData = await fetchAllData();
      if (!allData) return;

      const backup = {
        metadata: {
          empresa: empresa.nombre,
          empresa_id: empresa.id,
          sector: empresa.sector,
          fecha_backup: new Date().toISOString(),
          version: "1.0",
          plataforma: "CHV CiberDefensa",
          secciones_incluidas: Array.from(selectedSections),
        },
        data: allData,
      };

      const json = JSON.stringify(backup, null, 2);
      const fecha = new Date().toISOString().split("T")[0];
      const nombreLimpio = empresa.nombre.replace(/[^a-zA-Z0-9]/g, "_");
      downloadFile(json, `backup_${nombreLimpio}_${fecha}.json`, "application/json;charset=utf-8");

      const now = new Date().toLocaleString("es-CO");
      setLastBackup(now);
      localStorage.setItem("last_backup_date", now);
      toast.success("Backup JSON descargado exitosamente");
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Error al crear el backup");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const handleExportCSV = async () => {
    if (!empresa?.id) {
      toast.error("No hay empresa seleccionada");
      return;
    }
    if (selectedSections.size === 0) {
      toast.error("Selecciona al menos una sección para exportar");
      return;
    }

    setLoading(true);
    try {
      const allData = await fetchAllData();
      if (!allData) return;

      const fecha = new Date().toISOString().split("T")[0];
      const nombreLimpio = empresa.nombre.replace(/[^a-zA-Z0-9]/g, "_");

      // Exportar cada sección como un CSV separado
      let exportCount = 0;
      for (const [key, data] of Object.entries(allData)) {
        if (data.length === 0) continue;
        const csv = convertToCSV(data, key);
        if (csv) {
          downloadFile(csv, `${nombreLimpio}_${key}_${fecha}.csv`, "text/csv;charset=utf-8");
          exportCount++;
        }
      }

      if (exportCount === 0) {
        toast.info("No hay datos para exportar en las secciones seleccionadas");
        return;
      }

      const now = new Date().toLocaleString("es-CO");
      setLastBackup(now);
      localStorage.setItem("last_backup_date", now);
      toast.success(`${exportCount} archivos CSV descargados exitosamente`);
    } catch (error) {
      console.error("Error creating CSV backup:", error);
      toast.error("Error al crear los archivos CSV");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const handleRestoreJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!empresa?.id) {
      toast.error("No hay empresa seleccionada");
      return;
    }

    if (!confirm("⚠️ ATENCIÓN: Estás a punto de restaurar un backup. Esto sobrescribirá y actualizará tus datos actuales con los del archivo. ¿Deseas continuar?")) {
      event.target.value = ""; // Reset file input
      return;
    }

    setLoading(true);
    setProgress("Leyendo archivo JSON...");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const backup = JSON.parse(content);

          // Validación de seguridad
          if (backup.metadata?.empresa_id !== empresa.id) {
            toast.error("Error de seguridad: El archivo de backup pertenece a otra empresa.");
            setLoading(false);
            setProgress("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }

          if (!backup.data || typeof backup.data !== 'object') {
            toast.error("El formato del archivo JSON no es válido.");
            setLoading(false);
            setProgress("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }

          const tablesToRestore = Object.keys(backup.data);
          let restoredTablesCount = 0;

          // Restaurar cada tabla encontrada
          for (const tableName of tablesToRestore) {
            const tableData = backup.data[tableName];
            if (Array.isArray(tableData) && tableData.length > 0) {
              setProgress(`Restaurando ${tableName} (${tableData.length} registros)...`);
              
              // Eliminar created_at, updated_at, etc si queremos dejar que la DB maneje ids
              // En este caso, como es un backup, insertamos todo exactamente igual para preservar IDs
              const { error } = await supabase
                .from(tableName)
                .upsert(tableData, { onConflict: 'id', ignoreDuplicates: false });

              if (error) {
                console.error(`Error restaurando ${tableName}:`, error);
                toast.error(`Error al restaurar sección: ${tableName}`);
              } else {
                restoredTablesCount++;
              }
            }
          }

          toast.success(`Restauración exitosa. Se actualizaron ${restoredTablesCount} secciones.`);
          
          // Recargar tras un par de segundos para ver reflejados los cambios en todos los estados
          setTimeout(() => {
            window.location.reload();
          }, 2000);

        } catch (err) {
          console.error("Error parsing/restoring JSON:", err);
          toast.error("Error al procesar o restaurar el archivo JSON.");
        } finally {
          setLoading(false);
          setProgress("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Error al leer el archivo seleccionado.");
      setLoading(false);
      setProgress("");
      event.target.value = "";
    }
  };

  // Calcular estadísticas
  const totalSections = BACKUP_SECTIONS.length;
  const selectedCount = selectedSections.size;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Database size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              Copia de Seguridad
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                BACKUP
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              Descarga toda la información de tu empresa en formato JSON o CSV
            </p>
          </div>
        </div>

        {/* Info Banner */}
        {!empresa && (
          <div className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-3">
            <AlertTriangle size={20} className="text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">No hay empresa seleccionada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Debes tener una empresa registrada para poder generar copias de seguridad.
              </p>
            </div>
          </div>
        )}

        {empresa && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="card-glass border-primary/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Empresa</p>
                    <p className="text-sm font-bold text-foreground truncate">{empresa.nombre}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass border-primary/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Secciones seleccionadas</p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedCount} / {totalSections}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass border-primary/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock size={18} className="text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Último backup</p>
                    <p className="text-sm font-bold text-foreground">
                      {lastBackup || "Nunca"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section Selector */}
            <Card className="card-glass border-primary/10 mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground">
                    Seleccionar datos a exportar
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      className="text-xs text-primary hover:text-primary"
                    >
                      Seleccionar todo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deselectAll}
                      className="text-xs text-muted-foreground"
                    >
                      Deseleccionar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BACKUP_SECTIONS.map((section) => {
                    const isSelected = selectedSections.has(section.key);
                    return (
                      <button
                        key={section.key}
                        onClick={() => toggleSection(section.key)}
                        disabled={loading}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200",
                          isSelected
                            ? "bg-primary/5 border-primary/30 shadow-sm"
                            : "bg-muted/30 border-border hover:border-primary/20"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                            isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {section.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              isSelected ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {section.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {section.description}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-1 transition-all",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {isSelected && <CheckCircle2 size={12} className="text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            {loading && progress && (
              <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 animate-pulse">
                <Loader2 size={20} className="text-primary animate-spin" />
                <p className="text-sm text-foreground font-medium">{progress}</p>
              </div>
            )}

            {/* Export & Import Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card
                className={cn(
                  "card-glass border-primary/10 cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg",
                  loading && "opacity-50 pointer-events-none"
                )}
                onClick={handleExportJSON}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mx-auto">
                    <FileJson size={32} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">Exportar JSON</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Archivo único estructurado.
                    </p>
                  </div>
                  <Button
                    disabled={loading || selectedSections.size === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Exportar
                  </Button>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  "card-glass border-primary/10 cursor-pointer transition-all hover:border-primary/30 hover:shadow-lg",
                  loading && "opacity-50 pointer-events-none"
                )}
                onClick={handleExportCSV}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto">
                    <FileSpreadsheet size={32} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">Exportar CSV</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Compatible con Excel.
                    </p>
                  </div>
                  <Button
                    disabled={loading || selectedSections.size === 0}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Exportar
                  </Button>
                </CardContent>
              </Card>

              {/* Restore Button */}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".json" 
                hidden 
                onChange={handleRestoreJSON} 
              />
              <Card
                className={cn(
                  "card-glass border-warning/10 cursor-pointer transition-all hover:border-warning/30 hover:shadow-lg",
                  loading && "opacity-50 pointer-events-none"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center mx-auto">
                    <Upload size={32} className="text-warning" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">Restaurar JSON</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cargar backup existente.
                    </p>
                  </div>
                  <Button
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    Restaurar
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Security Note */}
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border flex items-start gap-3">
              <Shield size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Nota de seguridad</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Los archivos de backup contienen información sensible de tu empresa. Almacénalos en un lugar seguro
                  y no los compartas con personas no autorizadas. Te recomendamos hacer un backup al menos una vez al mes.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
