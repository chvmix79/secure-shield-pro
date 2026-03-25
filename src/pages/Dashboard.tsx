import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { SecurityScoreWidget, RiskBadge } from "@/components/SecurityWidgets";
import { mockRisks, mockActions, mockCompany } from "@/lib/cybersecurity-data";
import { ShieldCheck, AlertTriangle, ListTodo, CheckCircle2, Clock, ArrowRight, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const pendingActions = mockActions.filter((a) => a.status === "pendiente" || a.status === "vencida");
const completedActions = mockActions.filter((a) => a.status === "completada");
const criticalRisks = mockRisks.filter((r) => r.level === "alto" || r.level === "crítico");

const stats = [
  {
    label: "Riesgos Detectados",
    value: mockRisks.length.toString(),
    sub: `${criticalRisks.length} críticos`,
    icon: AlertTriangle,
    color: "text-risk-high",
    bg: "bg-danger/10 border-danger/20",
    to: "/riesgos",
  },
  {
    label: "Acciones Pendientes",
    value: pendingActions.length.toString(),
    sub: "Requieren atención",
    icon: ListTodo,
    color: "text-risk-medium",
    bg: "bg-warning/10 border-warning/20",
    to: "/acciones",
  },
  {
    label: "Acciones Completadas",
    value: completedActions.length.toString(),
    sub: `de ${mockActions.length} totales`,
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10 border-success/20",
    to: "/acciones",
  },
  {
    label: "Score de Seguridad",
    value: "42",
    sub: "Riesgo Alto",
    icon: ShieldCheck,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    to: "/diagnostico",
  },
];

const recentAlerts = [
  { text: "Acción vencida: Actualizar política de contraseñas", level: "alto", time: "Hace 2 días" },
  { text: "Riesgo crítico sin atender: Backup sin configurar", level: "alto", time: "Hace 1 día" },
  { text: "Simulacro de phishing pendiente", level: "medio", time: "Esta semana" },
];

export default function Dashboard() {
  const score = 42;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard de Seguridad</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mockCompany.name} · {mockCompany.sector}
            </p>
          </div>
          <Link to="/diagnostico">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
              <Zap size={16} />
              Nuevo Diagnóstico
            </Button>
          </Link>
        </div>

        {/* Score + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Score circle */}
          <div className="lg:col-span-1 card-glass rounded-xl p-6 flex flex-col items-center justify-center gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Score Global</p>
            <SecurityScoreWidget score={score} />
            <Link to="/diagnostico" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
              Ver diagnóstico <ArrowRight size={12} />
            </Link>
          </div>

          {/* Stats */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ label, value, sub, icon: Icon, color, bg, to }) => (
              <Link key={label} to={to} className="card-glass rounded-xl p-4 hover:border-primary/30 transition-all group">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${bg}`}>
                  <Icon size={20} className={color} />
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress bar section */}
        <div className="card-glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Estado por Categoría
            </h2>
            <span className="text-xs text-muted-foreground">Basado en último diagnóstico</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Contraseñas", score: 50, icon: "🔑" },
              { label: "Backups", score: 20, icon: "💾" },
              { label: "Antivirus", score: 80, icon: "🛡️" },
              { label: "Capacitación", score: 30, icon: "📚" },
              { label: "Red / WiFi", score: 50, icon: "📡" },
              { label: "Correo", score: 60, icon: "📧" },
              { label: "Actualizaciones", score: 40, icon: "🔄" },
              { label: "Autenticación 2FA", score: 10, icon: "📱" },
            ].map(({ label, score: s, icon }) => {
              const color = s >= 70 ? "bg-success" : s >= 40 ? "bg-warning" : "bg-danger";
              const text = s >= 70 ? "text-success" : s >= 40 ? "text-warning" : "text-danger";
              return (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span>{icon}</span> {label}
                    </span>
                    <span className={`font-semibold ${text}`}>{s}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${s}%`, transition: "width 1s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Critical risks */}
          <div className="card-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle size={16} className="text-risk-high" />
                Riesgos Críticos
              </h2>
              <Link to="/riesgos" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {criticalRisks.slice(0, 4).map((risk) => (
                <div key={risk.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <span className="text-xl">{risk.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{risk.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{risk.category}</p>
                  </div>
                  <RiskBadge level={risk.level} />
                </div>
              ))}
            </div>
          </div>

          {/* Pending actions */}
          <div className="card-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <ListTodo size={16} className="text-primary" />
                Acciones Pendientes
              </h2>
              <Link to="/acciones" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver todas <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {pendingActions.slice(0, 4).map((action) => {
                const priorityColors: Record<string, string> = {
                  crítica: "text-danger",
                  alta: "text-risk-high",
                  media: "text-risk-medium",
                  baja: "text-success",
                };
                return (
                  <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${action.priority === "crítica" ? "bg-danger animate-pulse" : action.priority === "alta" ? "bg-risk-high" : "bg-risk-medium"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">{action.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs font-medium ${priorityColors[action.priority]}`}>
                          {action.priority}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={10} />
                          {action.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alerts banner */}
        <div className="card-glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              Alertas Recientes
            </h2>
            <Link to="/alertas" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver alertas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentAlerts.map((alert, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${alert.level === "alto" ? "bg-danger/5 border-danger/20" : "bg-warning/5 border-warning/20"}`}>
                <AlertTriangle size={14} className={alert.level === "alto" ? "text-danger shrink-0" : "text-warning shrink-0"} />
                <span className="text-sm text-foreground flex-1">{alert.text}</span>
                <span className="text-xs text-muted-foreground shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
