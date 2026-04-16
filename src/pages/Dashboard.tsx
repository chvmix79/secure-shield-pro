import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { SecurityScoreWidget, RiskBadge } from "@/components/SecurityWidgets";
import { calculateSecurityLevel } from "@/lib/cybersecurity-data";
import { useEmpresa } from "@/hooks/useEmpresa";
import { diagnosticoService } from "@/lib/services";
import { SecurityTrendChart, ActionsStatusChart, CategoryScoreChart, ScoreEvolutionChart } from "@/components/DashboardCharts";
import { ShieldCheck, AlertTriangle, ListTodo, CheckCircle2, Clock, ArrowRight, TrendingUp, Zap, FileText, BookOpen, Target, Download, Bug, Cloud, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { generateSecurityReport } from "@/lib/reportService";
import { scoreHistoryService, vulnerabilidadService, documentoService, microsoft365Service, phishingService } from "@/lib/services";
import { cn } from "@/lib/utils";

interface DocumentStats {
  total: number;
  actualizados: number;
  pendiente: number;
  faltantes: number;
}

interface TrainingStats {
  total: number;
  completados: number;
}

import { DocumentoCumplimiento, Vulnerabilidad, ScoreHistory } from "@/lib/database.types";
import { toast } from "sonner";
import { suscripcionService, EstadoSuscripcion, PLANES } from "@/lib/suscripcion";
import { Lock, History, Calendar } from "lucide-react";

export default function Dashboard() {
  const { empresa, diagnostico, acciones, alertas, loading } = useEmpresa();
  const [diagnosticos, setDiagnosticos] = useState<{ score: number }[]>([]);
  const [docStats, setDocStats] = useState<DocumentStats>({ total: 15, actualizados: 3, pendiente: 5, faltantes: 7 });
  const [trainingStats, setTrainingStats] = useState<TrainingStats>({ total: 6, completados: 0 });
  const [vulnerabilidades, setVulnerabilidades] = useState<Vulnerabilidad[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [m365Audit, setM365Audit] = useState<any>(null);
  const [phishingStats, setPhishingStats] = useState<any[]>([]);
  const [plan, setPlan] = useState<string>('free');
  const [estadoSuscripcion, setEstadoSuscripcion] = useState<EstadoSuscripcion | null>(null);

  useEffect(() => {
    async function loadDiagnosticos() {
      if (!empresa?.id) return;
      const data = await diagnosticoService.getByEmpresa(empresa.id);
      setDiagnosticos(data || []);
      
      // Get current plan and state
      const e = await suscripcionService.getEstadoSuscripcion(empresa.id);
      setEstadoSuscripcion(e);
      setPlan(e.plan);
    }
    loadDiagnosticos();
  }, [empresa?.id]);

  useEffect(() => {
    async function loadDynamicStats() {
      if (!empresa?.id) return;
      
      try {
        const [docsResult, docs, history, vulns, m365, phishing] = await Promise.all([
          supabase.from('progreso_capacitacion').select('modulo_id, completado, usuarios!inner(empresa_id)').eq('usuarios.empresa_id', empresa.id).catch(() => ({ data: [] })),
          documentoService.getByEmpresa(empresa.id).catch(() => []),
          scoreHistoryService.getByEmpresa(empresa.id).catch(() => []),
          vulnerabilidadService.getByEmpresa(empresa.id).catch(() => []),
          microsoft365Service.getAuditStatus(empresa.id).catch(() => null),
          phishingService.getCampañas(empresa.id).catch(() => [])
        ]);
        
        if (docsResult.data) {
          setTrainingStats({
            total: 6,
            completados: docsResult.data.filter((d: { completado: boolean }) => d.completado).length
          });
        }
        
        if (docs) {
          setDocStats({
            total: docs.length || 15,
            actualizados: docs.filter(d => d.estado === 'actualizado').length,
            pendiente: docs.filter(d => d.estado === 'pendiente').length,
            faltantes: docs.filter(d => d.estado === 'faltante' || d.estado === 'obsoleto').length
          });
        }

        setScoreHistory(history || []);
        setVulnerabilidades(vulns || []);
        setM365Audit(m365);
        setPhishingStats(phishing || []);
      } catch (error) {
        console.error("Error loading dynamic stats:", error);
      }
    }
    loadDynamicStats();
  }, [empresa?.id]);
  
  const pendingActions = acciones.filter((a) => a.estado === "pendiente" || a.estado === "vencida");
  const completedActions = acciones.filter((a) => a.estado === "completada");
  const inProgressActions = acciones.filter((a) => a.estado === "en_progreso");
  
  // CÁLCULO DE SCORE DE SEGURIDAD
  // El score base es el resultado del último diagnóstico (lo que el usuario espera ver)
  const baseScore = diagnostico?.score ?? 0;
  
  // El progreso de implementación mide cuánto se ha avanzado en el plan de acción, capacitación y documentos
  const totalAcciones = acciones.length || 1;
  const implementationProgress = Math.round(
    ((completedActions.length / totalAcciones) * 40) + // 40% peso acciones
    ((trainingStats.completados / (trainingStats.total || 1)) * 30) + // 30% peso capacitación
    ((docStats.actualizados / (docStats.total || 1)) * 30) // 30% peso documentos
  );

  const docProgress = Math.round((docStats.actualizados / (docStats.total || 1)) * 100);
  
  // El score final mostrado es el del diagnóstico actual
  const score = baseScore;
  const securityInfo = calculateSecurityLevel(score);
  
  const riesgosDetectados = diagnostico ? Object.entries(diagnostico.respuestas || {})
    .filter(([_, v]) => (v as number) < 7).length : 0;
  const riesgosCriticos = diagnostico ? Object.entries(diagnostico.respuestas || {})
    .filter(([_, v]) => (v as number) < 2).length : 0;

  const stats = [
    {
      label: "Riesgos Detectados",
      value: diagnostico ? riesgosDetectados.toString() : "0",
      sub: diagnostico ? `${riesgosCriticos} requieren atención` : "Sin diagnóstico",
      icon: AlertTriangle,
      color: "text-risk-high",
      bg: "bg-danger/10 border-danger/20",
      to: "/riesgos",
    },
    {
      label: "Acciones Completadas",
      value: completedActions.length.toString(),
      sub: `de ${acciones.length} totales`,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10 border-success/20",
      to: "/acciones",
    },
    {
      label: "Documentos OK",
      value: docStats.actualizados.toString(),
      sub: `de ${docStats.total} (${docProgress}%)`,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
      to: "/documentos",
    },
    {
      label: "Capacitación",
      value: trainingStats.completados.toString(),
      sub: `de ${trainingStats.total} módulos`,
      icon: BookOpen,
      color: "text-warning",
      bg: "bg-warning/10 border-warning/20",
      to: "/capacitacion",
    },
  ];

  const recentAlerts = alertas
    .filter(a => !a.leida)
    .slice(0, 3)
    .map(alert => ({
      text: alert.titulo,
      level: alert.tipo === 'critical' || alert.tipo === 'error' ? "alto" : "medio",
      time: new Date(alert.created_at).toLocaleDateString('es-ES')
    }));

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tablero Central | Evidence Shield Sys</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {empresa?.nombre || 'Cargando...'} · {empresa?.sector || 'Empresa'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={diagnostico ? `/diagnostico?id=${diagnostico.id}` : "/diagnostico"}>
              <Button className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
                <Zap size={16} />
                {diagnostico ? 'Ver Diagnóstico' : 'Nuevo Diagnóstico'}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                if (empresa && diagnostico) {
                  // Map categories for report
                  const modulos = Object.entries(diagnostico.respuestas || {}).map(([key, val]) => ({
                    nombre: key,
                    actual: (val as number) * 10,
                    objetivo: 100
                  }));

                  generateSecurityReport(
                    empresa.nombre,
                    score,
                    modulos,
                    acciones,
                    vulnerabilidades
                  );
                }
              }}
            >
              <Download size={16} />
              Reporte Ejecutivo
            </Button>
          </div>
        </div>

        {/* Score + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Score circle */}
          <div className="lg:col-span-1 card-glass rounded-xl p-6 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <TooltipProvider>
                <Badge variant="outline" className="text-[9px] cursor-help">Score Diagnóstico</Badge>
              </TooltipProvider>
            </div>
            <SecurityScoreWidget score={score} />
            <div className="w-full mt-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-muted-foreground uppercase font-bold">Implementación</span>
                <span className="text-primary font-bold">{implementationProgress}%</span>
              </div>
              <Progress value={implementationProgress} className="h-1" />
            </div>
            <Link 
              to={diagnostico ? `/diagnostico?id=${diagnostico.id}` : "/diagnostico"} 
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              Ver diagnóstico completo <ArrowRight size={12} />
            </Link>
          </div>

            {/* Right side container - takes 4 columns on desktop */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Subscription Status Card */}
              <div className="card-glass overflow-hidden border-primary/20 bg-primary/5 transition-all hover:shadow-xl group rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 p-2.5 rounded-xl text-primary group-hover:scale-110 transition-transform">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">Plan {PLANES[plan as keyof typeof PLANES]?.nombre || plan}</h3>
                      <Badge variant="outline" className={cn(
                        "text-[10px] uppercase font-black px-2 py-0",
                        estadoSuscripcion?.diasRestantes !== undefined && estadoSuscripcion.diasRestantes <= 0 ? "border-danger text-danger bg-danger/5" : 
                        estadoSuscripcion?.diasRestantes !== undefined && estadoSuscripcion.diasRestantes <= 5 ? "border-warning text-warning bg-warning/5" : "border-primary/30 text-primary bg-primary/5"
                      )}>
                        {estadoSuscripcion?.diasRestantes !== undefined && estadoSuscripcion.diasRestantes <= 0 ? "Vencido" : "Activo"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar size={12} /> 
                      Vence: {estadoSuscripcion?.fecha_fin ? new Date(estadoSuscripcion.fecha_fin).toLocaleDateString() : 'N/A'} 
                      {estadoSuscripcion?.diasRestantes !== undefined && (
                        <span className="font-bold ml-1">
                          ({estadoSuscripcion.diasRestantes <= 0 ? "Periodo de gracia" : `${estadoSuscripcion.diasRestantes} días restantes`})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Link to="/planes">
                  <Button size="sm" className="font-black uppercase tracking-tighter shadow-lg shadow-primary/20">
                    Gestionar Plan
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>

        {/* Charts section */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Evolución del Score - Gated */}
          {plan !== 'free' ? (
            <div className="card-glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  Evolución del Score
                </h2>
                <Badge variant="outline" className="text-[10px]">Plan de Pago</Badge>
              </div>
              <div className="h-64">
                <ScoreEvolutionChart history={scoreHistory} />
              </div>
            </div>
          ) : (
            <div className="card-glass rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-4">
              <History size={48} className="text-muted-foreground opacity-20" />
              <div>
                <h3 className="font-bold">Historial de Seguridad</h3>
                <p className="text-xs text-muted-foreground max-w-[200px]">Disponible en planes Básico y Profesional</p>
              </div>
              <Link to="/planes">
                <Button size="sm" variant="outline" className="text-[10px]">Actualizar Plan</Button>
              </Link>
            </div>
          )}

          {/* Category Scores */}
          <div className="card-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Target size={16} className="text-primary" />
                Estado por Categoría
              </h2>
            </div>
            {diagnostico ? (
              <div className="h-64">
                <CategoryScoreChart diagnostico={diagnostico} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Sin diagnóstico disponible
              </div>
            )}
          </div>
        </div>

        {/* Vulnerabilities & Actions Grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Vulnerabilidades Críticas - Gated */}
          <div className="lg:col-span-1 card-glass rounded-xl p-5 border-l-4 border-l-risk-high">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Bug size={16} className="text-risk-high" />
                Vulnerabilidades
              </h2>
              {plan !== 'free' && (
                <Badge variant="destructive" className="animate-pulse">{vulnerabilidades.filter(v => v.estado === 'abierta').length}</Badge>
              )}
            </div>
            {plan !== 'free' ? (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                {vulnerabilidades.length > 0 ? (
                  vulnerabilidades.map(v => (
                    <div key={v.id} className="p-3 rounded-lg bg-muted/30 border border-muted-foreground/10 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold truncate">{v.titulo}</span>
                        <Badge className={cn(
                          v.severidad === 'crítica' ? 'bg-risk-high' :
                          v.severidad === 'alta' ? 'bg-orange-500' : 'bg-warning'
                        )}>{v.severidad}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{v.descripcion}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-center">
                    <ShieldCheck size={32} className="text-success mb-2 opacity-20" />
                    <p className="text-xs text-muted-foreground">No se detectaron vulnerabilidades críticas abiertas.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                <Lock size={24} className="text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground px-4">Análisis de vulnerabilidades disponible en planes empresariales.</p>
                <Link to="/planes">
                  <Button variant="ghost" size="sm" className="text-[10px] h-7">Ver Planes</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Actions Status */}
          <div className="lg:col-span-2 card-glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                Estado de Implementación de Controles
              </h2>
            </div>
            <div className="h-64">
              <ActionsStatusChart 
                completed={completedActions.length}
                inProgress={inProgressActions.length}
                pending={pendingActions.length}
              />
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Acciones Progress */}
          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target size={16} className="text-primary" />
                Progreso de Acciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-success">Completadas</span>
                  <span className="font-medium">{completedActions.length}</span>
                </div>
                <Progress value={(completedActions.length / (acciones.length || 1)) * 100} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-warning">En proceso</span>
                  <span className="font-medium">{inProgressActions.length}</span>
                </div>
                <Progress value={(inProgressActions.length / (acciones.length || 1)) * 100} className="h-2" variant="warning" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pendientes</span>
                  <span className="font-medium">{pendingActions.length}</span>
                </div>
                <Progress value={(pendingActions.length / (acciones.length || 1)) * 100} className="h-2" variant="destructive" />
              </div>
            </CardContent>
          </Card>

          {/* Cumplimiento Docs */}
          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-success">Actualizados</span>
                  <span className="font-medium">{docStats.actualizados}/{docStats.total}</span>
                </div>
                <Progress value={(docStats.actualizados / docStats.total) * 100} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-warning">Pendientes</span>
                  <span className="font-medium">{docStats.pendiente}</span>
                </div>
                <Progress value={(docStats.pendiente / docStats.total) * 100} className="h-2" variant="warning" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-risk-high">Faltantes</span>
                  <span className="font-medium">{docStats.faltantes}</span>
                </div>
                <Progress value={(docStats.faltantes / docStats.total) * 100} className="h-2" variant="destructive" />
              </div>
            </CardContent>
          </Card>

          {/* Capacitación */}
          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                Capacitación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-success">Completados</span>
                  <span className="font-medium">{trainingStats.completados}/{trainingStats.total}</span>
                </div>
                <Progress value={(trainingStats.completados / trainingStats.total) * 100} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pendientes</span>
                  <span className="font-medium">{trainingStats.total - trainingStats.completados}</span>
                </div>
                <Progress value={((trainingStats.total - trainingStats.completados) / trainingStats.total) * 100} className="h-2" />
              </div>
              
              <Link to="/capacitacion">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ir a Capacitación
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Secciones Enterprise - Gated by Plan */}
          {plan !== 'free' && (
            <>
              {/* Score History Chart */}
              <div className="lg:col-span-2">
                <ScoreEvolutionChart history={scoreHistory} />
              </div>

              {/* Integración Cloud (M365) */}
              <Card className={`${m365Audit?.issues?.length > 0 ? 'border-orange-500/30' : ''} card-glass`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cloud size={16} className="text-blue-400" />
                    Microsoft 365 Audit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Estado conexión</span>
                      <Badge variant="outline" className="text-success border-success/30 bg-success/5">Conectado</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Alertas de Auditoría</span>
                      <span className="font-bold text-orange-500">{m365Audit?.issues?.length || 0}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {m365Audit?.issues?.slice(0, 2).map((issue: any) => (
                        <div key={issue.id} className="text-[10px] bg-muted/30 p-1.5 rounded truncate">
                          ⚠️ {issue.title}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">
                    Ver Reporte Cloud
                  </Button>
                </CardContent>
              </Card>

              {/* Phishing Simulator */}
              <Card className="card-glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe size={16} className="text-purple-400" />
                    Phishing Simulator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Campañas</span>
                      <span className="font-medium">{phishingStats.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-risk-high">Tasa de clics</span>
                      <span className="font-medium">12.5%</span>
                    </div>
                    <Progress value={12.5} className="h-2" variant="destructive" />
                    <p className="text-[10px] text-muted-foreground italic text-center">Tasa promedio industria: 18%</p>
                  </div>
                  <Link to="/phishing">
                    <Button variant="outline" size="sm" className="w-full mt-4 border-purple-500/20 text-purple-400 hover:bg-purple-500/10">
                      Gestionar Campañas
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent alerts */}
        {recentAlerts.length > 0 && (
          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle size={16} className="text-warning" />
                Alertas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentAlerts.map((alert, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.level === "alto" ? "destructive" : "secondary"}>
                        {alert.level}
                      </Badge>
                      <span className="text-sm">{alert.text}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                ))}
              </div>
              <Link to="/alertas">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ver todas las alertas
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}