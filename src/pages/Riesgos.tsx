import { AppLayout } from "@/components/AppLayout";
import { mockRisks } from "@/lib/cybersecurity-data";
import { RiskBadge } from "@/components/SecurityWidgets";
import { Link } from "react-router-dom";
import { ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const levelOrder = { crítico: 0, alto: 1, medio: 2, bajo: 3 };

export default function Riesgos() {
  const [filter, setFilter] = useState<string>("todos");

  const filtered = mockRisks
    .filter((r) => filter === "todos" || r.level === filter)
    .sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  const counts = {
    todos: mockRisks.length,
    crítico: mockRisks.filter((r) => r.level === "crítico").length,
    alto: mockRisks.filter((r) => r.level === "alto").length,
    medio: mockRisks.filter((r) => r.level === "medio").length,
    bajo: mockRisks.filter((r) => r.level === "bajo").length,
  };

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

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Áreas afectadas:</p>
                <div className="flex flex-wrap gap-1">
                  {risk.affected.map((a) => (
                    <span key={a} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                      {a}
                    </span>
                  ))}
                </div>
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
