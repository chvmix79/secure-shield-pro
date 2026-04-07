import { AppLayout } from "@/components/AppLayout";
import { RiskBadge } from "@/components/SecurityWidgets";
import { getQuestionsWithNormativas } from "@/lib/cybersecurity-data";
import { useEmpresa } from "@/hooks/useEmpresa";
import { Link } from "react-router-dom";
import { ArrowRight, Filter, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

const levelOrder = { crítico: 0, alto: 1, medio: 2, bajo: 3 };

const categoryIcons: Record<string, string> = {
  "Contraseñas": "🔑",
  "Autenticación": "📱",
  "Antivirus": "🛡️",
  "Backups": "💾",
  "Correo Electrónico": "📧",
  "Capacitación": "📚",
  "Redes": "📡",
  "Actualizaciones": "🔄",
  "Datos de Pacientes": "🏥",
  "Cumplimiento": "📋",
  "Desarrollo Seguro": "⚙️",
  "Infraestructura": "☁️",
  "Pagos": "💳",
  "Datos de Clientes": "👥",
  "SCADA/ICS": "🏭",
  "Seguridad Física": "🔒",
  "Datos de Estudiantes": "🎓",
  "Acceso de Usuarios": "🎫",
};

function getRiskLevel(score: number): "bajo" | "medio" | "alto" | "crítico" {
  if (score >= 7) return "bajo";
  if (score >= 4) return "medio";
  if (score >= 2) return "alto";
  return "crítico";
}

function getRiskDescription(category: string, score: number): string {
  const descriptions: Record<string, { bajo: string; medio: string; alto: string; crítico: string }> = {
    "Contraseñas": {
      bajo: "Política de contraseñas sólida implementada",
      medio: "Algunas debilidades en la política de contraseñas",
      alto: "Contraseñas débiles o sin política formal",
      crítico: "Sin control de contraseñas - riesgo crítico",
    },
    "Autenticación": {
      bajo: "Doble factor de autenticación activo",
      medio: "2FA en algunos sistemas",
      alto: "Sin 2FA en sistemas críticos",
      crítico: "Sin autenticación robusta",
    },
    "Antivirus": {
      bajo: "Todos los equipos protegidos",
      medio: "Protección parcial",
      alto: "Equipos sin protección",
      crítico: "Sin antivirus - vulnerable a malware",
    },
    "Backups": {
      bajo: "Backups automáticos configurados",
      medio: "Backups manuales o irregulares",
      alto: "Sin estrategia de backup",
      crítico: "Riesgo de pérdida total de datos",
    },
    "Correo Electrónico": {
      bajo: "Correo corporativo con filtros",
      medio: "Mix de correo corporativo y personal",
      alto: "Predominio de correos personales",
      crítico: "Sin control de correo empresarial",
    },
    "Capacitación": {
      bajo: "Capacitación regular",
      medio: "Capacitación esporádica",
      alto: "Sin capacitación formal",
      crítico: "Empleados vulnerables a ataques",
    },
    "Redes": {
      bajo: "Redes segmentadas y seguras",
      medio: "Red básica con contraseña",
      alto: "Red sin protección adecuada",
      crítico: "Red completamente expuesta",
    },
    "Actualizaciones": {
      bajo: "Actualizaciones automáticas activas",
      medio: "Actualizaciones manuales",
      alto: "Sistemas desactualizados",
      crítico: "Sistemas vulnerables sin parches",
    },
  };
  
  const level = getRiskLevel(score);
  return descriptions[category]?.[level] || `Nivel de seguridad: ${score}/10`;
}

export default function Riesgos() {
  const { diagnostico, empresa } = useEmpresa();
  const [filter, setFilter] = useState<string>("todos");

  const questions = useMemo(() => getQuestionsWithNormativas(), []);

  const risks = diagnostico?.respuestas 
    ? Object.entries(diagnostico.respuestas)
        .filter(([_, score]) => (score as number) < 10)
        .map(([qId, score]) => {
          const q = questions.find(q => q.id === qId);
          const category = q?.category || "General";
          return {
            id: qId,
            name: q?.question || "Riesgo detectado",
            category: category,
            level: getRiskLevel(score as number),
            description: getRiskDescription(category, score as number),
            icon: q?.icon || "⚠️",
            affected: q?.category ? [q.category] : ["General"],
            score: score as number,
          };
        })
    : [];

  const filtered = risks
    .filter((r) => filter === "todos" || r.level === filter)
    .sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  const counts = {
    todos: risks.length,
    crítico: risks.filter((r) => r.level === "crítico").length,
    alto: risks.filter((r) => r.level === "alto").length,
    medio: risks.filter((r) => r.level === "medio").length,
    bajo: risks.filter((r) => r.level === "bajo").length,
  };

  if (risks.length === 0) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
          <div className="text-center max-w-md mx-auto p-8 card-glass rounded-2xl border-dashed border-2 border-primary/20">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Aún no hay riesgos detectados</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              El panel de riesgos se alimenta automáticamente de las respuestas de tu diagnóstico de ciberseguridad. 
              Completa la evaluación inicial para descubrir el estado de tus controles.
            </p>
            <Link to="/diagnostico">
              <Button size="lg" className="w-full gap-2 shadow-lg hover:shadow-primary/25 transition-all">
                Ir al Diagnóstico Inicial
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Riesgos Identificados</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Detectados automáticamente basados en tu diagnóstico
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <span className="text-sm text-muted-foreground">{counts.alto + counts.crítico} riesgos críticos</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: "todos", label: "Total", color: "text-foreground", bg: "bg-muted/50 border-border" },
            { key: "alto", label: "Alto", color: "text-risk-high", bg: "bg-danger/5 border-danger/20" },
            { key: "medio", label: "Medio", color: "text-risk-medium", bg: "bg-warning/5 border-warning/20" },
            { key: "bajo", label: "Bajo", color: "text-success", bg: "bg-success/5 border-success/20" },
          ].map(({ key, label, color, bg }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`card-glass rounded-xl p-4 text-left border transition-all ${filter === key ? "border-primary" : bg}`}
            >
              <p className={`text-2xl font-bold ${color}`}>{counts[key as keyof typeof counts]}</p>
              <p className="text-xs text-muted-foreground mt-1">Riesgo {label}</p>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter size={14} className="text-muted-foreground shrink-0" />
          {["todos", "alto", "medio", "bajo"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Risk cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((risk) => (
            <div key={risk.id} className={`card-glass rounded-xl p-5 border transition-all hover:border-primary/30 ${
              risk.level === "alto" || risk.level === "crítico" ? "border-danger/20" : "border-border"
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-2xl">
                  {risk.icon}
                </div>
                <RiskBadge level={risk.level} />
              </div>

              <h3 className="font-semibold text-foreground mb-1">{risk.name}</h3>
              <p className="text-xs text-primary mb-2 font-medium">{risk.category}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{risk.description}</p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Áreas afectadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {risk.affected.map((a) => (
                      <span key={a} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Link to={`/marketplace?search=${risk.category}`}>
                  <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1 border border-primary/20 mt-2">
                    Ver solución en Marketplace
                    <ArrowRight size={12} />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link to="/acciones">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
              Ver plan de acción para estos riesgos
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
