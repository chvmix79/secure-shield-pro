import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  AlertTriangle, 
  ListChecks, 
  FolderOpen, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Zap, 
  Star, 
  Crown, 
  CreditCard, 
  X,
  Shield,
  Lock,
  Globe,
  Award,
  BarChart3,
  Bot,
  Check,
  Building2,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoCHV from "@/assets/Logo_CHV.png";

const features = [
  {
    icon: ShieldCheck,
    title: "Diagnóstico con Sello CHV",
    description: "Evaluación exhaustiva de 360° diseñada específicamente para la realidad de las PYMES en Latinoamérica.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: Bot,
    title: "Experto IA 24/7",
    description: "Un consultor especializado en ciberseguridad disponible en todo momento para resolver tus dudas técnicas.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: ListChecks,
    title: "Defensa Activa",
    description: "Planes de acción automatizados que priorizan los riesgos más críticos para tu continuidad de negocio.",
    color: "text-success",
    bg: "bg-success/10 border-success/20",
  },
  {
    icon: Shield,
    title: "Simulacros de Phishing",
    description: "Entrena a tu equipo con ataques simulados reales para prevenir el error humano, la brecha #1.",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
];

const stats = [
  { label: "Empresas Protegidas", value: "1.2k+" },
  { label: "Amenazas Bloqueadas", value: "45k+" },
  { label: "Eficiencia en Respuesta", value: "98%" },
  { label: "Puntaje Promedio", value: "88/100" },
];

export default function Index() {
  const [isAnnual, setIsAnnual] = useState(false);
  return (
    <div className="min-h-screen bg-[#05070A] text-slate-200 selection:bg-primary/30 selection:text-white">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoCHV} alt="Logo CHV" className="w-10 h-10 drop-shadow-md" />
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-white leading-none">CHV</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold text-sky-400">CIBERDEFENSA</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Soluciones', href: '#soluciones' },
              { label: 'Diagnóstico', href: '#diagnostico' },
              { label: 'Planes', href: '#planes' },
              { label: 'Sobre CHV', href: '#sobre-chv' }
            ].map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-medium text-slate-400 hover:text-primary transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">
                Acceso Cliente
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 shadow-lg shadow-primary/25">
                Empezar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold tracking-wider uppercase animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Estándar de Seguridad 2026
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                El blindaje digital que tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">empresa merece.</span>
              </h1>
              
              <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                CHV CyberDefense transforma la complejidad técnica en una estrategia de defensa intuitiva, potente y con respaldo de inteligencia artificial.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/login">
                  <Button size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 group">
                    Proteger mi Empresa
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 px-4">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/40?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white">4.9/5 Calificación</p>
                    <p className="text-slate-500">Confianza total Pyme</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
              <div className="relative glass-card rounded-[2.5rem] border border-white/10 p-2 shadow-2xl overflow-hidden animate-float">
                <img 
                  src="/branding/flyer.png" 
                  alt="Dashboard Preview" 
                  className="rounded-[2rem] shadow-inner"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Shield className="text-white fill-white" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="text-4xl lg:text-5xl font-black text-white">{stat.value}</div>
                <div className="text-sm uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="soluciones" className="py-24 px-6">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-xs uppercase tracking-[0.3em] text-primary font-black">Nuestros Pilares</h2>
              <p className="text-4xl lg:text-5xl font-black text-white">
                Defensa integral con sello de excelencia.
              </p>
              <p className="text-slate-400 text-lg">
                No solo detectamos riesgos, construimos una cultura de seguridad en tu organización.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="group p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.bg}`}>
                    <feature.icon className={feature.color} size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology/CTAs */}
        <section id="diagnostico" className="py-24 bg-gradient-to-b from-transparent to-primary/5">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
            <div className="p-12 rounded-[3rem] bg-gradient-to-br from-slate-900 to-black border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl lg:text-4xl font-black text-white">
                  ¿Listo para elevar tu estándar de seguridad?
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Únete a las empresas que han decidido dejar de preocuparse por los ciberataques y empezar a crecer con tranquilidad.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Link to="/login">
                    <Button size="lg" className="h-14 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
                      Crear Cuenta Gratis
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="h-14 px-10 border-white/10 text-white hover:bg-white/5 rounded-2xl text-lg">
                      Hablar con un Experto
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Planes Section */}
        <section id="planes" className="py-24 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-black">Nuestros Planes</h2>
              <p className="text-4xl lg:text-5xl font-black text-white">
                Elige la protección que necesitas.
              </p>
              <p className="text-slate-400 text-lg">
                Desbloquea herramientas de uso ilimitado y el respaldo de la IA.
              </p>

              {/* Toggle Mensual/Anual */}
              <div className="flex items-center justify-center mt-8">
                <div className="bg-white/5 p-1 rounded-full flex items-center border border-white/10 gap-1">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={cn(
                      "px-6 py-2 rounded-full text-sm font-bold transition-all",
                      !isAnnual ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Mensual
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={cn(
                      "px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                      isAnnual ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Anual
                    <span className="bg-green-500/20 text-green-400 text-[10px] py-0.5 px-2 rounded-full font-black">
                      AHORRA 20%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Prueba Gratis', price: '0', icon: Zap, color: 'text-gray-400', bg: 'bg-gray-500/10', popular: false,
                  features: [{l: '1 Usuario', on: true}, {l: '1 Diagnóstico/mes', on: true}, {l: 'Simulación Phishing', on: false}, {l: 'Vulnerabilidades', on: false}, {l: 'Chat IA Experto', on: false}, {l: 'Reportes PDF', on: false}] 
                },
                { name: 'Básico', price: isAnnual ? '1,440,000' : '150,000', icon: Building2, color: 'text-primary', bg: 'bg-primary/10 border-primary/50', popular: false,
                  features: [{l: '3 Usuarios', on: true}, {l: 'Diagnósticos Ilimitados', on: true}, {l: 'Simulación Phishing', on: true}, {l: 'Chat IA Experto', on: true}, {l: 'Reportes PDF', on: true}, {l: 'Vulnerabilidades', on: false}] 
                },
                { name: 'Profesional', price: isAnnual ? '3,360,000' : '350,000', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/50 relative transform md:-translate-y-4 shadow-2xl shadow-amber-500/20', popular: true,
                  features: [{l: 'Usuarios Ilimitados', on: true}, {l: 'Diagnósticos Ilimitados', on: true}, {l: 'Simulación Phishing', on: true}, {l: 'Vulnerabilidades', on: true}, {l: 'Microsoft 365', on: true}, {l: 'Soporte Prioritario', on: true}] 
                }
              ].map(plan => (
                <div key={plan.name} className={`rounded-[2rem] p-8 bg-white/[0.03] border border-white/10 flex flex-col ${plan.bg}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-amber-500 text-white text-xs font-bold rounded-full tracking-wider">
                      MÁS POPULAR
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/5`}>
                    <plan.icon className={plan.color} size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-4xl font-black text-white">${plan.price}</span>
                    <span className="text-slate-400">/{isAnnual ? 'año' : 'mes'}</span>
                  </div>
                  <div className="space-y-4 flex-1 mb-8">
                    {plan.features.map(f => (
                      <div key={f.l} className="flex items-center gap-3 text-sm">
                        {f.on ? <Check size={18} className="text-success shrink-0" /> : <X size={18} className="text-slate-600 shrink-0" />}
                        <span className={f.on ? "text-slate-300" : "text-slate-500"}>{f.l}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/login" className="mt-auto block">
                    <Button className={`w-full h-12 rounded-xl font-bold ${plan.popular ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                      Comenzar con {plan.name}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sobre CHV Section */}
        <section id="sobre-chv" className="py-24 px-6 border-t border-white/5 bg-gradient-to-t from-transparent to-white/[0.02]">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-xs uppercase tracking-[0.3em] text-primary font-black">Sobre Nosotros</h2>
              <p className="text-4xl lg:text-5xl font-black text-white">
                Elevando el estándar en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Latinoamérica.</span>
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="text-primary" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Nuestra Misión</h3>
                </div>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Transformar la complejidad técnica de la seguridad digital en una estrategia de defensa sólida, intuitiva y accesible. En CHV, creemos que la protección de alto nivel no debe ser exclusiva de las grandes corporaciones.
                </p>
              </div>

              <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Target className="text-cyan-400" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Nuestra Visión</h3>
                </div>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Convertirnos en el aliado estratégico #1 en ciberseguridad para el tejido empresarial, potenciando el crecimiento seguro a través de la innovación constante y el respaldo de la inteligencia artificial.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-[#030508]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 lg:gap-24">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <img src={logoCHV} alt="Logo CHV" className="w-10 h-10 drop-shadow-md" />
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight text-white leading-none">CHV</span>
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">CIBERDEFENSA</span>
              </div>
            </div>
            <p className="text-slate-500 max-w-sm">
              Potenciando la ciberseguridad corporativa con soluciones ágiles, diagnósticos avanzados y el respaldo de la inteligencia artificial.
            </p>
            <div className="flex gap-4">
              {/* Social icons placeholders */}
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-primary/50 transition-colors flex items-center justify-center cursor-pointer">
                  <Globe size={18} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Soluciones</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li className="hover:text-primary transition-colors cursor-pointer">Diagnóstico 360</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Phishing Simulation</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Compliance Automático</li>
              <li className="hover:text-primary transition-colors cursor-pointer">IA Consulting</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li className="hover:text-primary transition-colors cursor-pointer">Privacidad</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Términos de Uso</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Seguridad de Datos</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">
            © 2026 CHV Ciberdefensa. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Lock size={14} />
            <span>Infraestructura Segura con Encriptación AES-256</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
