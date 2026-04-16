import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getQuestionsWithNormativas } from "@/lib/cybersecurity-data";
import { accionService } from "@/lib/services";
import { useEmpresa } from "@/hooks/useEmpresa";
import type { ActionStatus, ActionPriority } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Calendar, 
  User, 
  Loader2, 
  Zap, 
  Target, 
  ChevronRight, 
  Shield, 
  FileText, 
  AlertCircle,
  Link as LinkIcon,
  Paperclip,
  Plus,
  Trash2,
  ExternalLink,
  Upload
} from "lucide-react";

const EMPRESA_DEMO_ID = '00000000-0000-0000-0000-000000000001';

const statusConfig: Record<string, { label: string; icon: typeof Circle; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", icon: Circle, color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
  en_progreso: { label: "En progreso", icon: Clock, color: "text-primary", bg: "bg-primary/5 border-primary/20" },
  completada: { label: "Completada", icon: CheckCircle2, color: "text-success", bg: "bg-success/5 border-success/20" },
  vencida: { label: "Vencida", icon: AlertTriangle, color: "text-danger", bg: "bg-danger/5 border-danger/20" },
};

const priorityConfig: Record<string, { label: string; color: string; dot: string }> = {
  crítica: { label: "Crítica", color: "text-danger", dot: "bg-danger" },
  alta: { label: "Alta", color: "text-risk-high", dot: "bg-risk-high" },
  media: { label: "Media", color: "text-risk-medium", dot: "bg-risk-medium" },
  baja: { label: "Baja", color: "text-success", dot: "bg-success" },
};

