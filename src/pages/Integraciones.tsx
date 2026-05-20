import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useEmpresa } from "@/hooks/useEmpresa";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Webhook,
  Copy,
  RefreshCw,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Shield,
  Server,
  Zap,
  Link as LinkIcon,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegracionWebhook {
  id: string;
  empresa_id: string;
  proveedor: string;
  secret_token: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

const PROVEEDORES = [
  { value: "wazuh", label: "Wazuh", icon: "🛡️", description: "SIEM & XDR Open Source" },
  { value: "crowdstrike", label: "CrowdStrike", icon: "🦅", description: "Endpoint Detection & Response" },
  { value: "sentinelone", label: "SentinelOne", icon: "🤖", description: "AI-Powered Security" },
  { value: "fortinet", label: "Fortinet", icon: "🔒", description: "Firewall & Network Security" },
  { value: "sophos", label: "Sophos", icon: "🔵", description: "Endpoint & Network Protection" },
  { value: "custom", label: "Personalizado", icon: "⚙️", description: "Cualquier sistema con Webhooks" },
];

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "chv_wh_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function Integraciones() {
  const { empresa } = useEmpresa();
  const [integraciones, setIntegraciones] = useState<IntegracionWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState<Record<string, boolean>>({});

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const webhookBaseUrl = `${supabaseUrl}/functions/v1/webhook-receptor`;

  useEffect(() => {
    if (empresa?.id) fetchIntegraciones();
  }, [empresa?.id]);

  async function fetchIntegraciones() {
    setLoading(true);
    const { data, error } = await supabase
      .from("integraciones_webhook")
      .select("*")
      .eq("empresa_id", empresa!.id)
      .order("created_at", { ascending: false });

    if (!error && data) setIntegraciones(data);
    setLoading(false);
  }

  async function crearIntegracion() {
    if (!selectedProveedor || !empresa?.id) return;
    setCreating(true);
    const token = generateToken();
    const { error } = await supabase.from("integraciones_webhook").insert({
      empresa_id: empresa.id,
      proveedor: selectedProveedor,
      secret_token: token,
      activo: true,
    });

    if (error) {
      toast.error("Error al crear la integración");
      console.error(error);
    } else {
      toast.success("Integración creada exitosamente");
      setShowForm(false);
      setSelectedProveedor("");
      fetchIntegraciones();
    }
    setCreating(false);
  }

  async function toggleActivo(id: string, activo: boolean) {
    const { error } = await supabase
      .from("integraciones_webhook")
      .update({ activo: !activo, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      toast.success(activo ? "Integración desactivada" : "Integración activada");
      fetchIntegraciones();
    }
  }

  async function regenerarToken(id: string) {
    const newToken = generateToken();
    const { error } = await supabase
      .from("integraciones_webhook")
      .update({ secret_token: newToken, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      toast.success("Token regenerado. Actualiza la URL en tu sistema externo.");
      fetchIntegraciones();
    }
  }

  async function eliminarIntegracion(id: string) {
    const { error } = await supabase.from("integraciones_webhook").delete().eq("id", id);
    if (!error) {
      toast.success("Integración eliminada");
      fetchIntegraciones();
    }
  }

  function copiarUrl(token: string) {
    const url = `${webhookBaseUrl}?token=${token}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copiada al portapapeles");
  }

  function toggleTokenVisibility(id: string) {
    setVisibleTokens((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const getProveedorInfo = (value: string) =>
    PROVEEDORES.find((p) => p.value === value) || PROVEEDORES[PROVEEDORES.length - 1];

  if (!empresa) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-muted-foreground">
          Registra una empresa primero para configurar integraciones.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Webhook size={22} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Integraciones & Webhooks</h1>
                <p className="text-sm text-muted-foreground">
                  Conecta tus herramientas de seguridad para recibir alertas automáticas
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-primary-foreground hover:opacity-90 gap-2"
          >
            <Plus size={16} />
            Nueva Integración
          </Button>
        </div>

        {/* How it works */}
        <div className="card-glass rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            ¿Cómo funciona?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Crea una integración",
                desc: "Selecciona tu proveedor de seguridad (Wazuh, CrowdStrike, etc.)",
              },
              {
                step: "2",
                title: "Copia la URL del Webhook",
                desc: "Configúrala en tu sistema externo como destino de alertas",
              },
              {
                step: "3",
                title: "Recibe alertas automáticas",
                desc: "Las alertas aparecerán al instante en tu panel de CHV Ciberdefensa",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="card-glass rounded-xl p-5 border-primary/30 animate-fade-in space-y-4">
            <h3 className="font-semibold text-foreground">Selecciona el proveedor de seguridad</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PROVEEDORES.map((prov) => (
                <button
                  key={prov.value}
                  onClick={() => setSelectedProveedor(prov.value)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    selectedProveedor === prov.value
                      ? "bg-primary/10 border-primary text-foreground"
                      : "bg-muted/40 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  <span className="text-2xl">{prov.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{prov.label}</p>
                    <p className="text-xs text-muted-foreground">{prov.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={crearIntegracion}
                disabled={!selectedProveedor || creating}
                className="bg-primary text-primary-foreground hover:opacity-90 gap-2"
              >
                {creating ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                Crear Integración
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* List of integrations */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground animate-pulse">
            Cargando integraciones...
          </div>
        ) : integraciones.length === 0 ? (
          <div className="card-glass rounded-xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Server size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No tienes integraciones configuradas aún.</p>
            <p className="text-sm text-muted-foreground">
              Haz clic en "Nueva Integración" para conectar tu primera herramienta de seguridad.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {integraciones.map((integ) => {
              const prov = getProveedorInfo(integ.proveedor);
              const tokenVisible = visibleTokens[integ.id];
              const webhookUrl = `${webhookBaseUrl}?token=${integ.secret_token}`;

              return (
                <div
                  key={integ.id}
                  className={cn(
                    "card-glass rounded-xl p-5 space-y-4 transition-all",
                    !integ.activo && "opacity-60"
                  )}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{prov.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{prov.label}</h4>
                          {integ.activo ? (
                            <span className="flex items-center gap-1 text-xs text-success font-medium">
                              <CheckCircle2 size={12} /> Activo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-danger font-medium">
                              <XCircle size={12} /> Inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Creado: {new Date(integ.created_at).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActivo(integ.id, integ.activo)}
                        className={cn(
                          "gap-1 text-xs",
                          integ.activo
                            ? "text-warning border-warning/50"
                            : "text-success border-success/50"
                        )}
                      >
                        {integ.activo ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => regenerarToken(integ.id)}
                        className="gap-1 text-xs text-muted-foreground"
                      >
                        <RefreshCw size={12} />
                        Regenerar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarIntegracion(integ.id)}
                        className="gap-1 text-xs text-danger border-danger/50"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>

                  {/* URL and Token */}
                  <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                        <LinkIcon size={12} className="inline mr-1" />
                        URL del Webhook (copia esto en tu sistema de seguridad)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={webhookUrl}
                          className="bg-background text-xs font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copiarUrl(integ.secret_token)}
                          className="gap-1 shrink-0"
                        >
                          <Copy size={14} />
                          Copiar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                        <Shield size={12} className="inline mr-1" />
                        Token de Seguridad
                      </label>
                      <div className="flex gap-2 items-center">
                        <code className="text-xs bg-background px-3 py-2 rounded border border-border flex-1 font-mono">
                          {tokenVisible
                            ? integ.secret_token
                            : "••••••••••••••••••••••••••••••••••••"}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTokenVisibility(integ.id)}
                        >
                          {tokenVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Payload format */}
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer hover:text-foreground transition-colors font-medium">
                      📋 Formato del payload esperado (JSON)
                    </summary>
                    <pre className="mt-2 bg-background p-3 rounded-lg border border-border overflow-x-auto font-mono">
{`POST ${webhookBaseUrl}?token=TU_TOKEN
Content-Type: application/json

{
  "title": "Malware detectado en servidor-01",
  "description": "Se ha detectado el archivo trojan.exe en C:/temp/",
  "severity": "critical"
}`}
                    </pre>
                  </details>
                </div>
              );
            })}
          </div>
        )}

        {/* Security note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
          <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Nota de seguridad</p>
            <p className="text-xs text-muted-foreground">
              No compartas tus tokens públicamente. Cada token es único para tu empresa y permite
              recibir alertas directamente en tu panel. Si sospechas que un token ha sido comprometido,
              regenera uno nuevo inmediatamente.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
