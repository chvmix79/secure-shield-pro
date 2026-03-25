import { AppLayout } from "@/components/AppLayout";
import { mockActions, mockRisks } from "@/lib/cybersecurity-data";
import { AlertTriangle, Clock, ShieldOff, Bell, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Alert {
  id: string;
  type: "vencida" | "riesgo" | "evidencia" | "info";
  title: string;
  description: string;
  severity: "critica" | "alta" | "media";
  date: string;
  read: boolean;
}

const initialAlerts: Alert[] = [
  {
    id: "al1",
    type: "vencida",
    title: "Acción vencida: Actualizar política de contraseñas",
    description: "Esta acción tenía fecha límite el 25 de enero y sigue pendiente.",
    severity: "critica",
    date: "Hace 2 días",
    read: false,
  },
  {
    id: "al2",
    type: "riesgo",
    title: "Riesgo crítico: Ransomware sin acción completada",
    description: "El riesgo de Ransomware tiene acciones asignadas que aún no han sido implementadas.",
    severity: "critica",
    date: "Hace 1 día",
    read: false,
  },
  {
    id: "al3",
    type: "evidencia",
    title: "Evidencias faltantes en 5 acciones",
    description: "Las acciones completadas requieren evidencia para cerrar el ciclo de seguridad.",
    severity: "alta",
    date: "Hoy",
    read: false,
  },
  {
    id: "al4",
    type: "riesgo",
    title: "Accesos no autorizados: sin control de contraseñas",
    description: "No se ha implementado la política de contraseñas para mitigar accesos no autorizados.",
    severity: "alta",
    date: "Hace 3 días",
    read: true,
  },
  {
    id: "al5",
    type: "info",
    title: "Diagnóstico completado exitosamente",
    description: "Tu diagnóstico ha sido procesado. Score actual: 42/100. Se recomienda acción inmediata.",
    severity: "media",
    date: "Hace 4 días",
    read: true,
  },
  {
    id: "al6",
    type: "vencida",
    title: "Backup: sin implementar después de 30 días",
    description: "La implementación de backup automático fue planificada hace un mes y no se ha ejecutado.",
    severity: "critica",
    date: "Hace 5 días",
    read: true,
  },
];

const typeConfig = {
  vencida: { icon: Clock, label: "Acción vencida" },
  riesgo: { icon: AlertTriangle, label: "Riesgo detectado" },
  evidencia: { icon: ShieldOff, label: "Evidencia faltante" },
  info: { icon: Bell, label: "Información" },
};

const severityConfig = {
  critica: {
    badge: "bg-danger/10 text-danger border-danger/20",
    border: "border-danger/20 bg-danger/5",
    dot: "bg-danger",
  },
  alta: {
    badge: "bg-risk-high/10 text-risk-high border-risk-high/20",
    border: "border-warning/20 bg-warning/5",
    dot: "bg-warning",
  },
  media: {
    badge: "bg-primary/10 text-primary border-primary/20",
    border: "border-primary/10",
    dot: "bg-primary",
  },
};

export default function Alertas() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filter, setFilter] = useState("todas");

  const unread = alerts.filter((a) => !a.read).length;

  const filtered = alerts.filter((a) => {
    if (filter === "no_leidas") return !a.read;
    if (filter === "criticas") return a.severity === "critica";
    return true;
  });

  function markRead(id: string) {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  }

  function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              Alertas de Seguridad
              {unread > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-danger text-white text-xs font-bold">
                  {unread}
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Notificaciones sobre riesgos y acciones pendientes
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <CheckCircle2 size={14} />
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "No leídas", value: unread, color: "text-danger" },
            { label: "Críticas", value: alerts.filter((a) => a.severity === "critica").length, color: "text-risk-high" },
            { label: "Total", value: alerts.length, color: "text-foreground" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-glass rounded-xl p-4 text-center">
              <p className={cn("text-2xl font-bold", color)}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[
            { key: "todas", label: "Todas" },
            { key: "no_leidas", label: `No leídas (${unread})` },
            { key: "criticas", label: "Críticas" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                filter === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {filtered.map((alert) => {
            const typeCfg = typeConfig[alert.type];
            const sevCfg = severityConfig[alert.severity];
            const Icon = typeCfg.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  "card-glass rounded-xl p-4 border transition-all",
                  !alert.read ? sevCfg.border : "border-border opacity-70"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                    !alert.read ? sevCfg.badge : "bg-muted/50 border-border text-muted-foreground"
                  )}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {!alert.read && (
                          <span className={cn("w-2 h-2 rounded-full shrink-0", sevCfg.dot)} />
                        )}
                        <h3 className={cn("text-sm font-semibold leading-snug", alert.read ? "text-muted-foreground" : "text-foreground")}>
                          {alert.title}
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{alert.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{alert.description}</p>
                    <div className="flex items-center gap-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs border", sevCfg.badge)}>
                        {alert.severity === "critica" ? "Crítica" : alert.severity === "alta" ? "Alta" : "Media"}
                      </span>
                      <span className="text-xs text-muted-foreground">{typeCfg.label}</span>
                      {!alert.read && (
                        <button
                          onClick={() => markRead(alert.id)}
                          className="text-xs text-primary hover:underline ml-auto"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="card-glass rounded-xl p-12 text-center">
            <CheckCircle2 size={40} className="mx-auto text-success mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Sin alertas pendientes</h3>
            <p className="text-sm text-muted-foreground">¡Excelente! Tu empresa está al día con las acciones de seguridad.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