export default function Acciones() {
  const { acciones, diagnostico, refresh, evidencias, createEvidencia } = useEmpresa();
  const [filter, setFilter] = useState("todas");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // States for new evidence
  const [evidLink, setEvidLink] = useState("");
  const [evidNotes, setEvidNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const actionEvidences = selectedAction 
    ? evidencias.filter(e => e.accion_id === selectedAction.id)
    : [];

  const filtered = acciones.filter((a) => filter === "todas" || a.estado === filter);

  async function cycleStatus(id: string, next: ActionStatus) {
    setLoadingId(id);
    try {
      await accionService.updateStatus(id, next);
      await refresh();
      if (selectedAction && selectedAction.id === id) {
        setSelectedAction({ ...selectedAction, estado: next });
      }
      toast.success(`Acción movida a ${statusConfig[next].label}`, {
        description: "El listado se ha actualizado según el nuevo estado.",
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Error al actualizar el estado");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleAddEvidence() {
    if (!selectedAction) return;

    if (uploadMode === 'url' && !evidLink) {
      toast.error("Debes ingresar un link para la evidencia");
      return;
    }

    if (uploadMode === 'file' && !file) {
      toast.error("Debes seleccionar un archivo");
      return;
    }

    setIsUploading(true);
    try {
      let archivo_url = evidLink;
      let finalTitle = evidLink ? "Evidencia vía Link" : "Evidencia de archivo";

      if (uploadMode === 'file' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedAction.empresa_id || 'global'}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('evidencias')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('evidencias')
          .getPublicUrl(fileName);
          
        archivo_url = publicUrlData.publicUrl;
        finalTitle = file.name;
      }

      await createEvidencia({
        accion_id: selectedAction.id,
        titulo: finalTitle.substring(0, 100),
        tipo: uploadMode === 'file' ? 'documento' : 'captura',
        archivo_url: archivo_url || null,
        notas: evidNotes || null
      });
      
      toast.success("Evidencia adjuntada con éxito");
      setEvidLink("");
      setEvidNotes("");
      setFile(null);
      setShowAddEvidence(false);
    } catch (error: any) {
      console.error('Error adding evidence:', error);
      toast.error(error.message || "Error al adjuntar evidencia");
    } finally {
      setIsUploading(false);
    }
  }

  const counts = {
    todas: acciones.length,
    pendiente: acciones.filter((a) => a.estado === "pendiente").length,
    en_progreso: acciones.filter((a) => a.estado === "en_progreso").length,
    completada: acciones.filter((a) => a.estado === "completada").length,
    vencida: acciones.filter((a) => a.estado === "vencida").length,
  };

  const completionPct = acciones.length > 0 ? Math.round((counts.completada / acciones.length) * 100) : 0;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Plan de Acción</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acciones concretas para reducir tus riesgos de seguridad
            </p>
          </div>
          <div className="card-glass rounded-xl px-4 py-2 flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{completionPct}%</p>
              <p className="text-xs text-muted-foreground">Completado</p>
            </div>
            <div className="w-12 h-12 relative">
              <svg width={48} height={48} viewBox="0 0 48 48" className="rotate-[-90deg]">
                <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r="18" fill="none"
                  stroke="hsl(var(--success))" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - completionPct / 100)}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "card-glass rounded-xl p-3 text-left border transition-all",
                  filter === key ? "border-primary" : cfg.bg
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className={cfg.color} />
                  <span className="text-xs text-muted-foreground">{cfg.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{counts[key as keyof typeof counts]}</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter size={14} className="text-muted-foreground shrink-0" />
          <button
            onClick={() => setFilter("todas")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${filter === "todas" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Todas ({counts.todas})
          </button>
          <button
            onClick={() => setFilter("pendiente")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${filter === "pendiente" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Pendientes ({counts.pendiente})
          </button>
          <button
            onClick={() => setFilter("en_progreso")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${filter === "en_progreso" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            En progreso ({counts.en_progreso})
          </button>
          <button
            onClick={() => setFilter("completada")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${filter === "completada" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Completadas ({counts.completada})
          </button>
        </div>

        <div className="space-y-3">
          {filtered.map((action) => {
            return (
              <div
                key={action.id}
                onClick={() => {
                  setSelectedAction(action);
                  setIsDetailOpen(true);
                }}
                className={cn(
                  "card-glass rounded-xl p-4 border transition-all cursor-pointer group hover:bg-white/5",
                  loadingId === action.id ? "opacity-50 pointer-events-none" : "opacity-100",
                  action.estado === 'completada' ? "border-success/20 bg-success/5" : "border-white/5"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                    action.estado === 'completada' ? "bg-success/20 border-success/30 text-success" :
                    action.estado === 'en_progreso' ? "bg-primary/20 border-primary/30 text-primary" :
                    "bg-muted border-border text-muted-foreground"
                  )}>
                    {action.estado === 'completada' ? <CheckCircle2 size={20} /> : 
                     action.estado === 'en_progreso' ? <Clock size={20} /> : 
                     <Circle size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={cn("text-sm font-semibold leading-snug truncate", 
                        action.estado === 'completada' ? "text-success" : "text-foreground")}>
                        {action.titulo}
                      </h3>
                      <Badge variant="outline" className={cn("text-[10px] shrink-0",
                        action.prioridad === 'alta' ? "text-danger border-danger" : "text-muted-foreground border-border")}>
                        {action.prioridad}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{action.descripcion}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider font-bold">
                         <Target size={10} /> {action.categoria}
                       </span>
                       <span className="text-[10px] text-primary hover:underline ml-auto flex items-center gap-1">
                         Gestionar <ChevronRight size={10} />
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {acciones.length === 0 && diagnostico && (
          <div className="card-glass rounded-xl p-8 text-center space-y-4 border-dashed border-2">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto text-primary">
              <AlertTriangle size={32} />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold">No se encontró un Plan de Acción</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Parece que tienes un diagnóstico pero no se generaron acciones automáticas. 
                Haz clic abajo para generar tu plan detallado basado en tus respuestas.
              </p>
            </div>
            <Button 
              onClick={async () => {
                setIsGenerating(true);
                try {
                  const questions = getQuestionsWithNormativas();
                  const accionesToInsert = [];
                  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
                  
                  const responses = diagnostico.respuestas || {};
                  
                  for (const q of questions) {
                    const s = responses[q.id];
                    if (s !== undefined && s < 10) {
                      accionesToInsert.push({
                        empresa_id: diagnostico.empresa_id,
                        diagnostico_id: diagnostico.id,
                        titulo: `Revisar: ${q.category}`,
                        descripcion: `Detección: ${q.question}\n\nRecomendación: ${q.description}`,
                        prioridad: s === 0 ? "alta" : "media",
                        estado: "pendiente",
                        responsable: "Equipo de Seguridad",
                        categoria: q.category,
                        fecha_limite: thirtyDaysFromNow,
                      });
                    }
                  }
                  
                  if (accionesToInsert.length > 0) {
                    await accionService.createMany(accionesToInsert);
                    toast.success("Plan de acción generado con éxito");
                    await refresh();
                  } else {
                    toast.info("Tu nivel de seguridad es excelente, no se requieren acciones inmediatas.");
                  }
                } catch (err) {
                  toast.error("Error al generar el plan");
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating}
              className="bg-primary text-primary-foreground gap-2"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Generar Plan de Acción Ahora
            </Button>
          </div>
        )}

        <Dialog open={isDetailOpen} onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) {
            setShowAddEvidence(false);
            setEvidLink("");
            setEvidNotes("");
          }
        }}>
          <DialogContent className="max-w-2xl bg-background border-border">
            {selectedAction && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={cn(
                      selectedAction.prioridad === 'alta' ? "bg-danger/10 text-danger border-danger/20" : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      Prioridad {selectedAction.prioridad}
                    </Badge>
                    <Badge variant="outline" className="bg-muted border-border">
                      {selectedAction.categoria}
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    {selectedAction.titulo}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-base mt-4">
                    {selectedAction.descripcion}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 my-6">
                  <div className="bg-muted/50 border border-border rounded-xl p-4">
                    <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-2 uppercase tracking-tight">
                      <Shield size={16} /> Racional de Seguridad
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Esta acción es fundamental para fortalecer tu postura de seguridad. 
                      Al completarla, reduces la superficie de ataque y aseguras el cumplimiento 
                      con estándares internacionales.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-foreground mb-2 text-primary uppercase tracking-tight">Estado de la Acción</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'pendiente', label: 'Pendiente', icon: Circle, color: 'text-muted-foreground bg-muted' },
                        { id: 'en_progreso', label: 'En Progreso', icon: Clock, color: 'text-primary bg-primary/10 border-primary/20' },
                        { id: 'completada', label: 'Completada', icon: CheckCircle2, color: 'text-success bg-success/10 border-success/20' }
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            cycleStatus(selectedAction.id, s.id as any);
                            setSelectedAction({ ...selectedAction, estado: s.id as any });
                          }}
                          disabled={loadingId === selectedAction.id}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
                            selectedAction.estado === s.id ? s.color : "bg-muted/50 border-transparent opacity-50 hover:opacity-100"
                          )}
                        >
                          <s.icon size={24} className="mb-2" />
                          <span className="text-xs font-bold">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Paperclip size={16} className="text-primary" /> Evidencias Adjuntas
                      </h4>
                      {!showAddEvidence && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-[10px] bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                          onClick={() => setShowAddEvidence(true)}
                        >
                          <Plus size={12} className="mr-1" /> Adjuntar Nueva
                        </Button>
                      )}
                    </div>

                    {showAddEvidence ? (
                      <div className="bg-muted/30 border border-dashed border-border rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <Tabs value={uploadMode} onValueChange={(val: any) => setUploadMode(val)} className="w-full">
                          <TabsList className="grid w-full grid-cols-2 h-8">
                            <TabsTrigger value="file" className="text-[10px]"><Plus size={12} className="mr-1" /> Archivo</TabsTrigger>
                            <TabsTrigger value="url" className="text-[10px]"><LinkIcon size={12} className="mr-1" /> Link</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="file" className="mt-4">
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-background/30"
                            >
                              <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    setFile(e.target.files[0]);
                                  }
                                }}
                              />
                              {file ? (
                                <div className="space-y-1">
                                  <CheckCircle2 size={24} className="mx-auto text-success" />
                                  <p className="text-xs font-semibold text-foreground truncate max-w-full px-2">{file.name}</p>
                                  <p className="text-[10px] text-muted-foreground">Clic para cambiar</p>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <Upload size={24} className="mx-auto text-muted-foreground mb-1" />
                                  <p className="text-xs font-medium text-foreground">Seleccionar archivo</p>
                                  <p className="text-[10px] text-muted-foreground">PDF, Word, Imagen (Max 10MB)</p>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="url" className="mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="evid-link" className="text-xs font-semibold">Link de Evidencia (Drive, SharePoint, etc.)</Label>
                              <div className="relative">
                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="evid-link"
                                  placeholder="https://..."
                                  className="pl-9 h-9 text-sm bg-background/50"
                                  value={evidLink}
                                  onChange={(e) => setEvidLink(e.target.value)}
                                />
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>

                        <div className="space-y-2">
                          <Label htmlFor="evid-notes" className="text-xs font-semibold">Notas adicionales (opcional)</Label>
                          <Textarea
                            id="evid-notes"
                            placeholder="Describe qué contiene esta evidencia..."
                            className="text-sm min-h-[80px] resize-none bg-background/50"
                            value={evidNotes}
                            onChange={(e) => setEvidNotes(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs"
                            onClick={() => {
                              setShowAddEvidence(false);
                              setFile(null);
                            }}
                            disabled={isUploading}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8 text-xs bg-primary text-primary-foreground"
                            onClick={handleAddEvidence}
                            disabled={isUploading || (uploadMode === 'file' ? !file : !evidLink)}
                          >
                            {isUploading ? <Loader2 size={14} className="animate-spin mr-2" /> : <CheckCircle2 size={14} className="mr-2" />}
                            {isUploading ? "Subiendo..." : "Guardar Evidencia"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {actionEvidences.length > 0 ? (
                          actionEvidences.map((evid) => (
                            <div key={evid.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 group hover:border-primary/30 transition-all">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 rounded-md bg-background border border-border">
                                  {evid.archivo_url?.startsWith('http') ? <LinkIcon size={14} className="text-primary" /> : <Paperclip size={14} className="text-muted-foreground" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold truncate text-foreground">{evid.titulo}</p>
                                  {evid.notas && <p className="text-[10px] text-muted-foreground truncate">{evid.notas}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {evid.archivo_url && (
                                  <a 
                                    href={evid.archivo_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"
                                    title="Ver evidencia"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/20">
                            <Paperclip size={24} className="mx-auto text-muted-foreground/20 mb-2" />
                            <p className="text-xs text-muted-foreground">No hay evidencias cargadas aún</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">Sube un archivo o pega un link para validar esta acción</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex sm:justify-between items-center gap-4 border-t border-border pt-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle size={14} />
                    Solo un administrador puede validar evidencias
                  </div>
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
                      Cerrar
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <p className="text-center text-xs text-muted-foreground">
          💡 Haz clic en una acción para ver detalles y actualizar su progreso
        </p>
      </div>
    </AppLayout>
  );
}
