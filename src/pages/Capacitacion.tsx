import { AppLayout } from "@/components/AppLayout";
import { BookOpen, ShieldCheck, Lock, Mail, Wifi, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const modules = [
  {
    id: 1,
    icon: "🎣",
    title: "¿Qué es el Phishing?",
    category: "Amenazas",
    duration: "5 min",
    level: "Básico",
    completed: true,
    description: "Aprende a identificar correos falsos diseñados para robar tus contraseñas e información.",
    tips: [
      "Revisa siempre el dominio del remitente (no solo el nombre)",
      "Nunca hagas clic en enlaces sospechosos",
      "Llama directamente al banco o empresa si dudas",
    ],
  },
  {
    id: 2,
    icon: "🔑",
    title: "Contraseñas Seguras",
    category: "Fundamentos",
    duration: "4 min",
    level: "Básico",
    completed: true,
    description: "Cómo crear y gestionar contraseñas fuertes que realmente protejan tus cuentas.",
    tips: [
      "Usa al menos 12 caracteres mezclando letras, números y símbolos",
      "Nunca reutilices contraseñas entre servicios",
      "Utiliza un gestor de contraseñas como Bitwarden o 1Password",
    ],
  },
  {
    id: 3,
    icon: "📱",
    title: "Doble Factor (2FA)",
    category: "Autenticación",
    duration: "6 min",
    level: "Básico",
    completed: false,
    description: "La segunda capa de seguridad más importante que puedes activar hoy mismo.",
    tips: [
      "Activa 2FA en correo, redes sociales y banca",
      "Usa una app autenticadora (Google Authenticator, Authy)",
      "Guarda los códigos de recuperación en un lugar seguro",
    ],
  },
  {
    id: 4,
    icon: "💾",
    title: "Backup y Recuperación",
    category: "Continuidad",
    duration: "7 min",
    level: "Intermedio",
    completed: false,
    description: "Estrategia 3-2-1 para nunca perder información crítica de tu empresa.",
    tips: [
      "3 copias de datos, en 2 medios distintos, 1 fuera de la empresa",
      "Prueba la recuperación regularmente",
      "Automatiza los backups para no depender de la memoria",
    ],
  },
  {
    id: 5,
    icon: "🦠",
    title: "Ransomware: cómo defenderte",
    category: "Amenazas",
    duration: "8 min",
    level: "Intermedio",
    completed: false,
    description: "El ataque más devastador para las Pymes. Aprende a prevenirlo antes de que sea tarde.",
    tips: [
      "Mantén todos los sistemas actualizados",
      "Nunca descargues software de fuentes desconocidas",
      "Segmenta tu red para limitar la propagación",
    ],
  },
  {
    id: 6,
    icon: "📡",
    title: "Seguridad de Red WiFi",
    category: "Infraestructura",
    duration: "5 min",
    level: "Básico",
    completed: false,
    description: "Configura tu red corporativa para evitar accesos no autorizados.",
    tips: [
      "Usa WPA3 o al menos WPA2 en tu router",
      "Crea una red separada para visitas e invitados",
      "Cambia las contraseñas por defecto del router",
    ],
  },
];

export default function Capacitacion() {
  const completed = modules.filter((m) => m.completed).length;
  const pct = Math.round((completed / modules.length) * 100);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Centro de Capacitación</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Guías prácticas para proteger tu empresa sin necesitar ser experto
            </p>
          </div>
          <div className="card-glass rounded-xl px-4 py-2 text-right">
            <p className="text-lg font-bold text-primary">{pct}%</p>
            <p className="text-xs text-muted-foreground">{completed}/{modules.length} completados</p>
          </div>
        </div>

        {/* Progress */}
        <div className="card-glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              Tu progreso de aprendizaje
            </h2>
            <span className="text-sm font-bold text-primary">{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {modules.length - completed} módulos pendientes · Tiempo estimado restante: {(modules.length - completed) * 6} min
          </p>
        </div>

        {/* Module grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <div key={mod.id} className={`card-glass rounded-xl p-5 hover:border-primary/30 transition-all border ${mod.completed ? "opacity-80" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-2xl">
                  {mod.icon}
                </div>
                {mod.completed ? (
                  <div className="flex items-center gap-1 text-success text-xs font-medium">
                    <CheckCircle2 size={14} />
                    Completado
                  </div>
                ) : (
                  <span className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                    {mod.level}
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-foreground mb-1">{mod.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-primary">{mod.category}</span>
                <span className="text-xs text-muted-foreground">· {mod.duration}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{mod.description}</p>

              {/* Tips */}
              <div className="space-y-1.5">
                {mod.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-primary shrink-0 mt-0.5">→</span>
                    {tip}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <button className={`w-full text-xs font-medium py-2 rounded-lg transition-colors ${
                  mod.completed
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                }`}>
                  {mod.completed ? "✓ Volver a revisar" : "→ Estudiar módulo"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="card-glass rounded-xl p-6 text-center">
          <ShieldCheck size={32} className="mx-auto text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-2">¿Listo para evaluar tu aprendizaje?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Vuelve a hacer el diagnóstico y mide cómo han mejorado tus prácticas
          </p>
          <Link to="/diagnostico">
            <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2">
              Ir al diagnóstico
              <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
