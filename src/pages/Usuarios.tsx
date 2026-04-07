import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useEmpresa } from "@/hooks/useEmpresa";
import { usuarioService } from "@/lib/services";
import { suscripcionService, PLANES } from "@/lib/suscripcion";
import { MODULOS_DISPONIBLES, Modulo } from "@/hooks/usePermisos";
import type { Usuario } from "@/lib/database.types";
import type { PlanType } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Plus, User, Shield, Users, Mail, Trash2, X, Loader2, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const roleConfig = {
  admin: { label: "Administrador", color: "bg-primary", icon: Shield },
  responsable: { label: "Responsable", color: "bg-warning", icon: Users },
  empleado: { label: "Empleado", color: "bg-success", icon: User },
};

export default function Usuarios() {
  const { empresa } = useEmpresa();
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [planActual, setPlanActual] = useState<PlanType>('free');
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol: "empleado" as "admin" | "responsable" | "empleado",
    modulos: [] as string[],
  });

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

  const loadUsuarios = useCallback(async () => {
    if (!empresa?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await usuarioService.getByEmpresa(empresa.id);
      setUsuarios(data || []);
    } catch (error) {
      console.error("Error loading usuarios:", error);
    } finally {
      setLoading(false);
    }
  }, [empresa?.id]);

  useEffect(() => {
    loadUsuarios();
    loadPlan();
  }, [empresa?.id, loadPlan, loadUsuarios]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!empresa?.id) return;
    
    const maxUsuarios = PLANES[planActual].features.maxUsuarios;
    if (usuarios.length >= maxUsuarios) {
      alert(`Has alcanzado el límite de usuarios de tu plan (${maxUsuarios}). Actualiza tu plan para agregar más usuarios.`);
      return;
    }
    
    const modulosSeleccionados = form.rol === "admin" 
      ? MODULOS_DISPONIBLES.map(m => m.id)
      : form.modulos;
    
    setSaving(true);
    try {
      await usuarioService.create({
        empresa_id: empresa.id,
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
        activo: true,
        modulos: modulosSeleccionados,
      });
      await loadUsuarios();
      setShowForm(false);
      setForm({ nombre: "", email: "", rol: "empleado", modulos: [] });
    } catch (error) {
      console.error("Error creating usuario:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await usuarioService.delete(id);
      await loadUsuarios();
    } catch (error) {
      console.error("Error deleting usuario:", error);
    }
  }

  function toggleModulo(modulo: string) {
    setForm(prev => ({
      ...prev,
      modulos: prev.modulos.includes(modulo)
        ? prev.modulos.filter(m => m !== modulo)
        : [...prev.modulos, modulo]
    }));
  }

  if (!empresa) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 max-w-md mx-auto">
          <div className="card-glass rounded-xl p-8 text-center">
            <User size={40} className="mx-auto text-muted-foreground mb-3" />
            <h2 className="text-xl font-bold text-foreground">Sin empresa</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Registra una empresa para gestionar usuarios.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Administra los usuarios y permisos de tu empresa
            </p>
          </div>
          <Button
            onClick={() => {
              const maxUsuarios = PLANES[planActual].features.maxUsuarios;
              if (usuarios.length >= maxUsuarios) {
                alert(`Has alcanzado el límite de usuarios de tu plan (${maxUsuarios}). Actualiza tu plan para agregar más usuarios.`);
                return;
              }
              setShowForm(true);
            }}
            className="bg-primary text-primary-foreground hover:opacity-90 gap-2"
          >
            <Plus size={16} />
            Agregar usuario
          </Button>
        </div>

        {/* Plan info */}
        <div className="card-glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Plan {PLANES[planActual].nombre}</p>
              <p className="text-xs text-muted-foreground">
                {usuarios.length} / {PLANES[planActual].features.maxUsuarios === 999 ? '∞' : PLANES[planActual].features.maxUsuarios} usuarios utilizados
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card-glass rounded-xl p-6 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Nuevo usuario</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre completo"
                  required
                  className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Correo electrónico</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@empresa.com"
                  required
                  className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Rol</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(roleConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm({ ...form, rol: key as "admin" | "responsable" | "empleado", modulos: key === 'admin' ? MODULOS_DISPONIBLES.map(m => m.id) : [] })}
                        className={cn(
                          "p-3 rounded-lg border text-center transition-all",
                          form.rol === key
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <Icon size={20} className={cn("mx-auto mb-1", form.rol === key ? "text-primary" : "text-muted-foreground")} />
                        <p className="text-xs font-medium text-foreground">{config.label}</p>
                      </button>
                    );
                  })}
                </div>
                {form.rol === "admin" && (
                  <p className="text-xs text-primary mt-2">Los administradores tienen acceso a todos los módulos</p>
                )}
              </div>

              {form.rol !== "admin" && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Módulos habilitados
                    <span className="text-muted-foreground font-normal ml-1">(selecciona los que puede ver)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {MODULOS_DISPONIBLES.map((modulo) => (
                      <button
                        key={modulo.id}
                        type="button"
                        onClick={() => toggleModulo(modulo.id)}
                        className={cn(
                          "p-2 rounded-lg border text-left transition-all flex items-center gap-2",
                          form.modulos.includes(modulo.id)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <span className={cn(
                          "w-5 h-5 rounded flex items-center justify-center",
                          form.modulos.includes(modulo.id) ? "bg-primary text-white" : "bg-muted"
                        )}>
                          {form.modulos.includes(modulo.id) && <Check size={12} />}
                        </span>
                        <span className="text-sm">{modulo.icon} {modulo.label}</span>
                      </button>
                    ))}
                  </div>
                  {form.modulos.length === 0 && (
                    <p className="text-xs text-warning mt-2">Selecciona al menos un módulo o cambia el rol a administrador</p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-border text-muted-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || (form.rol !== "admin" && form.modulos.length === 0)}
                  className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : "Crear usuario"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Users list */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando...</div>
        ) : usuarios.length === 0 ? (
          <div className="card-glass rounded-xl p-12 text-center">
            <Users size={40} className="mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Sin usuarios</h3>
            <p className="text-sm text-muted-foreground">
              Agrega usuarios para gestionar tu empresa.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {usuarios.map((usuario) => {
              const config = roleConfig[usuario.rol as keyof typeof roleConfig];
              const Icon = config?.icon || User;
              const modulosUsuario = usuario.rol === 'admin' 
                ? MODULOS_DISPONIBLES.map(m => m.label).join(', ')
                : (usuario.modulos || []).map(m => MODULOS_DISPONIBLES.find(x => x.id === m)?.label).filter(Boolean).join(', ');
              
              return (
                <div
                  key={usuario.id}
                  className="card-glass rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", config?.color || "bg-muted")}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{usuario.nombre}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail size={12} />
                          {usuario.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config?.color, "text-white")}>
                        {config?.label || usuario.rol}
                      </span>
                      <button
                        onClick={() => handleDelete(usuario.id)}
                        className="p-2 text-muted-foreground hover:text-danger transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Módulos:</span> {modulosUsuario}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}