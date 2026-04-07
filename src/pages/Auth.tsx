import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/hooks/useEmpresa";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import logoCHV from "@/assets/Logo_CHV.png";

export default function Auth() {
  const navigate = useNavigate();
  const { refresh } = useEmpresa();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empresaNombre, setEmpresaNombre] = useState("");
  const [empresaSector, setEmpresaSector] = useState("");
  const [empresaEmpleados, setEmpresaEmpleados] = useState("");
  const [empresaNivelTech, setEmpresaNivelTech] = useState("");
  const [success, setSuccess] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authError) throw authError;
        
        if (data.user) {
          const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase() || '';
          const isGlobalAdmin = email.toLowerCase() === adminEmail;
          localStorage.setItem("user_email", email);
          
          let { data: empresa, error: fetchError } = await supabase
            .from("empresas")
            .select("id, cuenta_bloqueada, nombre, plan, user_id")
            .eq("user_id", data.user.id)
            .maybeSingle();
          
          // Si no encontramos por user_id, intentamos buscar por email para auto-vincular
          if (!empresa) {
            console.log("Buscando empresa por email para auto-vincular...");
            const { data: emailEmpresa } = await supabase
              .from("empresas")
              .select("id, cuenta_bloqueada, nombre, plan, user_id")
              .eq("email", email.toLowerCase())
              .maybeSingle();

            if (emailEmpresa) {
              console.log("Empresa encontrada por email, vinculando...");
              const { error: updateError } = await supabase
                .from("empresas")
                .update({ user_id: data.user.id })
                .eq("id", emailEmpresa.id);
              
              if (!updateError) {
                empresa = emailEmpresa;
              }
            }
          }
          
          if (empresa) {
            if (empresa.cuenta_bloqueada) {
              navigate("/bloqueado");
              return;
            }
            
            localStorage.setItem("empresa_id", empresa.id);
            localStorage.setItem("is_admin", isGlobalAdmin ? "true" : "false");
            await refresh();
            navigate(isGlobalAdmin ? "/admin" : "/dashboard");
          } else if (isGlobalAdmin) {
            localStorage.setItem("is_admin", "true");
            localStorage.setItem("empresa_id", "");
            await refresh();
            navigate("/admin");
          } else {
            setError("No encontramos una empresa registrada con este correo. Por favor, asegúrate de haber completado el registro.");
          }
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (authError) throw authError;

        const { data: empresa, error: empresaError } = await supabase
          .from("empresas")
          .insert({
            nombre: empresaNombre,
            sector: empresaSector,
            empleados: empresaEmpleados,
            nivel_tech: empresaNivelTech,
            email,
            plan: 'free',
            user_id: data.user?.id
          })
          .select()
          .single();

        if (empresaError) throw empresaError;

        if (empresa) {
          localStorage.setItem("empresa_id", empresa.id);
          await refresh();
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Error en autenticación:", err);
      
      let errorMsg = err.message || JSON.stringify(err);
      
      // Traducir errores comunes de Supabase
      if (errorMsg.includes("Invalid login credentials") || errorMsg.includes("Invalid primary key")) {
        errorMsg = "Credenciales de acceso inválidas. Verifica tu correo y contraseña.";
      } else if (errorMsg.includes("duplicate key value violates unique constraint \"empresas_email_key\"")) {
        errorMsg = "Esta empresa ya está registrada con este correo. Por favor, intenta iniciar sesión en lugar de registrarte.";
        setIsLogin(true); // Redirigir a login automáticamente
      } else if (errorMsg.includes("User already registered")) {
        errorMsg = "Este usuario ya está registrado en la plataforma. Intenta iniciar sesión.";
        setIsLogin(true);
      } else if (errorMsg.includes("Email not confirmed")) {
        errorMsg = "Debes confirmar tu correo electrónico. Revisa tu bandeja de entrada.";
      }

      alert("Error: " + errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  }

  const sectores = [
    { id: "tecnologia", label: "Tecnología" },
    { id: "comercio", label: "Comercio" },
    { id: "salud", label: "Salud" },
    { id: "educacion", label: "Educación" },
    { id: "industria", label: "Industria" },
    { id: "servicios", label: "Servicios" },
    { id: "restaurante", label: "Restaurantes" },
    { id: "transporte", label: "Transporte" },
  ];

  const empleados = ["1-5", "6-10", "11-50", "51-200", "200+"];
  const nivelesTech = [
    { id: "bajo", label: "Bajo" },
    { id: "medio", label: "Medio" },
    { id: "alto", label: "Alto" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logoCHV} alt="Logo CHV" className="w-16 h-16 drop-shadow-2xl" />
            <div className="flex flex-col text-left">
              <span className="font-black text-4xl tracking-tight text-white leading-none">CHV</span>
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold text-sky-400">CIBERDEFENSA</span>
            </div>
          </div>
          <p className="text-slate-400 mt-2">Gestión de ciberseguridad para tu empresa</p>
        </div>

        <div className="card-glass rounded-2xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
              {success}
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Correo electrónico</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full py-3">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Enviar enlace de recuperación"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-sm text-primary hover:underline mt-2"
              >
                Volver al inicio de sesión
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Correo electrónico</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-foreground">Contraseña</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-muted border border-border rounded-lg pl-10 pr-12 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="isAdmin" className="text-sm text-foreground">
                    Soy administrador
                  </label>
                </div>
              )}

              {!isLogin && (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Nombre de empresa</label>
                    <input
                      type="text"
                      value={empresaNombre}
                      onChange={(e) => setEmpresaNombre(e.target.value)}
                      placeholder="Mi Empresa S.A.S"
                      required={!isLogin}
                      className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Sector</label>
                    <select
                      value={empresaSector}
                      onChange={(e) => setEmpresaSector(e.target.value)}
                      required={!isLogin}
                      className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="">Selecciona un sector</option>
                      {sectores.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Empleados</label>
                      <select
                        value={empresaEmpleados}
                        onChange={(e) => setEmpresaEmpleados(e.target.value)}
                        required={!isLogin}
                        className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="">Selecciona</option>
                        {empleados.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Nivel tech</label>
                      <select
                        value={empresaNivelTech}
                        onChange={(e) => setEmpresaNivelTech(e.target.value)}
                        required={!isLogin}
                        className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="">Selecciona</option>
                        {nivelesTech.map((n) => (
                          <option key={n.id} value={n.id}>{n.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 py-3"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : isLogin ? (
                  "Iniciar sesión"
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          © 2026 CHV Ciberdefensa
        </p>
      </div>
    </div>
  );
}
