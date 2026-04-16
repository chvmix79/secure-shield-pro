import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useEmpresa } from "@/hooks/useEmpresa";
import { suscripcionService, PLANES } from "@/lib/suscripcion";
import { pagoService, informacionPago } from "@/lib/pago";
import type { PlanType } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Crown, Zap, Building2, Loader2, CreditCard, Banknote, Smartphone, FileText, Upload, ArrowLeft, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function Planes() {
  const navigate = useNavigate();
  const { empresa, refresh } = useEmpresa();
  const [planActual, setPlanActual] = useState<PlanType>(empresa?.plan || 'free');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [metodoPago, setMetodoPago] = useState<string>('transferencia');
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  const loadPlan = useCallback(async () => {
    if (!empresa?.id) {
      setLoading(false);
      return;
    }
    try {
      const plan = await suscripcionService.getPlan(empresa.id);
      setPlanActual(plan);
    } catch (error) {
      console.error("Error cargando plan:", error);
    } finally {
      setLoading(false);
    }
  }, [empresa?.id]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  async function handlePayment() {
    if (!empresa?.id || !selectedPlan) return;
    setEnviandoSolicitud(true);
    try {
      const ciclo = isAnnual ? 'anual' : 'mensual';
      const monto = pagoService.getMontoPorPlan(selectedPlan, ciclo);
      await pagoService.crearSolicitud({
        empresa_id: empresa.id,
        plan: selectedPlan,
        metodo: metodoPago as 'transferencia' | 'nequi',
        monto,
        ciclo,
      });
      alert(`Solicitud enviada para plan ${PLANES[selectedPlan].nombre} (${ciclo}). Te contactaremos para confirmar el pago.`);
      setShowPayment(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error("Error enviando solicitud:", error);
      alert("Error al enviar la solicitud");
    } finally {
      setEnviandoSolicitud(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </AppLayout>
    );
  }

  if (showPayment && selectedPlan) {
    const ciclo = isAnnual ? 'anual' : 'mensual';
    const monto = pagoService.getMontoPorPlan(selectedPlan, ciclo);
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
          <button 
            onClick={() => setShowPayment(false)} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} /> Volver a planes
          </button>
          
          <div className="card-glass rounded-xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">Pagar Plan {PLANES[selectedPlan].nombre}</h2>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monto a pagar ({ciclo})</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-primary">${monto.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">COP</span>
                </div>
              </div>
              <div className="bg-primary/20 text-primary border border-primary/30 rounded-full px-3 py-1 text-xs font-bold">
                {ciclo === 'anual' ? 'Anual (Ahorro)' : 'Mensual'}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-foreground uppercase tracking-wider">Método de pago</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMetodoPago('transferencia')}
                  className={cn(
                    "p-5 rounded-xl border-2 text-left transition-all hover:shadow-lg",
                    metodoPago === 'transferencia' ? "border-primary bg-primary/5 shadow-primary/10" : "border-border bg-card/50 hover:border-primary/40"
                  )}
                >
                  <Banknote size={28} className={cn("mb-3", metodoPago === 'transferencia' ? "text-primary" : "text-muted-foreground")} />
                  <div className="text-sm font-bold text-foreground">Transferencia</div>
                  <div className="text-xs text-muted-foreground">Cualquier banco</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoPago('nequi')}
                  className={cn(
                    "p-5 rounded-xl border-2 text-left transition-all hover:shadow-lg",
                    metodoPago === 'nequi' ? "border-primary bg-primary/5 shadow-primary/10" : "border-border bg-card/50 hover:border-primary/40"
                  )}
                >
                  <Smartphone size={28} className={cn("mb-3", metodoPago === 'nequi' ? "text-primary" : "text-muted-foreground")} />
                  <div className="text-sm font-bold text-foreground">Nequi</div>
                  <div className="text-xs text-muted-foreground">Desde tu App</div>
                </button>
              </div>
            </div>

            <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-white/5 space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Datos de Pago
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs uppercase font-medium">Banco</span>
                  <span className="text-foreground font-semibold">{informacionPago.banco}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs uppercase font-medium">NIT</span>
                  <span className="text-foreground font-semibold">{informacionPago.nit}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground block text-xs uppercase font-medium">Número de Cuenta</span>
                  <span className="text-foreground font-bold text-lg">{informacionPago.cuenta}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground block text-xs uppercase font-medium">Concepto</span>
                  <span className="text-foreground font-medium italic">Pago CHV Ciberdefensa - {empresa?.nombre}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start">
              <Shield size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                <strong>Verificación Manual:</strong> Al realizar el pago, procesaremos tu solicitud en un tiempo máximo de 24 horas. Recibirás una notificación por correo cuando el plan esté activo.
              </p>
            </div>

            <Button 
              onClick={handlePayment}
              disabled={enviandoSolicitud}
              className="w-full mt-8 py-7 text-lg font-bold shadow-xl shadow-primary/20"
            >
              {enviandoSolicitud ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <FileText size={20} className="mr-3" />
                  Enviar solicitud de pago
                </>
              )}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const planes = [
    { key: 'free' as PlanType, icon: Zap, color: 'bg-gray-500' },
    { key: 'basic' as PlanType, icon: Building2, color: 'bg-primary' },
    { key: 'pro' as PlanType, icon: Crown, color: 'bg-warning' },
  ];

  const featuresList = [
    { key: 'maxUsuarios', label: 'Usuarios', free: '1', basic: '3', pro: 'Ilimitados' },
    { key: 'diagnosticosIlimitados', label: 'Diagnósticos', free: '1/mes', basic: 'Ilimitados', pro: 'Ilimitados' },
    { key: 'moduloPhishing', label: 'Simulación Phishing', free: false, basic: true, pro: true },
    { key: 'moduloVulnerabilidades', label: 'Vulnerabilidades', free: false, basic: false, pro: true },
    { key: 'moduloMicrosoft365', label: 'Microsoft 365', free: false, basic: false, pro: true },
    { key: 'moduloChatIA', label: 'Chat IA Experto', free: false, basic: true, pro: true },
    { key: 'moduloDocumentos', label: 'Documentos Cumplimiento', free: false, basic: true, pro: true },
    { key: 'exportarPDF', label: 'Reportes PDF', free: false, basic: true, pro: true },
    { key: 'soportePrioritario', label: 'Soporte Prioritario', free: false, basic: false, pro: true },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-10 animate-fade-in max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-block bg-primary/10 text-primary py-1 px-4 text-xs font-bold uppercase tracking-wider mb-2 rounded-full">
            Planes y Precios
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight italic">Protege tu Empresa</h1>
          <p className="text-lg text-muted-foreground">
            Escala tu ciberseguridad según tus necesidades. Tu plan actual: 
            <span className="font-black text-primary ml-2 underline decoration-2 underline-offset-4 uppercase">{PLANES[planActual].nombre}</span>
          </p>

          {/* Toggle Mensual/Anual */}
          <div className="flex items-center justify-center mt-12 mb-4">
            <div className="bg-muted p-1 rounded-full flex items-center shadow-inner gap-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
                  !isAnnual ? "bg-white dark:bg-card text-primary shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mensual
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  isAnnual ? "bg-white dark:bg-card text-primary shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Anual
                <span className="bg-green-500/20 text-green-600 text-[10px] py-0.5 px-2 rounded-full font-black animate-pulse">
                  AHORRA 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Planes Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {planes.map(({ key, icon: Icon, color }) => {
            const plan = PLANES[key];
            const isCurrent = planActual === key;
            const precio = isAnnual ? plan.precio_anual : plan.precio;
            
            return (
              <div
                key={key}
                className={cn(
                  "card-glass rounded-3xl p-8 flex flex-col transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border border-white/5",
                  isCurrent && "border-primary/50 ring-2 ring-primary/20 bg-primary/5",
                  key === 'pro' && "relative md:scale-105 z-10 border-warning/30 bg-warning/5"
                )}
              >
                {key === 'pro' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-warning to-amber-600 text-white text-[10px] font-black rounded-full shadow-xl tracking-widest uppercase">
                    RECOMENDADO
                  </div>
                )}
                
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl", color)}>
                  <Icon size={28} className="text-white" />
                </div>
                
                <h3 className="text-2xl font-black text-foreground mb-2">{plan.nombre}</h3>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">${precio.toLocaleString()}</span>
                  <span className="text-muted-foreground font-medium">/{isAnnual ? 'año' : 'mes'}</span>
                </div>
                
                <div className="flex-1 space-y-4 mb-10">
                  {featuresList.map((f) => {
                    const valor = f[key as PlanType];
                    const esTrue = valor === true;
                    const esFalse = valor === false;
                    
                    return (
                      <div key={f.key} className="flex items-start gap-3 text-sm">
                        {esTrue ? (
                          <div className="bg-green-500/20 p-0.5 rounded shadow-sm shrink-0 mt-0.5">
                            <Check size={14} className="text-green-600" />
                          </div>
                        ) : esFalse ? (
                          <div className="bg-muted p-0.5 rounded shrink-0 mt-0.5 opacity-50">
                            <X size={14} className="text-muted-foreground" />
                          </div>
                        ) : (
                          <span className={cn("font-bold shrink-0 min-w-[2.5rem] text-center", isCurrent ? "text-primary" : "text-muted-foreground")}>
                            {valor}
                          </span>
                        )}
                        <span className={cn(esFalse ? "text-muted-foreground/60 line-through" : "text-foreground font-medium")}>
                          {f.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {isCurrent ? (
                  <Button disabled className="w-full h-14 rounded-2xl bg-muted/50 text-muted-foreground font-bold border-none">
                    Plan actual activo
                  </Button>
                ) : key === 'free' ? (
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-2xl font-bold border-2"
                  >
                    Disponible gratis
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      setSelectedPlan(key);
                      setShowPayment(true);
                    }}
                    className={cn(
                      "w-full h-14 rounded-2xl font-black text-lg transition-transform active:scale-95 shadow-xl", 
                      key === 'pro' ? "bg-warning hover:bg-warning/90 shadow-warning/20" : "bg-primary hover:bg-primary/90 shadow-primary/20"
                    )}
                  >
                    Contratar {plan.nombre}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Info adicional */}
        <div className="max-w-3xl mx-auto mt-20">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <h3 className="font-black text-primary mb-2 flex items-center gap-2">
                <Banknote size={18} /> Facturación Flexible
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Elige facturación mensual para mayor flexibilidad o anual para obtener un <strong>20% de ahorro directo</strong> en tu inversión de seguridad.
              </p>
            </div>
            <div className="bg-warning/5 p-6 rounded-2xl border border-warning/10">
              <h3 className="font-black text-warning mb-2 flex items-center gap-2">
                <Shield size={18} /> Seguridad Garantizada
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tus datos de pago están seguros. Una vez verifiquemos tu transacción, el acceso a los módulos se activa en menos de 24 horas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}