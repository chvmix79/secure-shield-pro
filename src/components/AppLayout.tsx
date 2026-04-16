import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import logoCHV from "@/assets/Logo_CHV.png";
import { supabase } from "@/lib/supabase";
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
import { suscripcionService, PLANES, EstadoSuscripcion } from "@/lib/suscripcion";
import { RealtimeNotifications } from "./RealtimeNotifications";
import { esAdminGlobal } from "@/lib/admin-utils";

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
  const { empresa, acciones, alertas, isAdmin: contextIsAdmin } = useEmpresa();
  const { usuario, tieneAcceso, loading: loadingUsuario } = useUsuarioActual();
  const authEmail = localStorage.getItem("user_email")?.toLowerCase() || "";
  const isAdmin = esAdminGlobal(authEmail) || contextIsAdmin;
  const [plan, setPlan] = useState<string>(empresa?.plan || 'free');
  const [estadoSuscripcion, setEstadoSuscripcion] = useState<EstadoSuscripcion | null>(null);
  const [loadingSuscripcion, setLoadingSuscripcion] = useState(true);
  
  const pendingActions = acciones.filter(a => a.estado === "pendiente" || a.estado === "en_progreso").length;
  const unreadAlerts = alertas.filter(a => !a.leida).length;
  const pendingRisks = acciones.filter(a => a.estado === "pendiente").length;

  const cargarSuscripcion = useCallback(async (id: string) => {
    setLoadingSuscripcion(true);
    const e = await suscripcionService.getEstadoSuscripcion(id);
    setEstadoSuscripcion(e);
    setPlan(e.plan);
    setLoadingSuscripcion(false);
  }, []);

  useEffect(() => {
    if (empresa?.plan) {
      setPlan(empresa.plan);
    }
  }, [empresa?.plan]);

  useEffect(() => {
    if (!empresa?.id) return;
    cargarSuscripcion(empresa.id);

    // Escuchar cambios en tiempo real: cuando el admin asigna un plan,
    // el cliente ve el nuevo estado inmediatamente sin recargar la página.
    const channel = supabase
      .channel(`suscripcion_${empresa.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'empresas',
          filter: `id=eq.${empresa.id}`,
        },
        () => {
          cargarSuscripcion(empresa.id);
          refresh(); // Refrescamos el contexto global de la empresa ante cambios en la DB
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [empresa?.id, cargarSuscripcion]);

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
      { to: "/marketplace", icon: Shield, label: "Marketplace", badge: null, modulo: 'diagnostico' as Modulo, requerido: null },
      { to: "/microsoft365", icon: Server, label: "Microsoft 365", badge: null, modulo: 'microsoft365' as Modulo, requerido: 'pro' },
      { to: "/vulnerabilidades", icon: Bug, label: "Vulnerabilidades", badge: null, modulo: 'vulnerabilidades' as Modulo, requerido: 'pro' },
      { to: "/planes", icon: CreditCard, label: "Planes", badge: null, modulo: 'diagnostico' as Modulo, requerido: null, ocultoAdmin: true },
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
    return tieneAcceso(item.modulo);
  });

  const currentModulo = RUTA_MODULO[location.pathname];
  const isUserAdmin = usuario?.rol === 'admin' || usuario?.rol === 'super_admin' || isAdmin;
  const isAdminPath = location.pathname.startsWith('/admin');

  // Redirección de seguridad
  if (!loadingUsuario) {
    // Si intenta entrar a admin y no tiene permiso
    if (isAdminPath && !isUserAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    // Verificación de módulos para usuarios normales
    if (currentModulo && currentModulo !== 'diagnostico' && !isUserAdmin && usuario && !tieneAcceso(currentModulo)) {
      return <Navigate to="/dashboard" replace />;
    }

    // REDIRECCIÓN POR BLOQUEO DE SUSCRIPCIÓN
    if (estadoSuscripcion?.estaBloqueada && !isAdmin && location.pathname !== '/bloqueado') {
      return <Navigate to="/bloqueado" replace />;
    }
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
            const blocked = requerido && !tienePlan(requerido) && !isAdmin;
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
        
        {/* Banner de Suscripción — solo planes pagos con fecha_fin próxima a vencer */}
        {!isAdmin && estadoSuscripcion && estadoSuscripcion.fecha_fin && location.pathname !== '/bloqueado' && (() => {
          const { diasRestantes, estaVencida, fecha_fin } = estadoSuscripcion;
          const fechaFinStr = fecha_fin
            ? new Date(fecha_fin).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
            : '';
          // 2 días de gracia: calcular días que quedan de gracia después del vencimiento
          const fechaBloqueo = fecha_fin ? new Date(new Date(fecha_fin).getTime() + 2 * 24 * 60 * 60 * 1000) : null;
          const diasGracia = fechaBloqueo
            ? Math.max(0, Math.ceil((fechaBloqueo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : 0;

          if (estaVencida) {
            // Licencia vencida (incluyendo gracia ya terminada)
            // Nota: El usuario será redirigido a /bloqueado por la lógica de arriba, 
            // pero esto es un respaldo visual.
            return (
              <div className="px-6 py-2.5 flex items-center justify-between gap-4 bg-red-600 text-white animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <AlertTriangle size={18} className="shrink-0" />
                  <span>
                    ⚠️ Tu licencia venció el <strong>{fechaFinStr}</strong>. Tu cuenta está bloqueada.
                  </span>
                </div>
                <Link to="/planes">
                  <Badge variant="outline" className="cursor-pointer hover:bg-white/20 transition-colors uppercase font-black px-3 py-1 border-white text-white shrink-0">
                    Renovar Ahora
                  </Badge>
                </Link>
              </div>
            );
          }

          if (diasRestantes <= 5 && diasRestantes > 0) {
            // Licencia vigente pero próxima a vencer (estos 5 días ya incluyen el final del periodo de gracia)
            return (
              <div className="px-6 py-2.5 flex items-center justify-between gap-4 bg-warning text-warning-foreground animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <AlertTriangle size={18} className="shrink-0" />
                  <span>
                    Atención: Tu periodo de acceso (incluyendo días de gracia) termina el <strong>{fechaFinStr}</strong> ({diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}).
                  </span>
                </div>
                <Link to="/planes">
                  <Badge variant="outline" className="cursor-pointer hover:bg-white/20 transition-colors uppercase font-black px-3 py-1 border-warning-foreground text-warning-foreground shrink-0">
                    Renovar Ahora
                  </Badge>
                </Link>
              </div>
            );
          }

          return null;
        })()}

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
