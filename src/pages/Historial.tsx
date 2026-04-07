import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { diagnosticoService } from "@/lib/services";
import { useEmpresa } from "@/hooks/useEmpresa";
import { calculateSecurityLevel } from "@/lib/cybersecurity-data";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, TrendingUp, TrendingDown, Minus, FileText, Calendar, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Historial() {
  const { empresa, diagnostico: diagnosticoActual } = useEmpresa();
  const [diagnosticos, setDiagnosticos] = useState<{ id: string; score: number; created_at: string; respuestas?: Record<string, number> }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiagnosticos() {
      if (!empresa?.id) return;
      try {
        const data = await diagnosticoService.getByEmpresa(empresa.id);
        setDiagnosticos(data || []);
      } catch (error) {
        console.error('Error loading diagnosticos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDiagnosticos();
  }, [empresa?.id]);

  const getTrend = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    const diff = current - previous;
    if (diff > 0) return { icon: TrendingUp, color: "text-success", label: `+${diff}%` };
    if (diff < 0) return { icon: TrendingDown, color: "text-danger", label: `${diff}%` };
    return { icon: Minus, color: "text-muted-foreground", label: "Sin cambio" };
  };

  if (!empresa) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 max-w-md mx-auto animate-fade-in">
          <div className="card-glass rounded-xl p-8 text-center space-y-6">
            <FileText size={40} className="mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Sin empresa registrada</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Registra tu empresa para ver el historial de diagnósticos.
              </p>
            </div>
            <Link to="/empresa">
              <Button className="bg-primary text-primary-foreground">Registrar empresa</Button>
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
            <h1 className="text-2xl font-bold text-foreground">Historial de Diagnósticos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Evolución de la seguridad de tu empresa
            </p>
          </div>
          <Link to="/diagnostico">
            <Button className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
              Nuevo diagnóstico
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando...</div>
        ) : diagnosticos.length === 0 ? (
          <div className="card-glass rounded-xl p-12 text-center">
            <FileText size={40} className="mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Sin diagnósticos aún</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Realiza tu primer diagnóstico para comenzar a monitorear tu seguridad.
            </p>
            <Link to="/diagnostico">
              <Button className="bg-primary text-primary-foreground">Hacer diagnóstico</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {diagnosticos.map((d, index) => {
              const securityInfo = calculateSecurityLevel(d.score);
              const prevScore = diagnosticos[index + 1]?.score;
              const trend = getTrend(d.score, prevScore);
              const TrendIcon = trend?.icon || Minus;

              return (
                <div
                  key={d.id}
                  className={cn(
                    "card-glass rounded-xl p-5 border transition-all hover:border-primary/30",
                    d.id === diagnosticoActual?.id && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold",
                        securityInfo.level === 'bajo' ? "bg-success/20 text-success" :
                        securityInfo.level === 'medio' ? "bg-warning/20 text-warning" :
                        "bg-danger/20 text-danger"
                      )}>
                        {d.score}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{securityInfo.label}</h3>
                          {d.id === diagnosticoActual?.id && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                              Actual
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar size={14} />
                          {new Date(d.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {trend && (
                      <div className={cn("flex items-center gap-1", trend.color)}>
                        <TrendIcon size={16} />
                        <span className="text-sm font-medium">{trend.label}</span>
                      </div>
                    )}
                    
                    <Link to={`/diagnostico?id=${d.id}`}>
                        <Button variant="ghost" size="sm" className="ml-4 h-8 text-xs gap-1 border border-border">
                            Ver Detalle
                            <Eye size={12} />
                        </Button>
                    </Link>
                  </div>

                  {d.respuestas && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(d.respuestas).slice(0, 4).map(([cat, score]) => (
                          <div key={cat}>
                            <p className="text-xs text-muted-foreground">{cat}</p>
                            <p className={cn(
                              "text-sm font-semibold",
                              (score as number) >= 7 ? "text-success" :
                              (score as number) >= 4 ? "text-warning" : "text-danger"
                            )}>
                              {(score as number) * 10}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
