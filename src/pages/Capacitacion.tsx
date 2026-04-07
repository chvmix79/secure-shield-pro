import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";

// ... skipping to loadProgress
// Wait, I need to replace from line 1 to 143 to import useCallback? 
// No, I can just replace the import and then replace the function. By using multi_replace_file_content or doing it in two steps.

import { BookOpen, ShieldCheck, Lock, Mail, Wifi, Users, ArrowRight, CheckCircle2, Award, Clock, AlertCircle, FileText, Download, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/hooks/useEmpresa";

interface Module {
  id: string;
  icon: string;
  title: string;
  category: string;
  duration: number;
  level: string;
  description: string;
  tips: string[];
}

const defaultModules: Module[] = [
  {
    id: "intro",
    icon: "🎣",
    title: "¿Qué es el Phishing?",
    category: "Amenazas",
    duration: 5,
    level: "Básico",
    description: "Aprende a identificar correos falsos diseñados para robar tus contraseñas e información.",
    tips: [
      "Revisa siempre el dominio del remitente (no solo el nombre)",
      "Nunca hagas clic en enlaces sospechosos",
      "Llama directamente al banco o empresa si dudas",
    ],
  },
  {
    id: "passwords",
    icon: "🔑",
    title: "Contraseñas Seguras",
    category: "Fundamentos",
    duration: 4,
    level: "Básico",
    description: "Cómo crear y gestionar contraseñas fuertes que realmente protejan tus cuentas.",
    tips: [
      "Usa al menos 12 caracteres mezclando letras, números y símbolos",
      "Nunca reutilices contraseñas entre servicios",
      "Utiliza un gestor de contraseñas como Bitwarden o 1Password",
    ],
  },
  {
    id: "2fa",
    icon: "📱",
    title: "Doble Factor (2FA)",
    category: "Autenticación",
    duration: 6,
    level: "Básico",
    description: "La segunda capa de seguridad más importante que puedes activar hoy mismo.",
    tips: [
      "Activa 2FA en correo, redes sociales y banca",
      "Usa una app autenticadora (Google Authenticator, Authy)",
      "Guarda los códigos de recuperación en un lugar seguro",
    ],
  },
  {
    id: "backup",
    icon: "💾",
    title: "Backup y Recuperación",
    category: "Continuidad",
    duration: 7,
    level: "Intermedio",
    description: "Estrategia 3-2-1 para nunca perder información crítica de tu empresa.",
    tips: [
      "3 copias de datos, en 2 medios distintos, 1 fuera de la empresa",
      "Prueba la recuperación regularmente",
      "Automatiza los backups para no depender de la memoria",
    ],
  },
  {
    id: "ransomware",
    icon: "🦠",
    title: "Ransomware: cómo defenderte",
    category: "Amenazas",
    duration: 8,
    level: "Intermedio",
    description: "El ataque más devastador para las Pymes. Aprende a prevenirlo antes de que sea tarde.",
    tips: [
      "Mantén todos los sistemas actualizados",
      "Nunca descargues software de fuentes desconocidas",
      "Segmenta tu red para limitar la propagación",
    ],
  },
  {
    id: "wifi",
    icon: "📡",
    title: "Seguridad de Red WiFi",
    category: "Infraestructura",
    duration: 5,
    level: "Básico",
    description: "Configura tu red corporativa para evitar accesos no autorizados.",
    tips: [
      "Usa WPA3 o al menos WPA2 en tu router",
      "Crea una red separada para visitas e invitados",
      "Cambia las contraseñas por defecto del router",
    ],
  },
];

export default function Capacitacion() {
  const { empresa } = useEmpresa();
  const [modules] = useState<Module[]>(defaultModules);
  const [progress, setProgress] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const loadProgress = useCallback(async () => {
    if (!empresa?.id) return;
    setLoading(true);
    
    const { data } = await supabase
      .from('progreso_capacitacion')
      .select('*')
      .eq('empresa_id', empresa.id);
    
    if (data) {
      const progressMap = new Map<string, boolean>();
      data.forEach((p: { modulo_id: string; completado: boolean }) => {
        progressMap.set(p.modulo_id, p.completado);
      });
      setProgress(progressMap);
    }
    setLoading(false);
  }, [empresa?.id]);

  useEffect(() => {
    if (empresa?.id) {
      loadProgress();
    }
  }, [empresa?.id, loadProgress]);

  const markModuleComplete = async (moduleId: string) => {
    if (!empresa?.id) return;
    
    await supabase.from('progreso_capacitacion').upsert({
      empresa_id: empresa.id,
      modulo_id: moduleId,
      completado: true,
      completado_at: new Date().toISOString()
    }, { onConflict: 'empresa_id,modulo_id' });

    await loadProgress();
    
    const completedCount = Array.from(progress.values()).filter(Boolean).length + 1;
    if (completedCount === modules.length) {
      setShowCertificate(true);
    }
  };

  const completedCount = Array.from(progress.values()).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / modules.length) * 100);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="text-primary" />
              Centro de Capacitación
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Guías prácticas para proteger tu empresa sin necesitar ser experto
            </p>
          </div>
          <div className="card-glass rounded-xl px-4 py-2 text-right">
            <p className="text-lg font-bold text-primary">{progressPercent}%</p>
            <p className="text-xs text-muted-foreground">{completedCount}/{modules.length} completados</p>
          </div>
        </div>

        {/* Progress */}
        <Card className="card-glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                Tu progreso de aprendizaje
              </h2>
              <span className="text-sm font-bold text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5" />
            <p className="text-xs text-muted-foreground mt-2">
              {modules.length - completedCount} módulos pendientes · Tiempo estimado restante: {(modules.length - completedCount) * 6} min
            </p>
          </CardContent>
        </Card>

        {/* Module grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const isCompleted = progress.get(mod.id);
            return (
              <Card 
                key={mod.id} 
                className={`card-glass hover:border-primary/30 transition-all cursor-pointer ${isCompleted ? "border-success/50" : ""}`}
                onClick={() => setSelectedModule(mod)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-2xl">
                      {mod.icon}
                    </div>
                    {isCompleted ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle2 size={12} className="mr-1" />
                        Completado
                      </Badge>
                    ) : (
                      <Badge variant="outline">{mod.level}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-2">{mod.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-primary">{mod.category}</span>
                    <span className="text-xs text-muted-foreground">· {mod.duration} min</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{mod.description}</p>
                  
                  {!isCompleted && (
                    <Button 
                      className="w-full mt-4" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        markModuleComplete(mod.id);
                      }}
                    >
                      <Check size={14} className="mr-1" />
                      Marcar completado
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Certificate Dialog */}
        {showCertificate && (
          <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="text-warning" />
                  ¡Felicidades! Certificado Completado
                </DialogTitle>
              </DialogHeader>
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="py-6 text-center">
                  <Award size={64} className="mx-auto text-warning mb-4" />
                  <h3 className="text-xl font-bold mb-2">Certificado de Ciberseguridad</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {empresa?.nombre} ha completado exitosamente todos los módulos de capacitación en ciberseguridad.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg text-left text-sm">
                    <p><strong>Fecha de emisión:</strong> {new Date().toLocaleDateString('es-ES')}</p>
                    <p><strong>Módulos completados:</strong> {modules.length}</p>
                    <p><strong>Horas de capacitación:</strong> {modules.reduce((a, b) => a + b.duration, 0) / 60}h</p>
                  </div>
                  <Button className="mt-4 w-full">
                    <Download size={16} className="mr-2" />
                    Descargar Certificado
                  </Button>
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
        )}

        {/* Module Detail Dialog */}
        <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
          <DialogContent className="max-w-2xl">
            {selectedModule && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{selectedModule.icon}</span>
                    {selectedModule.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedModule.category}</Badge>
                    <Badge variant="outline">{selectedModule.duration} min</Badge>
                    <Badge variant="outline">{selectedModule.level}</Badge>
                  </div>
                  
                  <p className="text-muted-foreground">{selectedModule.description}</p>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-primary" />
                      Recomendaciones clave:
                    </h4>
                    <ul className="space-y-2">
                      {selectedModule.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {!progress.get(selectedModule.id) && (
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        markModuleComplete(selectedModule.id);
                        setSelectedModule(null);
                      }}
                    >
                      <Check size={16} className="mr-2" />
                      Marcar como completado
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Bottom CTA */}
        <Card className="card-glass">
          <CardContent className="py-6 text-center">
            <ShieldCheck size={32} className="mx-auto text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-2">¿Listo para evaluar tu aprendizaje?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Vuelve a hacer el diagnóstico y mide cómo han mejorado tus prácticas
            </p>
            <Link to="/diagnostico">
              <Button>
                Ir al diagnóstico
                <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
