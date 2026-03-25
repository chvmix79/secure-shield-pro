import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { mockActions, mockRisks } from "@/lib/cybersecurity-data";
import type { Action, ActionStatus } from "@/lib/cybersecurity-data";
import { CheckCircle2, Clock, AlertTriangle, Circle, Filter, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<ActionStatus, { label: string; icon: typeof Circle; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", icon: Circle, color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
  en_progreso: { label: "En progreso", icon: Clock, color: "text-primary", bg: "bg-primary/5 border-primary/20" },
  completada: { label: "Completada", icon: CheckCircle2, color: "text-success", bg: "bg-success/5 border-success/20" },
  vencida: { label: "Vencida", icon: AlertTriangle, color: "text-danger", bg: "bg-danger/5 border-danger/20" },
};

const priorityConfig = {
  crítica: { label: "Crítica", color: "text-danger", dot: "bg-danger" },
  alta: { label: "Alta", color: "text-risk-high", dot: "bg-risk-high" },
  media: { label: "Media", color: "text-risk-medium", dot: "bg-risk-medium" },
  baja: { label: "Baja", color: "text-success", dot: "bg-success" },
};

export default function Acciones() {
  const [actions, setActions] = useState<Action[]>(mockActions);
  const [filter, setFilter] = useState("todas");

  const filtered = actions.filter((a) => filter === "todas" || a.status === filter);

  function cycleStatus(id: string) {
    const order: ActionStatus[] = ["pendiente", "en_progreso", "completada"];
    setActions((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const idx = order.indexOf(a.status as ActionStatus);
        const next = order[(idx + 1) % order.length];
        return { ...a, status: next };
      })
    );
  }

  const counts = {
    todas: actions.length,
    pendiente: actions.filter((a) => a.status === "pendiente").length,
    en_progreso: actions.filter((a) => a.status === "en_progreso").length,
    completada: actions.filter((a) => a.status === "completada").length,
    vencida: actions.filter((a) => a.status === "vencida").length,
  };

  const completionPct = Math.round((counts.completada / actions.length) * 100);

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

        {/* Stats */}
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

        {/* Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter size={14} className="text-muted-foreground shrink-0" />
          <button
            onClick={() => setFilter("todas")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${filter === "todas" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Todas ({counts.todas})
          </button>
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${filter === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {cfg.label} ({counts[key as keyof typeof counts]})
            </button>
          ))}
        </div>

        {/* Actions list */}
        <div className="space-y-3">
          {filtered.map((action) => {
            const statusCfg = statusConfig[action.status];
            const priorityCfg = priorityConfig[action.priority];
            const StatusIcon = statusCfg.icon;
            const risk = mockRisks.find((r) => r.id === action.riskId);
            const isOverdue = action.status !== "completada" && new Date(action.dueDate) < new Date();

            return (
              <div
                key={action.id}
                className={cn(
                  "card-glass rounded-xl p-5 border transition-all",
                  isOverdue ? "border-danger/30" : statusCfg.bg
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Status toggle button */}
                  <button
                    onClick={() => cycleStatus(action.id)}
                    title="Cambiar estado"
                    className={cn("mt-0.5 shrink-0 transition-colors", statusCfg.color)}
                  >
                    <StatusIcon size={20} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <h3 className={cn("font-semibold leading-snug", action.status === "completada" ? "line-through text-muted-foreground" : "text-foreground")}>
                        {action.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("flex items-center gap-1 text-xs font-medium", priorityCfg.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", priorityCfg.dot)} />
                          {priorityCfg.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{action.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {risk && (
                        <span className="flex items-center gap-1">
                          <span>{risk.icon}</span>
                          {risk.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {action.responsible}
                      </span>
                      <span className={cn("flex items-center gap-1", isOverdue ? "text-danger font-medium" : "")}>
                        <Calendar size={11} />
                        {action.dueDate}
                        {isOverdue && " (vencida)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          💡 Haz clic en el ícono de estado para actualizar el progreso de cada acción
        </p>
      </div>
    </AppLayout>
  );
}
