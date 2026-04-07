import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getQuestionsWithNormativas } from "@/lib/cybersecurity-data";
import { accionService } from "@/lib/services";
import { useEmpresa } from "@/hooks/useEmpresa";
import type { ActionStatus, ActionPriority } from "@/lib/database.types";
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
  AlertCircle 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const { acciones, diagnostico, refresh } = useEmpresa();
  const [filter, setFilter] = useState("todas");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filtered = acciones.filter((a) => filter === "todas" || a.estado === filter);

  async function cycleStatus(id: string, next: ActionStatus) {
    setLoadingId(id);
    try {
      await accionService.updateStatus(id, next);
      await refresh();
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

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
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
                    <h4 className="text-sm font-bold text-foreground mb-2">Estado de la Acción</h4>
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
                    <Button className="bg-primary text-primary-foreground">
                      <FileText size={16} className="mr-2" />
                      Adjuntar Evidencia
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
