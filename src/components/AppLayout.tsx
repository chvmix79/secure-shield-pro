import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import cyberShield from "@/assets/cyber-shield.png";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", badge: null },
  { to: "/diagnostico", icon: ClipboardCheck, label: "Diagnóstico", badge: null },
  { to: "/riesgos", icon: AlertTriangle, label: "Riesgos", badge: "3" },
  { to: "/acciones", icon: ListTodo, label: "Plan de Acción", badge: "4" },
  { to: "/evidencias", icon: FolderOpen, label: "Evidencias", badge: null },
  { to: "/alertas", icon: Bell, label: "Alertas", badge: "2" },
  { to: "/capacitacion", icon: BookOpen, label: "Capacitación", badge: null },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <img src={cyberShield} alt="Shield" width={36} height={36} className="drop-shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">CiberSegura</p>
            <p className="text-xs text-muted-foreground">Pymes</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Company badge */}
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">TechPyme S.A.</p>
              <p className="text-xs text-muted-foreground">Servicios financieros</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, badge }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="flex-1">{label}</span>
                {badge && (
                  <Badge className="h-5 min-w-[20px] px-1.5 text-xs bg-danger text-white border-0">
                    {badge}
                  </Badge>
                )}
                {isActive && <ChevronRight size={14} className="text-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </Link>
        </div>
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
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
