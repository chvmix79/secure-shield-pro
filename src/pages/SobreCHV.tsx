import { AppLayout } from "@/components/AppLayout";
import { Shield, Target, Award, Users, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SobreCHV() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Sobre CHV CyberDefense</h1>
          <p className="text-muted-foreground text-lg">
            Elevando el estándar de ciberseguridad para las PYMES de Latinoamérica.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                Nuestra Misión
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 leading-relaxed">
              Transformar la complejidad técnica de la seguridad digital en una estrategia de defensa sólida, 
              intuitiva y accesible. En CHV, creemos que la protección de alto nivel no debe ser exclusiva 
              de las grandes corporaciones.
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-400">
                <Target className="w-5 h-5" />
                Nuestra Visión
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 leading-relaxed">
              Convertirnos en el aliado estratégico #1 en ciberseguridad para el tejido empresarial, 
              potenciando el crecimiento seguro a través de la innovación constante y el respaldo de la 
              inteligencia artificial.
            </CardContent>
          </Card>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">¿Por qué CHV?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <Award className="w-8 h-8 text-yellow-500" />
              <h3 className="font-bold text-white">Sello de Excelencia</h3>
              <p className="text-sm text-slate-400">Metodologías validadas y alineadas con estándares internacionales.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <Users className="w-8 h-8 text-primary" />
              <h3 className="font-bold text-white">Enfoque Humano</h3>
              <p className="text-sm text-slate-400">Diseñado para personas, no solo para máquinas.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <Globe className="w-8 h-8 text-cyan-400" />
              <h3 className="font-bold text-white">Presencia Regional</h3>
              <p className="text-sm text-slate-400">Entendemos los desafíos únicos de nuestra región.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <Lock className="w-8 h-8 text-green-500" />
              <h3 className="font-bold text-white">Seguridad Total</h3>
              <p className="text-sm text-slate-400">Protección proactiva 24/7 en todas tus capas digitales.</p>
            </div>
          </div>
        </section>

        <footer className="pt-8 border-t border-white/10 text-center">
          <p className="text-slate-500 text-sm italic">
            "Tu tranquilidad digital es nuestro mayor compromiso."
          </p>
          <p className="text-xs text-primary font-bold mt-2 uppercase tracking-widest">
            CHV CyberDefense Team
          </p>
        </footer>
      </div>
    </AppLayout>
  );
}
