import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import cyberShield from "@/assets/cyber-shield.png";
import { ShieldCheck, AlertTriangle, ListChecks, FolderOpen, ArrowRight, CheckCircle2, Users, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ShieldCheck,
    title: "Diagnóstico Inteligente",
    description: "Cuestionario guiado que evalúa tu seguridad en minutos. Sin términos técnicos.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: AlertTriangle,
    title: "Detección de Riesgos",
    description: "Identifica automáticamente phishing, ransomware, fugas de datos y más.",
    color: "text-risk-medium",
    bg: "bg-risk-medium border-risk-medium",
  },
  {
    icon: ListChecks,
    title: "Plan de Acción",
    description: "Acciones concretas y priorizadas para resolver cada vulnerabilidad.",
    color: "text-success",
    bg: "bg-success/10 border-success/20",
  },
  {
    icon: FolderOpen,
    title: "Gestión de Evidencias",
    description: "Sube pruebas de implementación y lleva un registro de tu progreso.",
    color: "text-risk-high",
    bg: "bg-danger/10 border-danger/20",
  },
];

const benefits = [
  "Sin conocimientos técnicos requeridos",
  "Resultados en menos de 10 minutos",
  "Acciones paso a paso sin jerga técnica",
  "Dashboard de mejora en tiempo real",
  "Alertas ante riesgos críticos",
  "Exporta reportes en PDF",
];

const sectors = ["Retail", "Salud", "Finanzas", "Educación", "Manufactura", "Servicios"];

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <img src={cyberShield} alt="CiberSegura" width={32} height={32} className="drop-shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
          <span className="font-bold text-lg text-foreground">CiberSegura<span className="text-primary">Pymes</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#caracteristicas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Características</a>
          <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Beneficios</a>
          <a href="#sectores" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sectores</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground">
              Iniciar sesión
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90">
              Empezar gratis
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-background/75" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in-up">
              <Zap size={14} />
              Ciberseguridad práctica para pequeñas y medianas empresas
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in-up leading-tight">
              Protege tu empresa sin ser
              <span className="block text-transparent bg-clip-text bg-gradient-primary">
                experto en tecnología
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up">
              Evalúa tu nivel de seguridad, detecta riesgos digitales y aplica acciones concretas.
              Guiado, automático y diseñado para empresas reales.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Link to="/dashboard">
                <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 gap-2 px-8 py-4 text-base font-semibold glow-primary">
                  Evaluar mi empresa gratis
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/diagnostico">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted px-8 py-4 text-base">
                  Ver diagnóstico
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <span>Sin tarjeta requerida</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <span>Resultados en 10 min</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <span>Más de 500 empresas protegidas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating stats */}
        <div className="absolute bottom-12 left-8 hidden lg:block animate-float">
          <div className="card-glass rounded-xl px-4 py-3">
            <div className="text-2xl font-bold text-success">87%</div>
            <div className="text-xs text-muted-foreground">Reducción de riesgos</div>
          </div>
        </div>
        <div className="absolute bottom-24 right-8 hidden lg:block animate-float" style={{ animationDelay: "1s" }}>
          <div className="card-glass rounded-xl px-4 py-3">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-warning fill-warning" />
              <Star size={12} className="text-warning fill-warning" />
              <Star size={12} className="text-warning fill-warning" />
              <Star size={12} className="text-warning fill-warning" />
              <Star size={12} className="text-warning fill-warning" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">+200 reseñas</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="caracteristicas" className="py-24 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas para protegerte
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Una plataforma completa que guía a tu empresa paso a paso
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="card-glass rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${bg}`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">¿Cómo funciona?</h2>
            <p className="text-muted-foreground text-lg">3 pasos para estar protegido</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { num: "01", title: "Responde el diagnóstico", desc: "8 preguntas sencillas sobre tu empresa. Sin tecnicismos, sin complicaciones.", icon: "📋" },
              { num: "02", title: "Recibe tu análisis", desc: "El sistema calcula tu score de seguridad e identifica los riesgos específicos de tu empresa.", icon: "🔍" },
              { num: "03", title: "Actúa con tu plan", desc: "Acciones concretas, priorizadas y asignadas. Ve mejorando tu seguridad semana a semana.", icon: "🚀" },
            ].map(({ num, title, desc, icon }) => (
              <div key={num} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-2xl">
                  {icon}
                </div>
                <div className="text-xs font-bold text-primary mb-2 tracking-widest">{num}</div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/diagnostico">
              <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 gap-2">
                Iniciar diagnóstico ahora
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-24 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Diseñado para empresas<br />
                <span className="text-primary">no técnicas</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                No necesitas un departamento de TI. CiberSeguraPymes traduce la ciberseguridad
                al lenguaje de los negocios.
              </p>
              <div className="space-y-3">
                {benefits.map((b) => (
                  <div key={b} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-success shrink-0" />
                    <span className="text-sm text-foreground">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground">Score de Seguridad</span>
                <span className="text-xs text-muted-foreground">TechPyme S.A.</span>
              </div>
              {[
                { label: "Contraseñas", pct: 75, color: "bg-success" },
                { label: "Backups", pct: 40, color: "bg-warning" },
                { label: "Antivirus", pct: 90, color: "bg-success" },
                { label: "Capacitación", pct: 20, color: "bg-danger" },
                { label: "Redes", pct: 60, color: "bg-warning" },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-medium">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section id="sectores" className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Para todos los sectores</h2>
          <p className="text-muted-foreground mb-10">Adaptado a la realidad de tu industria</p>
          <div className="flex flex-wrap justify-center gap-3">
            {sectors.map((s) => (
              <span key={s} className="px-5 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-default">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <img src={cyberShield} alt="" width={64} height={64} loading="lazy" className="mx-auto mb-6 drop-shadow-[0_0_12px_rgba(14,165,233,0.6)]" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Empieza a proteger tu empresa hoy
            </h2>
            <p className="text-muted-foreground mb-8">
              Diagnóstico gratuito. Sin instalación. Sin conocimientos técnicos.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 gap-2 px-10 py-4 text-base font-semibold glow-primary">
                <Users size={18} />
                Registrar mi empresa gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={cyberShield} alt="" width={24} height={24} loading="lazy" />
            <span className="text-sm text-muted-foreground">CiberSeguraPymes © 2025</span>
          </div>
          <p className="text-xs text-muted-foreground">Protegiendo Pymes en toda Latinoamérica</p>
        </div>
      </footer>
    </div>
  );
}
