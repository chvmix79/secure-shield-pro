import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import logoCHV from "@/assets/Logo_CHV.png";
import { esAdminGlobal, syncAdminState } from "@/lib/admin-utils";

export default function Auth() {
  const navigate = useNavigate();
  // NOTA: No usar useEmpresa() aquí. Auth navega y deja que el Provider
  // recargue el contexto naturalmente al montar el dashboard.
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
  const [registroExitoso, setRegistroExitoso] = useState<string | null>(null); // email registrado

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
          const isGlobalAdmin = esAdminGlobal(email);
          localStorage.setItem("user_email", email);
          syncAdminState(email);
          
          let { data: empresa, error: fetchError } = await supabase
            .from("empresas")
            .select("id, cuenta_bloqueada, nombre, plan, user_id")
            .eq("user_id", data.user.id)
            .maybeSingle();
          
          // Si no encontramos por user_id, intentamos buscar por email para auto-vincular
          if (!empresa) {
            const { data: emailEmpresa } = await supabase
              .from("empresas")
              .select("id, cuenta_bloqueada, nombre, plan, user_id")
              .eq("email", email.toLowerCase())
              .maybeSingle();

            if (emailEmpresa) {
              await supabase
                .from("empresas")
                .update({ user_id: data.user.id })
                .eq("id", emailEmpresa.id);
              
              const { data: updatedEmpresa } = await supabase
                .from("empresas")
                .select("id, cuenta_bloqueada, nombre, plan, user_id")
                .eq("id", emailEmpresa.id)
                .single();
              empresa = updatedEmpresa;
            }
          }
          
          if (empresa) {
            if (empresa.cuenta_bloqueada) {
              navigate("/bloqueado");
              return;
            }
            localStorage.setItem("empresa_id", empresa.id);
            navigate(isGlobalAdmin ? "/admin" : "/dashboard");
          } else if (isGlobalAdmin) {
            // CASO CRÍTICO: Admin sin empresa, debe poder entrar a /admin
            localStorage.setItem("empresa_id", "");
            navigate("/admin");
          } else {
            setError("No encontramos una empresa registrada con este correo. Por favor, asegúrate de haber completado el registro.");
          }
        }
      } else {
        // === REGISTRO ===
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Redirigir al login después de confirmar el email
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        
        if (authError) throw authError;

        // Crear la empresa en la DB (aunque aún no haya confirmado)
        const { data: empresa, error: empresaError } = await supabase
          .from("empresas")
          .insert({
            nombre: empresaNombre,
            sector: empresaSector,
            empleados: empresaEmpleados,
            nivel_tech: empresaNivelTech,
            email,
            plan: 'free',
            user_id: data.user?.id,
            fecha_inicio: new Date().toISOString(),
            fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (empresaError) throw empresaError;

        // Mostrar pantalla de confirmación de email en lugar de ir al dashboard
        setRegistroExitoso(email);
      }
    } catch (err: any) {
      console.error("Error en autenticación:", err);
      
      let errorMsg = err.message || JSON.stringify(err);
      
      if (errorMsg.includes("Invalid login credentials") || errorMsg.includes("Invalid primary key")) {
        errorMsg = "Credenciales de acceso inválidas. Verifica tu correo y contraseña.";
      } else if (errorMsg.includes("duplicate key value violates unique constraint \"empresas_email_key\"")) {
        errorMsg = "Esta empresa ya está registrada con este correo. Por favor, intenta iniciar sesión.";
        setIsLogin(true);
      } else if (errorMsg.includes("User already registered")) {
        errorMsg = "Este usuario ya está registrado en la plataforma. Intenta iniciar sesión.";
        setIsLogin(true);
      } else if (errorMsg.includes("Email not confirmed")) {
        // No mostrar como error sino redirigir a la pantalla de confirmación
        setRegistroExitoso(email);
        setLoading(false);
        return;
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
        redirectTo: `${window.location.origin}/auth`,
      });
      if (resetError) throw resetError;
      setSuccess("Se ha enviado un enlace de recuperación a tu correo electrónico.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviarConfirmacion() {
    if (!registroExitoso) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registroExitoso,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
      setSuccess('¡Correo reenviado! Revisa tu bandeja de entrada y la carpeta de spam.');
    } catch (err: any) {
      setError('No se pudo reenviar el correo. Intenta de nuevo en unos minutos.');
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

  // ============================================================
  // PANTALLA DE CONFIRMACIÓN DE EMAIL (después del registro)
  // ============================================================
  if (registroExitoso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="w-full max-w-md">
          <div className="card-glass rounded-2xl p-8 text-center space-y-6">
            {/* Icono animado */}
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-primary/10 border-2 border-primary/40 rounded-full flex items-center justify-center">
                  <Mail size={40} className="text-primary" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-foreground mb-2">Revisa tu correo</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hemos enviado un enlace de activación a:
              </p>
              <div className="mt-3 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-primary font-bold text-sm break-all">{registroExitoso}</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Instrucciones</p>
              <ol className="space-y-1.5 text-sm text-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">1.</span>
                  <span>Abre el correo que te enviamos</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">2.</span>
                  <span>Haz clic en el botón <strong>"Confirmar cuenta"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">3.</span>
                  <span>Vuelve aquí e inicia sesión con tu correo y contraseña</span>
                </li>
              </ol>
            </div>

            {success && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleReenviarConfirmacion}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                Reenviar correo de confirmación
              </button>
              <button
                onClick={() => {
                  setRegistroExitoso(null);
                  setIsLogin(true);
                  setError("");
                  setSuccess("");
                }}
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-bold"
              >
                Ya confirmé mi correo — Iniciar sesión
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Si no ves el correo, revisa la carpeta de <strong>spam</strong> o correo no deseado.
            </p>
          </div>

          <p className="text-center text-slate-500 text-sm mt-6">
            © 2026 CHV Ciberdefensa
          </p>
        </div>
      </div>
    );
  }

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

                  {/* Aviso de confirmación de email */}
                  <div className="flex items-start gap-2.5 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Mail size={16} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Al registrarte, recibirás un <strong className="text-foreground">correo de confirmación</strong>.
                      Debes activar tu cuenta para poder iniciar sesión.
                    </p>
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
