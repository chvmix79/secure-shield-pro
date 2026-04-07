import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Mail, AlertTriangle, CheckCircle2, XCircle, MousePointer, Eye, EyeOff, Send, Users, BarChart3, RefreshCw, Calendar, Play, Pause, Clock, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/hooks/useEmpresa";
import { toast } from "sonner";

interface ProgramaPhishing {
  id: string;
  nombre: string;
  descripcion: string;
  frecuencia: string;
  proxima_envio: string | null;
  estado: string;
  total_enviados: number;
  total_clics: number;
  total_reportados: number;
}

interface CampañaPhishing {
  id: string;
  nombre: string;
  fecha_envio: string | null;
  total_enviados: number;
  total_clics: number;
  total_reportados: number;
  estado: 'pendiente' | 'en_progreso' | 'completada';
}

interface PhishingEmail {
  id: number;
  sender: string;
  subject: string;
  body: string;
  isPhishing: boolean;
  difficulty: "easy" | "medium" | "hard";
  redFlags: string[];
  clicked?: boolean;
  reported?: boolean;
}

const phishingEmails: PhishingEmail[] = [
  {
    id: 1,
    sender: "soporte@bancopopular-seguro.com",
    subject: "⚠️ Alerta: Su cuenta ha sido bloqueada",
    body: "Estimado cliente, hemos detectado actividad sospechosa en su cuenta. Por favor verifique su identidad inmediatamente haciendo clic en el siguiente enlace para evitar el bloqueo definitivo de su cuenta.",
    isPhishing: true,
    difficulty: "easy",
    redFlags: [
      "Dominio falso (bancopopular-seguro.com)",
      "Urgencia y amenaza",
      "Solicita hacer clic en enlace",
      "Saludo genérico",
    ],
  },
  {
    id: 2,
    sender: "recursos.humanos@tuempresa.com",
    subject: "Recordatorio: Encuesta de satisfacción laboral Q1",
    body: "Hola equipo, Les recordamos que la encuesta de satisfacción laboral del primer trimestre cierra este viernes. Es匿名 y toma solo 5 minutos. Gracias por su participación.",
    isPhishing: false,
    difficulty: "medium",
    redFlags: [],
  },
  {
    id: 3,
    sender: "amazon@confirmacion-pedido.xyz",
    subject: "Tu pedido #2847-3921 ha sido confirmado",
    body: "Gracias por tu compra. Tu pedido ha sido confirmado y será enviado en 24 horas. Para rastrear tu pedido, haz clic aquí: confirmar-envio.xyz/track/2847",
    isPhishing: true,
    difficulty: "medium",
    redFlags: [
      "Dominio falso (.xyz)",
      "Enlace sospechoso",
      "Diseño genérico",
    ],
  },
  {
    id: 4,
    sender: "it@tuempresa.com",
    subject: "Mantenimiento programado de servidores",
    body: "Estimados colaboradores, Se realizará mantenimiento en los servidores este sábado de 2:00 a 6:00 AM. Los servicios pueden experimentar interrupciones temporales. No se requiere acción de su parte.",
    isPhishing: false,
    difficulty: "hard",
    redFlags: [],
  },
  {
    id: 5,
    sender: "facturacion@proveedor-urgente.net",
    subject: "Factura vencida - Acción requerida",
    body: "Su factura #5521 por $1,250.00 ha vencido. Tiene 24 horas para realizar el pago antes de suspender el servicio. Pago inmediato: pagar-ahora.net/factura/5521",
    isPhishing: true,
    difficulty: "hard",
    redFlags: [
      "Urgencia extrema (24 horas)",
      "Amenaza de servicio",
      "Dominio desconocido",
      "Monto específico para presionar",
    ],
  },
];

