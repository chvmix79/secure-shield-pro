import { useState, useEffect } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import logoCHV from "@/assets/Logo_CHV.png";
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  ListTodo,
  FolderOpen,
  Bell,
  BookOpen,
  Menu,
  X,
  ChevronRight,
  Building2,
  LogOut,
  Plus,
  History,
  Settings,
  Users,
  Mail,
  Shield,
  Server,
  Bug,
  MessageCircle,
  Bot,
  FileCheck,
  CreditCard,
  Lock,
  Info,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEmpresa } from "@/hooks/useEmpresa";
import { useUsuarioActual, MODULOS_DISPONIBLES, Modulo } from "@/hooks/usePermisos";
import { suscripcionService, PLANES } from "@/lib/suscripcion";
import { RealtimeNotifications } from "./RealtimeNotifications";

interface AppLayoutProps {
  children: React.ReactNode;
}

const sectores: Record<string, string> = {
  tecnologia: "Tecnología",
  comercio: "Comercio",
  salud: "Salud",
  educacion: "Educación",
  industria: "Industria",
  servicios: "Servicios",
  restaurante: "Restaurantes",
  transporte: "Transporte",
};

const RUTA_MODULO: Record<string, Modulo> = {
  '/dashboard': 'diagnostico',
  '/diagnostico': 'diagnostico',
  '/historial': 'diagnostico',
  '/riesgos': 'riesgos',
  '/acciones': 'acciones',
  '/evidencias': 'evidencias',
  '/alertas': 'alertas',
  '/capacitacion': 'capacitacion',
  '/phishing': 'phishing',
  '/microsoft365': 'microsoft365',
  '/vulnerabilidades': 'vulnerabilidades',
  '/documentos': 'documentos',
  '/usuarios': 'acciones',
  '/chat-cibersecurity': 'chat',
  '/chat-ciberseguridad': 'chat',
  '/chat-auditor': 'chat',
  '/marketplace': 'chat',
};

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { empresa, acciones, alertas } = useEmpresa();
  const { usuario, tieneAcceso, loading: loadingUsuario } = useUsuarioActual();
    const ownerEmails = [
      "chvmix79@gmail.com", 
      "chv.79@hotmail.com", 
      import.meta.env.VITE_ADMIN_EMAIL
    ].filter(Boolean).map(e => e?.toLowerCase());
    const authEmail = localStorage.getItem("user_email")?.toLowerCase() || "";
    const isAdmin = authEmail && ownerEmails.includes(authEmail) || localStorage.getItem("is_admin") === "true";
  const [plan, setPlan] = useState<string>('free');
  
  const pendingActions = acciones.filter(a => a.estado === "pendiente" || a.estado === "en_progreso").length;
  const unreadAlerts = alertas.filter(a => !a.leida).length;
  const pendingRisks = acciones.filter(a => a.estado === "pendiente").length;

  useEffect(() => {
    if (empresa?.id) {
      suscripcionService.getPlan(empresa.id).then(p => setPlan(p));
    }
  }, [empresa?.id]);

  const getNavItems = () => {
    const items = [
      { to: "/dashboard", icon: LayoutDashboard, label: "Tablero Central", badge: null, modulo: 'diagnostico' as Modulo, requerido: null },
      { to: "/diagnostico", icon: ClipboardCheck, label: "Diagnóstico", badge: null, modulo: 'diagnostico' as Modulo, requerido: null },
      { to: "/historial", icon: History, label: "Historial", badge: null, modulo: 'diagnostico' as Modulo, requerido: null },
      { to: "/riesgos", icon: AlertTriangle, label: "Riesgos", badge: pendingRisks > 0 ? pendingRisks.toString() : null, modulo: 'riesgos' as Modulo, requerido: 'basic' },
      { to: "/acciones", icon: ListTodo, label: "Plan de Acción", badge: pendingActions > 0 ? pendingActions.toString() : null, modulo: 'acciones' as Modulo, requerido: 'basic' },
      { to: "/evidencias", icon: FolderOpen, label: "Evidencias", badge: null, modulo: 'evidencias' as Modulo, requerido: 'basic' },
      { to: "/documentos", icon: FileCheck, label: "Cumplimiento", badge: null, modulo: 'documentos' as Modulo, requerido: 'basic' },
      { to: "/alertas", icon: Bell, label: "Alertas", badge: unreadAlerts > 0 ? unreadAlerts.toString() : null, modulo: 'alertas' as Modulo, requerido: 'basic' },
      { to: "/capacitacion", icon: HelpCircle, label: "Capacitación", badge: null, modulo: 'capacitacion' as Modulo, requerido: null },
      { to: "/phishing", icon: Mail, label: "Phishing", badge: null, modulo: 'phishing' as Modulo, requerido: 'basic' },
      { to: "/marketplace", icon: Shield, label: "Marketplace", badge: null, modulo: 'documentos' as Modulo, requerido: null },
      { to: "/microsoft365", icon: Server, label: "Microsoft 365", badge: null, modulo: 'microsoft365' as Modulo, requerido: 'pro' },
      { to: "/vulnerabilidades", icon: Bug, label: "Vulnerabilidades", badge: null, modulo: 'vulnerabilidades' as Modulo, requerido: 'pro' },
      { to: "/planes", icon: CreditCard, label: "Planes", badge: null, modulo: 'acciones' as Modulo, requerido: null, ocultoAdmin: true },
      { to: "/sobre-chv", icon: Info, label: "Sobre CHV", badge: null, modulo: 'diagnostico' as Modulo, requerido: null },
      { to: "/usuarios", icon: Users, label: "Usuarios", badge: null, modulo: 'acciones' as Modulo, requerido: 'basic' },
      { to: "/chat-ciberseguridad", icon: MessageCircle, label: "Experto Ciberseguridad", badge: null, modulo: 'chat' as Modulo, requerido: 'basic' },
      { to: "/chat-auditor", icon: Bot, label: "Experto Auditor", badge: null, modulo: 'chat' as Modulo, requerido: 'basic' },
    ];

    // Filtrar elementos según tipo de usuario
    const filteredItems = items.filter(item => {
      if (isAdmin && item.ocultoAdmin) return false;
      return true;
    });

    if (isAdmin) {
      filteredItems.push({ to: "/admin", icon: Settings, label: "Admin", badge: null, modulo: 'acciones' as Modulo, requerido: null });
    }

    return filteredItems;
  };

  const tienePlan = (requerido: string | null) => {
    if (isAdmin) return true;
    if (!requerido) return true;
    const orden = { free: 0, basic: 1, pro: 2 };
    return orden[plan as keyof typeof orden] >= orden[requerido as keyof typeof orden];
  };

  const navItems = getNavItems().filter(item => {
    if (isAdmin) return true;
    if (!usuario) return true;
    if (usuario.rol === 'admin') return true;
    if (!tienePlan(item.requerido)) return false;
    return tieneAcceso(item.modulo);
  });

  const currentModulo = RUTA_MODULO[location.pathname];
  const isUserAdmin = usuario?.rol === 'admin' || isAdmin;
  if (!loadingUsuario && currentModulo && !isUserAdmin && usuario && !tieneAcceso(currentModulo)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out",
          "lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="relative">
            <img src={logoCHV} alt="Logo CHV" width={36} height={36} className="drop-shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">CHV</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest text-primary font-black">CIBERDEFENSA</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Company badge */}
        {empresa ? (
          <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{empresa.nombre}</p>
                <p className="text-xs text-muted-foreground">{sectores[empresa.sector || ''] || empresa.sector}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-3 mt-3 mb-1">
            <Link
              to="/empresa"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} />
              <span className="text-xs font-medium">Registrar empresa</span>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, badge, requerido }) => {
            const isActive = location.pathname === to;
            const blocked = requerido && !tienePlan(requerido);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : blocked
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                {...(blocked ? { onClick: (e) => e.preventDefault() } : {})}
              >
                {blocked ? (
                  <Lock size={18} className="shrink-0 text-muted-foreground/50" />
                ) : (
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                )}
                <span className="flex-1">{label}</span>
                {badge && (
                  <Badge className="h-5 min-w-[20px] px-1.5 text-xs bg-danger text-white border-0">
                    {badge}
                  </Badge>
                )}
                {blocked && (
                  <Badge variant="outline" className="text-xs border-warning/50 text-warning">
                    {requerido === 'basic' ? 'Basic' : 'Pro'}
                  </Badge>
                )}
                {isActive && !blocked && <ChevronRight size={14} className="text-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Plan info - solo para no admin y plan free */}
        {!isAdmin && plan === 'free' && (
          <div className="px-3 py-3 border-t border-sidebar-border">
            <Link
              to="/planes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
            >
              <CreditCard size={16} />
              <div className="flex-1">
                <div className="font-medium">Plan {PLANES[plan as keyof typeof PLANES]?.nombre || 'Free'}</div>
                <div className="text-xs opacity-80">
                  Actualizar
                </div>
              </div>
            </Link>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 h-14 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cerrar sesión
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <RealtimeNotifications empresaId={empresa?.id} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
