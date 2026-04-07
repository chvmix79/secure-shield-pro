import { useState, useEffect } from "react";
import { AlertTriangle, ShieldCheck, Mail, MousePointer, Eye, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function PhishingFeedback() {
  const [step, setStep] = useState(1);
  const [scared, setScared] = useState(true);

  useEffect(() => {
    // Después de 3 segundos, mostramos el mensaje de "es solo una prueba"
    const timer = setTimeout(() => {
      setScared(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (scared) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white animate-pulse">
        <AlertTriangle size={80} className="text-risk-high mb-6 animate-bounce" />
        <h1 className="text-4xl font-bold mb-4">⚠️ ACCESO DENEGADO</h1>
        <p className="text-xl text-center max-w-md text-gray-400">
          Tu cuenta ha sido comprometida. Se ha detectado una descarga sospechosa de datos corporativos desde tu sesión.
        </p>
        <div className="mt-12 w-full max-w-xs space-y-2">
          <p className="text-xs text-center text-gray-600">Rastreando origen...</p>
          <Progress value={65} className="h-1 bg-gray-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col items-center justify-center animate-fade-in">
      <div className="max-w-2xl w-full space-y-8 uppercase-tracking">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 text-success mb-2">
            <ShieldCheck size={48} />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success to-primary">
            ¡Tranquilo, es una prueba!
          </h1>
          <p className="text-muted-foreground text-lg">
            Esto ha sido una **simulación programada** por el departamento de seguridad de tu empresa.
          </p>
        </div>

        <Card className="card-glass border-primary/20 bg-primary/5 overflow-hidden">
          <CardHeader className="bg-primary/10 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="text-primary" />
              ¿Por qué estás aquí?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-lg bg-risk-high/10 text-risk-high flex items-center justify-center">
                <MousePointer size={24} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">Hiciste clic en un enlace sospechoso</p>
                <p className="text-sm text-muted-foreground">
                  En un escenario real, un atacante podría haber robado tus credenciales de acceso 
                  o instalado malware en tu equipo con solo ese clic.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background/50 border border-dashed border-primary/30 space-y-4">
              <p className="text-sm font-bold flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                Cómo detectar este ataque en el futuro:
              </p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {[
                  "Revisa que el correo del remitente sea el correcto.",
                  "Desconfía de mensajes que causan urgencia o miedo.",
                  "Pasa el mouse sobre el link sin hacer clic para ver la URL real.",
                  "Nunca entregues contraseñas en sitios web que abran por email."
                ].map((tip, i) => (
                  <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="group" asChild>
            <a href="/">
              Volver al Inicio
              <ChevronRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button className="bg-primary hover:bg-primary/90" asChild>
            <a href="/capacitacion">
              Ir a Capacitación de Seguridad
            </a>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          ID de Simulación: {Math.random().toString(36).substring(7).toUpperCase()} • 
          Fecha: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
