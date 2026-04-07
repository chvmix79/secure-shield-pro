import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { empresaService } from "@/lib/services";
import { useEmpresa } from "@/hooks/useEmpresa";
import { Building2, Users, Monitor, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sectores = [
  { id: "tecnologia", label: "Tecnología", icon: "💻", desc: "Software, desarrollo, IT" },
  { id: "comercio", label: "Comercio", icon: "🛒", desc: "Tiendas, e-commerce, retail" },
  { id: "salud", label: "Salud", icon: "🏥", desc: "Clínicas, consultorios, hospitales" },
  { id: "educacion", label: "Educación", icon: "📚", desc: "Colegios, universidades, academias" },
  { id: "industria", label: "Industria", icon: "🏭", desc: "Manufactura, producción, fábricas" },
  { id: "servicios", label: "Servicios", icon: "💼", desc: "Consultoría, contabilidad, legales" },
  { id: "restaurante", label: "Restaurantes", icon: "🍽️", desc: "Restaurantes, cafeterías, food truck" },
  { id: "transporte", label: "Transporte", icon: "🚚", desc: "Logística, mudanzas, taxi" },
];

const empleados = [
  { value: "1-5", label: "1-5 empleados" },
  { value: "6-10", label: "6-10 empleados" },
  { value: "11-50", label: "11-50 empleados" },
  { value: "51-200", label: "51-200 empleados" },
  { value: "200+", label: "Más de 200 empleados" },
];

const nivelesTech = [
  { value: "bajo", label: "Bajo", desc: "Mínima tecnología" },
  { value: "medio", label: "Medio", desc: "Tecnología básica" },
  { value: "alto", label: "Alto", desc: "Alta digitalización" },
];

export default function Empresa() {
  const navigate = useNavigate();
  const { refresh } = useEmpresa();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"sector" | "info" | "listo">("sector");
  const [empresa, setEmpresa] = useState({
    nombre: "",
    sector: "",
    empleados: "",
    nivel_tech: "",
    email: "",
  });

  async function handleSubmit() {
    if (!empresa.nombre || !empresa.sector || !empresa.empleados || !empresa.nivel_tech || !empresa.email) return;
    
    setLoading(true);
    try {
      const newEmpresa = await empresaService.create({
        nombre: empresa.nombre,
        sector: empresa.sector,
        empleados: empresa.empleados,
        nivel_tech: empresa.nivel_tech as "bajo" | "medio" | "alto",
        email: empresa.email,
      });
      
      localStorage.setItem("empresa_id", newEmpresa.id);
      await refresh();
      setStep("listo");
      
      setTimeout(() => {
        navigate("/diagnostico");
      }, 1500);
    } catch (error) {
      console.error('Error creating empresa:', error);
    } finally {
      setLoading(false);
    }
  }

  if (step === "listo") {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 max-w-md mx-auto animate-fade-in">
          <div className="card-glass rounded-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">¡Empresa registrada!</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Ahora puedes realizar el diagnóstico de ciberseguridad
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-2xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Registra tu Empresa</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura tu empresa para personalizar el diagnóstico de seguridad
          </p>
        </div>

        {step === "sector" && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">¿Qué tipo de empresa tienes?</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sectores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setEmpresa({ ...empresa, sector: s.id })}
                    className={cn(
                      "card-glass rounded-xl p-4 text-center border transition-all",
                      empresa.sector === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <p className="text-xs font-medium text-foreground">{s.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep("info")}
              disabled={!empresa.sector}
              className="w-full bg-primary text-primary-foreground hover:opacity-90 gap-2"
            >
              Continuar
              <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {step === "info" && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Nombre de la empresa</label>
              <input
                type="text"
                value={empresa.nombre}
                onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })}
                placeholder="Ej: Mi Empresa S.A.S"
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Correo electrónico</label>
              <input
                type="email"
                value={empresa.email}
                onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                placeholder="contacto@miempresa.com"
                className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">¿Cuántos empleados tienes?</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {empleados.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => setEmpresa({ ...empresa, empleados: e.value })}
                    className={cn(
                      "px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                      empresa.empleados === e.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Nivel de tecnología</label>
              <div className="grid grid-cols-3 gap-3">
                {nivelesTech.map((n) => (
                  <button
                    key={n.value}
                    onClick={() => setEmpresa({ ...empresa, nivel_tech: n.value })}
                    className={cn(
                      "card-glass rounded-xl p-4 text-center border transition-all",
                      empresa.nivel_tech === n.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    )}
                  >
                    <Monitor size={24} className={cn("mx-auto mb-2", empresa.nivel_tech === n.value ? "text-primary" : "text-muted-foreground")} />
                    <p className="text-xs font-medium text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("sector")}
                className="border-border text-muted-foreground"
              >
                Atrás
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!empresa.nombre || !empresa.email || loading}
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Registrar empresa
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