export default function PhishingSimulations() {
  const { empresa } = useEmpresa();
  const [currentEmail, setCurrentEmail] = useState<PhishingEmail | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; email: PhishingEmail } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [programas, setProgramas] = useState<ProgramaPhishing[]>([]);
  const [campañas, setCampañas] = useState<CampañaPhishing[]>([]);
  const [newPrograma, setNewPrograma] = useState({ nombre: "", descripcion: "", frecuencia: "mensual" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!empresa?.id) return;
    setLoading(true);
    try {
      // Cargar programas
      const { data: progs } = await supabase
        .from('programas_phishing')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false });
      if (progs) setProgramas(progs);

      // Cargar campañas
      const { data: camps } = await supabase
        .from('campanas_phishing')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false });
      if (camps) setCampañas(camps);
    } catch (error) {
      console.error('Error loading phishing data:', error);
    }
    setLoading(false);
  }, [empresa?.id]);

  useEffect(() => {
    if (empresa?.id) {
      loadData();
    }
  }, [empresa?.id, loadData]);

  const createPrograma = async () => {
    if (!empresa?.id) return;
    setLoading(true);
    
    try {
      const proximaEnvio = new Date();
      if (newPrograma.frecuencia === 'semanal') proximaEnvio.setDate(proximaEnvio.getDate() + 7);
      else if (newPrograma.frecuencia === 'mensual') proximaEnvio.setMonth(proximaEnvio.getMonth() + 1);
      else if (newPrograma.frecuencia === 'trimestral') proximaEnvio.setMonth(proximaEnvio.getMonth() + 3);

      await supabase.from('programas_phishing').insert({
        empresa_id: empresa.id,
        nombre: newPrograma.nombre,
        descripcion: newPrograma.descripcion,
        frecuencia: newPrograma.frecuencia,
        proxima_envio: proximaEnvio.toISOString(),
        estado: 'activo'
      });

      setNewPrograma({ nombre: "", descripcion: "", frecuencia: "mensual" });
      setDialogOpen(false);
      loadData();
      toast.success("Programa creado correctamente");
    } catch (error) {
      toast.error("Error al crear el programa");
    }
    setLoading(false);
  };

  const handleLaunchCampaign = async (nombre: string) => {
    if (!empresa?.id) return;
    setLoading(true);
    try {
      // 1. Crear la campaña en estado pendiente
      const { data: camp, error: campError } = await supabase
        .from('campanas_phishing')
        .insert({
          empresa_id: empresa.id,
          nombre: `Simulación: ${nombre}`,
          estado: 'pendiente'
        })
        .select()
        .single();

      if (campError) throw campError;

      // 2. Llamar a la Edge Function para enviarla
      const { data, error } = await supabase.functions.invoke('send-phishing', {
        body: { campaña_id: camp.id }
      });

      if (error) throw error;

      toast.success(`Simulación lanzada a ${data.sent} empleados`);
      loadData();
    } catch (error) {
      console.error("Error launching campaign:", error);
      toast.error("Error al lanzar la simulación técnica");
    }
    setLoading(false);
  };

  const toggleProgramaEstado = async (id: string, actual: string) => {
    const nuevoEstado = actual === 'activo' ? 'pausado' : 'activo';
    await supabase.from('programas_phishing').update({ estado: nuevoEstado }).eq('id', id);
    loadData();
  };

  const startExercise = () => {
    const randomEmail = phishingEmails[Math.floor(Math.random() * phishingEmails.length)];
    setCurrentEmail(randomEmail);
    setShowResult(false);
    setResult(null);
  };

  const handleAnswer = (isPhishing: boolean) => {
    if (!currentEmail) return;
    const correct = isPhishing === currentEmail.isPhishing;
    setResult({ correct, email: currentEmail });
    setShowResult(true);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Mail className="text-primary" />
              Simulaciones de Phishing
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Entrena a tus empleados para identificar correos maliciosos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle2 size={14} className="mr-1" />
              {accuracy}% Accuracy
            </Badge>
            <Badge variant="outline">
              {score.correct}/{score.total} correctas
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="ejercicios" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ejercicios">Ejercicios IA</TabsTrigger>
            <TabsTrigger value="campañas">Programas</TabsTrigger>
            <TabsTrigger value="resultados">Resultados Reales</TabsTrigger>
          </TabsList>

          <TabsContent value="ejercicios" className="space-y-4">
            {!currentEmail ? (
              <Card className="card-glass">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Mail size={40} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ejercicio de Autoprotección</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    Te mostraremos correos electrónicos realistas. Tu objetivo es decidir si el mensaje es una amenaza o es seguro.
                  </p>
                  <Button onClick={startExercise} className="bg-primary hover:bg-primary/90">
                    <Send size={16} className="mr-2" />
                    Iniciar Desafío
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="card-glass lg:col-span-2">
                  <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-mono">ENVIADO POR:</p>
                        <p className="font-semibold text-primary">{currentEmail.sender}</p>
                      </div>
                      <Badge variant="outline">{currentEmail.difficulty.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm font-medium mt-3">Asunto: {currentEmail.subject}</p>
                  </CardHeader>
                  <CardContent className="pt-6 font-serif leading-relaxed">
                    <p className="whitespace-pre-wrap">{currentEmail.body}</p>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {!showResult ? (
                    <Card className="card-glass border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-base">Tu decisión:</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button onClick={() => handleAnswer(true)} className="w-full bg-risk-high hover:bg-risk-high/90 text-white font-bold py-6">
                          <AlertTriangle size={18} className="mr-2" />
                          ¡ES PHISHING!
                        </Button>
                        <Button onClick={() => handleAnswer(false)} className="w-full bg-success/80 hover:bg-success text-white py-6">
                          <CheckCircle2 size={18} className="mr-2" />
                          Parece Legítimo
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className={cn("card-glass border-2", result?.correct ? "border-success/50" : "border-risk-high/50")}>
                      <CardHeader>
                        <CardTitle className={cn("flex items-center gap-2", result?.correct ? "text-success" : "text-risk-high")}>
                          {result?.correct ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                          {result?.correct ? "¡Bien hecho!" : "¡Cuidado!"}
                        </CardTitle>
                        <CardDescription>
                          El correo era un intento de {result?.email.isPhishing ? "PHISHING" : "COMUNICACIÓN REAL"}.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {result?.email.isPhishing && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase text-muted-foreground">Señales ignoradas:</p>
                            {result.email.redFlags.map((flag, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded bg-risk-high/5 text-risk-high text-xs">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                {flag}
                              </div>
                            ))}
                          </div>
                        )}
                        <Button onClick={startExercise} className="w-full" variant="outline">
                          <RefreshCw size={16} className="mr-2" />
                          Otro Ejercicio
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="campañas" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Programas de Entrenamiento</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Send size={16} className="mr-2" />
                    Nuevo Programa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar Simulación Recurrente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Nombre del programa</Label>
                      <Input 
                        value={newPrograma.nombre}
                        onChange={(e) => setNewPrograma({...newPrograma, nombre: e.target.value})}
                        placeholder="ej. Phishing Mensual RRHH"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frecuencia de envío automático</Label>
                      <Select value={newPrograma.frecuencia} onValueChange={(v) => setNewPrograma({...newPrograma, frecuencia: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semanal">Cada semana</SelectItem>
                          <SelectItem value="mensual">Cada mes</SelectItem>
                          <SelectItem value="trimestral">Cada 3 meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={createPrograma} disabled={!newPrograma.nombre || loading}>
                        {loading ? 'Creando...' : 'Guardar Programa'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {programas.map((prog) => (
                <Card key={prog.id} className="card-glass border-primary/10 overflow-hidden">
                  <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
                    <div className="p-6 md:w-2/3 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold">{prog.nombre}</h3>
                          <p className="text-sm text-muted-foreground">Frecuencia: <span className="capitalize">{prog.frecuencia}</span></p>
                        </div>
                        <Badge variant={prog.estado === 'activo' ? 'default' : 'secondary'} className={cn("capitalize", prog.estado === 'activo' && "bg-success hover:bg-success/80 text-white border-transparent")}>
                          {prog.estado}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-8 py-4">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold">Enviados</p>
                          <p className="text-2xl font-bold">{prog.total_enviados}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold">Clics</p>
                          <p className="text-2xl font-bold text-risk-high">{prog.total_clics}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold">Reportes</p>
                          <p className="text-2xl font-bold text-success">{prog.total_reportados}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant={prog.estado === 'activo' ? 'outline' : 'default'}
                          onClick={() => toggleProgramaEstado(prog.id, prog.estado)}
                        >
                          {prog.estado === 'activo' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                          {prog.estado === 'activo' ? 'Pausar' : 'Activar'}
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => handleLaunchCampaign(prog.nombre)}
                          disabled={loading}
                        >
                          <Rocket className="mr-2 h-4 w-4" />
                          Lanzar Simulación Ahora
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 md:w-1/3 bg-primary/5 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <BarChart3 size={16} className="text-primary" />
                        Historial Rápido
                      </div>
                      <div className="space-y-3">
                        {campañas.slice(0, 3).map((camp) => (
                          <div key={camp.id} className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="truncate max-w-[120px] font-medium">{camp.nombre}</span>
                              <span className="text-muted-foreground">{camp.fecha_envio ? new Date(camp.fecha_envio).toLocaleDateString() : 'Pendiente'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={camp.total_enviados > 0 ? (camp.total_clics / camp.total_enviados) * 100 : 0} className="h-1 flex-1" />
                              <span className="text-risk-high font-bold">{camp.total_clics} clics</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {programas.length === 0 && !loading && (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                  <Mail size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground">No has configurado ningún programa de entrenamiento.</p>
                  <Button variant="link" onClick={() => setDialogOpen(true)}>Crea el primero ahora</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resultados" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="card-glass border-risk-high/20 bg-risk-high/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <MousePointer className="text-risk-high" />
                    <div>
                      <p className="text-2xl font-bold text-risk-high">
                        {programas.reduce((acc, p) => acc + p.total_clics, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Total de Clics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-glass border-success/20 bg-success/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-success" />
                    <div>
                      <p className="text-2xl font-bold text-success">
                        {programas.reduce((acc, p) => acc + p.total_reportados, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Total Reportados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-glass shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {programas.reduce((acc, p) => acc + p.total_enviados, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Alcance Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-glass border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="text-primary" />
                    <div>
                      <p className="text-2xl font-bold">
                        {programas.reduce((acc, p) => acc + p.total_enviados, 0) > 0 
                          ? Math.round((programas.reduce((acc, p) => acc + p.total_clics, 0) / programas.reduce((acc, p) => acc + p.total_enviados, 0)) * 100)
                          : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Tasa de Clics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="card-glass border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar size={18} />
                    Últimas Campañas Ejecutadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campañas.length > 0 ? campañas.map((camp) => (
                      <div key={camp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold truncate max-w-[200px]">{camp.nombre}</p>
                          <p className="text-[10px] text-muted-foreground">{camp.fecha_envio ? new Date(camp.fecha_envio).toLocaleString() : 'Pendiente'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs font-bold text-risk-high">{camp.total_clics} clics</p>
                            <p className="text-[10px] text-muted-foreground">{camp.total_enviados} enviados</p>
                          </div>
                          <Badge variant={camp.estado === 'completada' ? 'default' : 'outline'} className="text-[10px]">
                            {camp.estado === 'en_progreso' ? 'EJECUTANDO' : camp.estado.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-center text-muted-foreground py-8">No hay resultados registrados todavía.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle size={18} className="text-warning" />
                    Análisis de Vulnerabilidad Humana
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-risk-high/5 border border-risk-high/20">
                    <p className="text-sm font-bold text-risk-high mb-1">Riesgo Detectado</p>
                    <p className="text-xs text-muted-foreground">
                      Tu tasa de clics actual es superior al promedio de la industria ({programas.reduce((acc, p) => acc + p.total_enviados, 0) > 0 
                          ? Math.round((programas.reduce((acc, p) => acc + p.total_clics, 0) / programas.reduce((acc, p) => acc + p.total_enviados, 0)) * 100)
                          : 0}% vs 4%). Se recomienda lanzar un módulo intensivo de capacitación.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Detección de enlaces sospechosos", value: 45 },
                      { label: "Verificación de remitente", value: 30 },
                      { label: "Reporte de incidentes", value: 65 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-muted-foreground">{item.value}% CAPACITADO</span>
                        </div>
                        <Progress value={item.value} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/capacitacion">Mejorar Capacitación</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
