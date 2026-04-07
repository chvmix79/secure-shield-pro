import { AppLayout } from "@/components/AppLayout";
import { useEmpresa } from "@/hooks/useEmpresa";
import { AlertTriangle, Clock, ShieldOff, Bell, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const typeConfig: Record<string, { icon: typeof Clock; label: string }> = {
  vencida: { icon: Clock, label: "Acción vencida" },
  riesgo: { icon: AlertTriangle, label: "Riesgo detectado" },
  evidencia: { icon: ShieldOff, label: "Evidencia faltante" },
  info: { icon: Bell, label: "Información" },
  error: { icon: AlertTriangle, label: "Error" },
  warning: { icon: AlertTriangle, label: "Advertencia" },
};

const severityConfig: Record<string, {
  badge: string;
  border: string;
  dot: string;
}> = {
  crítica: {
    badge: "bg-danger/10 text-danger border-danger/20",
    border: "border-danger/20 bg-danger/5",
    dot: "bg-danger",
  },
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
  const { alertas, markAlertaRead, markAllAlertasRead } = useEmpresa();
  const [filter, setFilter] = useState("todas");

  const unread = alertas.filter((a) => !a.leida).length;

  const filtered = alertas.filter((a) => {
    if (filter === "no_leidas") return !a.leida;
    if (filter === "criticas") return a.tipo === "critical" || a.tipo === "error";
    return true;
  });

  async function handleMarkRead(id: string) {
    await markAlertaRead(id);
  }

  async function handleMarkAllRead() {
    await markAllAlertasRead();
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
              onClick={handleMarkAllRead}
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
            { label: "Críticas", value: alertas.filter((a) => a.tipo === "critical" || a.tipo === "error").length, color: "text-risk-high" },
            { label: "Total", value: alertas.length, color: "text-foreground" },
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
            const alertType = alert.tipo || 'info';
            const typeCfg = typeConfig[alertType] || typeConfig.info;
            const sevCfg = severityConfig[alert.tipo === 'critical' ? 'crítica' : alert.tipo === 'error' ? 'critica' : 'media'];
            const Icon = typeCfg.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  "card-glass rounded-xl p-4 border transition-all",
                  !alert.leida ? sevCfg.border : "border-border opacity-70"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                    !alert.leida ? sevCfg.badge : "bg-muted/50 border-border text-muted-foreground"
                  )}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {!alert.leida && (
                          <span className={cn("w-2 h-2 rounded-full shrink-0", sevCfg.dot)} />
                        )}
                        <h3 className={cn("text-sm font-semibold leading-snug", alert.leida ? "text-muted-foreground" : "text-foreground")}>
                          {alert.titulo}
                        </h3>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{new Date(alert.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{alert.descripcion}</p>
                    <div className="flex items-center gap-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs border", sevCfg.badge)}>
                        {alert.tipo === 'critical' || alert.tipo === 'error' ? 'Crítica' : alert.tipo === 'warning' ? 'Alta' : 'Media'}
                      </span>
                      <span className="text-xs text-muted-foreground">{typeCfg.label}</span>
                      {!alert.leida && (
                        <button
                          onClick={() => handleMarkRead(alert.id)}
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
