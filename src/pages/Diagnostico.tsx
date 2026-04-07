import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { getQuestionsWithNormativas, calculateSecurityLevel } from "@/lib/cybersecurity-data";
import { diagnosticoService, accionService, alertaService } from "@/lib/services";
import { useEmpresa } from "@/hooks/useEmpresa";
import type { ActionPriority, ActionStatus } from "@/lib/database.types";
import { SecurityScoreWidget, RiskBadge } from "@/components/SecurityWidgets";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, ArrowLeft, RotateCcw, Loader2, Building2, FileDown, Shield, Award, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDiagnosticPDF } from "@/lib/pdf";

export default function Diagnostico() {
  const navigate = useNavigate();
  const { empresa, refresh } = useEmpresa();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);

  // Load existing diagnostic if ID is provided
  useEffect(() => {
    const diagId = searchParams.get("id");
    if (diagId) {
      setLoadingDiagnostic(true);
      diagnosticoService.getById(diagId).then((data) => {
        if (data) {
          setAnswers(data.respuestas);
          setStep("result");
        }
      }).catch(err => {
        console.error("Error loading diagnostic:", err);
      }).finally(() => {
        setLoadingDiagnostic(false);
      });
    }
  }, [searchParams]);

  const questions = useMemo(() => getQuestionsWithNormativas(), []);
  
  const totalQ = questions.length;
  const progress = ((currentQ + 1) / totalQ) * 100;
  const question = questions[currentQ];

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = totalQ * 10;
  const scorePercent = Math.round((totalScore / maxScore) * 100);
  const level = calculateSecurityLevel(scorePercent);
  
  const diagnosticoGuardado = {
    score: scorePercent,
    nivel: level.level,
    respuestas: answers,
    created_at: new Date().toISOString(),
  } as { id: string; empresa_id: string; score: number; nivel: "bajo" | "medio" | "alto" | "crítico"; respuestas: Record<string, number>; created_at: string };

  function handleAnswer(score: number) {
    setSelected(score);
  }

  async function handleNext() {
    if (selected === null) return;
    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ + 1 < totalQ) {
      setCurrentQ((p) => p + 1);
    } else {
      setSaving(true);
      try {
        const scorePercent = Math.round((Object.values(newAnswers).reduce((a, b) => a + b, 0) / (totalQ * 10)) * 100);
        const level = calculateSecurityLevel(scorePercent);
        
        const diagnostico = await diagnosticoService.create({
          empresa_id: empresa.id,
          score: scorePercent,
          nivel: level.level,
          respuestas: newAnswers,
        });

        // Auto-generación del Plan de Acción
        const accionesToInsert = [];
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
        
        for (const q of questions) {
          const s = newAnswers[q.id];
          if (s !== undefined && s < 10) {
            const prioridad: ActionPriority = s === 0 ? "alta" : "media";
            
            // Creamos un título basado en la categoría de la pregunta
            const tituloAction = `Revisar: ${q.category}`;
            
            // Usamos la descripción del ítem como la acción a realizar
            const descripcionAction = `Problema detectado en la evaluación: ${q.question}\n\nRequisito recomendado: ${q.description}`;
            
            accionesToInsert.push({
              empresa_id: empresa.id,
              diagnostico_id: diagnostico.id,
              titulo: tituloAction,
              descripcion: descripcionAction,
              prioridad,
              estado: "pendiente" as ActionStatus,
              responsable: "Equipo de Seguridad / IT",
              categoria: q.category,
              fecha_limite: thirtyDaysFromNow,
            });
          }
        }

        if (accionesToInsert.length > 0) {
          await accionService.createMany(accionesToInsert);
        }

        // Generar Alertas Críticas si el score es muy bajo
        if (scorePercent < 45) {
          await alertaService.create({
            empresa_id: empresa.id,
            titulo: "Score de Seguridad Crítico",
            descripcion: `Se ha detectado un nivel de seguridad muy bajo (${scorePercent}%) en el último diagnóstico. Se requiere atención inmediata.`,
            tipo: "error",
            leida: false
          });
        } else if (scorePercent < 70) {
          await alertaService.create({
            empresa_id: empresa.id,
            titulo: "Oportunidades de Mejora",
            descripcion: `El diagnóstico muestra un nivel de seguridad medio (${scorePercent}%). Revisa el plan de acción generado.`,
            tipo: "info",
            leida: false
          });
        }
        
        await refresh();
      } catch (error) {
        console.error('Error saving diagnostic:', error);
      } finally {
        setSaving(false);
        setStep("result");
      }
    }
  }

  function handleBack() {
    if (currentQ > 0) {
      setCurrentQ((p) => p - 1);
      setSelected(answers[questions[currentQ - 1].id] ?? null);
    }
  }

  function restart() {
    setAnswers({});
    setCurrentQ(0);
    setSelected(null);
    setStep("quiz");
  }

  if (!empresa) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 max-w-md mx-auto animate-fade-in">
          <div className="card-glass rounded-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Building2 size={32} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Registra tu empresa</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Antes de hacer el diagnóstico, necesitamos conocer tu empresa para personalizar las preguntas.
              </p>
            </div>
            <Link to="/empresa">
              <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
                Registrar mi empresa
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (saving || loadingDiagnostic) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">
              {loadingDiagnostic ? "Cargando diagnóstico..." : "Procesando resultados y plan de acción..."}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-3xl mx-auto animate-fade-in">
        {/* Intro */}
        {step === "intro" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Diagnóstico de Ciberseguridad</h1>
              <p className="text-muted-foreground mt-1">Evalúa el nivel de seguridad de tu empresa en minutos</p>
            </div>

            <div className="card-glass rounded-xl p-8 text-center space-y-6">
              <div className="text-5xl">🔍</div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">¿Qué tan segura es tu empresa?</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Responde {totalQ} preguntas sencillas y en menos de 5 minutos sabrás exactamente
                  cuáles son tus riesgos y qué hacer primero.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                {[
                  { icon: "⏱️", label: "5 minutos", sub: "de duración" },
                  { icon: "🎯", label: `${totalQ} preguntas`, sub: "simples" },
                  { icon: "📊", label: "Reporte", sub: "inmediato" },
                ].map(({ icon, label, sub }) => (
                  <div key={label} className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-xl mb-1">{icon}</div>
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setStep("quiz")}
                size="lg"
                className="bg-primary text-primary-foreground hover:opacity-90 gap-2 px-8"
              >
                Comenzar diagnóstico
                <ArrowRight size={18} />
              </Button>
            </div>

            {/* Categories */}
            <div className="card-glass rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Áreas que evaluamos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {questions.map((q) => (
                  <div key={q.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{q.icon}</span>
                    <span>{q.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz */}
        {step === "quiz" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">Diagnóstico en curso</h1>
                <p className="text-sm text-muted-foreground">Pregunta {currentQ + 1} de {totalQ}</p>
              </div>
              <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Question card */}
            <div className="card-glass rounded-xl p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl shrink-0">
                  {question.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">{question.category}</div>
                  <h2 className="text-lg font-semibold text-foreground leading-snug">{question.question}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {question.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option.score)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-150",
                      selected === option.score
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-muted/40 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                        selected === option.score ? "border-primary bg-primary" : "border-border"
                      )}>
                        {selected === option.score && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm leading-snug">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentQ === 0}
                  className="gap-2 border-border text-muted-foreground"
                >
                  <ArrowLeft size={16} />
                  Anterior
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={selected === null}
                  className="bg-primary text-primary-foreground hover:opacity-90 gap-2"
                >
                  {currentQ + 1 === totalQ ? "Ver resultados" : "Siguiente"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {step === "result" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resultados del Diagnóstico</h1>
              <p className="text-sm text-muted-foreground">Completado · {new Date().toLocaleDateString("es-ES")}</p>
            </div>

            {/* Score card */}
            <div className="card-glass rounded-xl p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <SecurityScoreWidget score={scorePercent} />
                <div className="flex-1 text-center sm:text-left">
                  <div className="mb-2">
                    <RiskBadge level={level.level} size="md" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mt-2 mb-2">Nivel: {level.label}</h2>
                  <p className="text-muted-foreground text-sm">{level.description}</p>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[
                      { label: "Score obtenido", value: `${scorePercent}/100` },
                      { label: "Áreas evaluadas", value: `${totalQ}` },
                      { label: "Puntos a mejorar", value: `${100 - scorePercent}` },
                      { label: "Riesgos detectados", value: `${scorePercent < 50 ? 5 : 3}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-muted/50 rounded-lg p-3">
                        <p className="text-lg font-bold text-foreground">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Per-category results */}
            <div className="card-glass rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Detalle por área</h3>
              <div className="space-y-3">
                {questions.map((q) => {
                  const s = answers[q.id] ?? 0;
                  const pct = (s / 10) * 100;
                  const color = pct >= 70 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-danger";
                  const textColor = pct >= 70 ? "text-success" : pct >= 40 ? "text-warning" : "text-danger";
                  return (
                    <div key={q.id}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-foreground flex items-center gap-2">
                          <span>{q.icon}</span> {q.category}
                        </span>
                        <span className={`font-semibold ${textColor} flex items-center gap-1`}>
                          {pct >= 70 ? <CheckCircle2 size={12} /> : null}
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {empresa && (
                <Button
                  onClick={() => generateDiagnosticPDF(diagnosticoGuardado, empresa, [])}
                  variant="outline"
                  className="flex-1 border-border text-foreground gap-2"
                >
                  <FileDown size={16} />
                  Exportar PDF
                </Button>
              )}
              <Button
                onClick={() => navigate("/riesgos")}
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90 gap-2"
              >
                Ver riesgos detectados
                <ArrowRight size={16} />
              </Button>
              <Button
                onClick={() => navigate("/acciones")}
                variant="outline"
                className="flex-1 border-border text-foreground gap-2"
              >
                Ver plan de acción
                <ArrowRight size={16} />
              </Button>
              <Button
                onClick={restart}
                variant="outline"
                className="border-border text-muted-foreground gap-2"
              >
                <RotateCcw size={16} />
                Repetir
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
