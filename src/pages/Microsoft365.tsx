import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Shield, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ExternalLink, Settings, Server, Key, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/hooks/useEmpresa";

import { msalInstance, loginRequest } from "@/lib/msal";
import { m365Service } from "@/lib/m365Service";
import { toast } from "sonner";

interface M365Config {
  id: string;
  empresa_id: string;
  tenant_id: string | null;
  connected: boolean;
  last_sync: string | null;
  mfa_percentage: number;
  mdm_percentage: number;
  dlp_enabled: boolean;
  score: number;
}

export default function Microsoft365() {
  const { empresa } = useEmpresa();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<M365Config | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadConfig = useCallback(async () => {
    if (!empresa?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('microsoft365_config')
        .select('*')
        .eq('empresa_id', empresa.id)
        .maybeSingle(); // Use maybeSingle to avoid error if no config exists
      
      setConfig(data);
    } catch (error) {
      console.error('Error loading config:', error);
    }
    setLoading(false);
  }, [empresa?.id]);

  useEffect(() => {
    if (empresa?.id) {
      loadConfig();
    }
  }, [empresa?.id, loadConfig]);

  const fetchRealStats = async () => {
    if (!empresa?.id) return;
    setLoading(true);
    try {
      toast.info("Consultando Microsoft Graph...");
      const [score, mfa, mdm] = await Promise.all([
        m365Service.getSecureScore(),
        m365Service.getMfaStats(),
        m365Service.getManagedDevicesStats()
      ]);

      const updateData = {
        connected: true,
        last_sync: new Date().toISOString(),
        score,
        mfa_percentage: mfa,
        mdm_percentage: mdm,
        dlp_enabled: true
      };

      const { data: existing } = await supabase
        .from('microsoft365_config')
        .select('id')
        .eq('empresa_id', empresa.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('microsoft365_config').update(updateData).eq('empresa_id', empresa.id);
      } else {
        await supabase.from('microsoft365_config').insert({ ...updateData, empresa_id: empresa.id });
      }

      await loadConfig();
      setLastRefresh(new Date());
      toast.success("Datos actualizados desde Microsoft 365");
    } catch (error) {
      console.error("Error fetching real stats:", error);
      toast.error("Error al consultar Microsoft Graph. Verifica tus permisos.");
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      msalInstance.setActiveAccount(loginResponse.account);
      toast.success(`Conectado como ${loginResponse.account.username}`);
      await fetchRealStats();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error de autenticación con Microsoft");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    const activeAccount = msalInstance.getActiveAccount();
    if (activeAccount) {
      await fetchRealStats();
    } else {
      await handleConnect();
    }
  };

  const handleDisconnect = async () => {
    if (!empresa?.id) return;
    
    await supabase
      .from('microsoft365_config')
      .update({ connected: false, tenant_id: null })
      .eq('empresa_id', empresa.id);
    
    setConfig(null);
    setTenantId("");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-risk-high";
  };

  if (!config?.connected) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0078d4]/10 flex items-center justify-center">
                <svg viewBox="0 0 21 21" width="28" height="28" className="text-[#0078d4]">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Microsoft 365</h1>
                <p className="text-sm text-muted-foreground">
                  Configuración de seguridad de tu tenant
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="card-glass lg:col-span-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Server size={64} className="text-muted-foreground mb-6" />
                <h2 className="text-xl font-semibold mb-2">Conecta Microsoft 365</h2>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  Conecta tu tenant de Microsoft 365 para analizar la configuración de seguridad 
                  y recibir recomendaciones personalizadas basadas en datos reales de Microsoft Graph.
                </p>
                <Button 
                  onClick={handleConnect} 
                  disabled={loading}
                  className="bg-[#0078d4] hover:bg-[#006cbd]"
                >
                  <ExternalLink size={16} className="mr-2" />
                  {loading ? "Conectando..." : "Conectar con Microsoft"}
                </Button>
              </CardContent>
            </Card>

            <Card className="card-glass border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings size={18} className="text-primary" />
                  Configuración Requerida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Para habilitar la conexión, debes registrar esta aplicación en tu Azure Portal.
                </p>
                <div className="p-3 rounded-md bg-muted/50 border text-xs font-mono break-all space-y-2">
                  <p><span className="text-primary">Redirect URI:</span> {window.location.origin}/microsoft365</p>
                </div>
                <Button variant="outline" className="w-full text-xs" asChild>
                  <a href="/AZURE_SETUP.md" target="_blank">
                    Ver guía de configuración
                    <Link2 size={12} className="ml-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={18} />
                ¿Qué analizamos?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "Autenticación", desc: "MFA, políticas de contraseñas, acceso condicional" },
                  { title: "Dispositivos", desc: "Intune, cifrado, cumplimiento" },
                  { title: "Datos", desc: "DLP, retención, etiquetas de sensibilidad" },
                  { title: "Email", desc: "Anti-phishing, anti-spam, malware" },
                  { title: "Colaboración", desc: "SharePoint, OneDrive, Teams" },
                  { title: "Cumplimiento", desc: "Normativas y auditorías" },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0078d4]/10 flex items-center justify-center">
              <svg viewBox="0 0 21 21" width="28" height="28" className="text-[#0078d4]">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Microsoft 365</h1>
              <p className="text-sm text-muted-foreground">
                Configuración de seguridad de tu tenant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Última verificación: {lastRefresh.toLocaleTimeString()}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin mr-2" : "mr-2"} />
              {loading ? "Sincronizando..." : "Actualizar"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-risk-high hover:text-risk-high hover:bg-risk-high/10">
              Desconectar
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Score Card */}
            <Card className="card-glass">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Puntuación de Seguridad (Secure Score)</p>
                    <p className={cn("text-5xl font-bold mt-1", getScoreColor(config?.score || 0))}>
                      {config?.score || 0}%
                    </p>
                  </div>
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center bg-opacity-10", 
                    config?.score && config.score >= 80 ? "bg-success text-success" : 
                    config?.score && config.score >= 60 ? "bg-warning text-warning" : "bg-risk-high text-risk-high")}>
                    <Shield size={32} />
                  </div>
                </div>
                <Progress value={config?.score || 0} className="mt-6 h-2" />
                <p className="text-xs text-muted-foreground mt-4">
                  Basado en las recomendaciones de Microsoft 365 Security Center para tu tenant.
                </p>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* MFA Progress */}
              <Card className="card-glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Key size={16} className="text-primary" />
                    Registro MFA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{config?.mfa_percentage || 0}%</span>
                    <Badge variant={config?.mfa_percentage && config.mfa_percentage > 90 ? "default" : "outline"}>
                      {config?.mfa_percentage && config.mfa_percentage > 90 ? "Excelente" : "Mejorable"}
                    </Badge>
                  </div>
                  <Progress value={config?.mfa_percentage || 0} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Usuarios con métodos de autenticación fuerte registrados.
                  </p>
                </CardContent>
              </Card>

              {/* MDM Progress */}
              <Card className="card-glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server size={16} className="text-primary" />
                    Cumplimiento dispositivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{config?.mdm_percentage || 0}%</span>
                    <Badge variant={config?.mdm_percentage && config.mdm_percentage > 80 ? "default" : "outline"}>
                      {config?.mdm_percentage && config.mdm_percentage > 80 ? "Seguro" : "Riesgo"}
                    </Badge>
                  </div>
                  <Progress value={config?.mdm_percentage || 0} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Dispositivos gestionados por Intune que cumplen las políticas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="card-glass h-fit">
            <CardHeader>
              <CardTitle className="text-base">Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1"><AlertTriangle size={16} className="text-warning" /></div>
                <div>
                  <p className="text-sm font-medium">Habilitar MFA para todos</p>
                  <p className="text-xs text-muted-foreground">Todavía hay usuarios accediendo solo con contraseña.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1"><AlertTriangle size={16} className="text-warning" /></div>
                <div>
                  <p className="text-sm font-medium">Revisar Acceso Condicional</p>
                  <p className="text-xs text-muted-foreground">Bloquea accesos desde países no permitidos.</p>
                </div>
              </div>
              <Button className="w-full mt-2" variant="outline" size="sm" asChild>
                <a href="https://security.microsoft.com/" target="_blank" rel="noopener noreferrer">
                  Ir a Microsoft Security
                  <ExternalLink size={14} className="ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
