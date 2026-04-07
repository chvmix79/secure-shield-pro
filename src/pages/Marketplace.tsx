import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Shield, Star, Search, ExternalLink, DollarSign, TrendingUp, Copy, CheckCircle2, Users, MessageSquare, Briefcase, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/hooks/useEmpresa";
import { toast } from "sonner";

interface Tool {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: string;
  sitio_web: string;
  tier: string;
  logo: string;
  affiliate_link: string | null;
  affiliate_id: string | null;
  commission_percent: number | null;
  payout_min: number | null;
}

const defaultCategories = [
  "Gestión de Contraseñas",
  "Protección Web",
  "2FA",
  "Monitoreo",
  "Vulnerabilidades",
  "Email Seguro",
  "Antivirus",
  "Productividad",
  "VPN",
  "CRM",
  "Hosting",
  "Cloud",
  "Email Marketing",
  "Servicios y Consultoría"
];

const mockServices = [
  {
    id: "serv-iso27001",
    nombre: "Implementación ISO 27001",
    descripcion: "Asesoría experta para certificar tu empresa bajo el estándar internacional de seguridad de la información.",
    categoria: "Servicios y Consultoría",
    precio: "Desde $1,500 USD",
    logo: "📋",
    tier: "service"
  },
  {
    id: "serv-pentest",
    nombre: "Penetration Testing (Ethical Hacking)",
    descripcion: "Pruebas de intrusión reales para identificar brechas de seguridad antes de que los atacantes las encuentren.",
    categoria: "Servicios y Consultoría",
    precio: "Desde $800 USD",
    logo: "🛡️",
    tier: "service"
  },
  {
    id: "serv-legal",
    nombre: "Adecuación Legal (GDPR/Habeas Data)",
    descripcion: "Asegura el cumplimiento normativo en protección de datos personales para evitar multas millonarias.",
    categoria: "Servicios y Consultoría",
    precio: "Desde $500 USD",
    logo: "⚖️",
    tier: "service"
  }
];

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const { empresa, isAdmin } = useEmpresa();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Lead Modal States
  const [selectedItemForLead, setSelectedItemForLead] = useState<Tool | null>(null);
  const [leadMessage, setLeadMessage] = useState("");
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    setLoading(true);
    const { data } = await supabase.from("herramientas").select("*").order("nombre");
    // Mix with local services for demonstration if they don't exist in DB yet
    const combinedData = [...(data || []), ...mockServices];
    setTools(combinedData as Tool[]);
    setLoading(false);
  };

  const categories = ["Todos", ...new Set([...defaultCategories, ...tools.map(t => t.categoria).filter(Boolean)])];

  const filteredTools = tools.filter(tool => {
    const matchSearch = !search || 
      tool.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      tool.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
      tool.categoria?.toLowerCase().includes(search.toLowerCase());
    const matchTier = !tierFilter || tool.tier === tierFilter;
    const matchCategory = selectedCategory === "Todos" || tool.categoria === selectedCategory;
    return matchSearch && matchTier && matchCategory;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free": return "bg-success/10 text-success border-success/20";
      case "paid": return "bg-primary/10 text-primary border-primary/20";
      case "freemium": return "bg-warning/10 text-warning border-warning/20";
      case "service": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getUrl = (tool: Tool) => {
    if (tool.affiliate_link) return tool.affiliate_link;
    return tool.sitio_web;
  };

  const hasCommission = (tool: Tool) => {
    return tool.affiliate_link && tool.commission_percent && tool.commission_percent > 0;
  };

  const handleRequestQuote = (item: Tool) => {
    setSelectedItemForLead(item);
    setIsLeadModalOpen(true);
  };

  const submitLead = async () => {
    if (!empresa?.id || !selectedItemForLead) return;
    
    setSubmittingLead(true);
    try {
      const { error } = await supabase.from("leads_marketplace").insert({
        empresa_id: empresa.id,
        herramienta_id: selectedItemForLead.tier !== 'service' ? selectedItemForLead.id : null,
        tipo_servicio: selectedItemForLead.nombre,
        mensaje: leadMessage,
        estado: 'nuevo'
      });

      if (error) throw error;

      toast.success("Solicitud enviada correctamente. Un experto te contactará pronto.");
      setIsLeadModalOpen(false);
      setLeadMessage("");
    } catch (error) {
      toast.error("Error al enviar la solicitud.");
    }
    setSubmittingLead(false);
  };

  const copyAffiliateLink = async (tool: Tool) => {
    const url = getUrl(tool);
    await navigator.clipboard.writeText(url);
    setCopiedId(tool.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Cargando Marketplace...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="text-primary" />
              Marketplace Pro
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Herramientas de seguridad y servicios de consultoría experta con beneficios exclusivos.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-success/10 text-success">Software</Badge>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600">Servicios</Badge>
          </div>
        </div>

        <Card className="card-glass border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-primary shrink-0" size={24} />
              <div>
                <p className="font-medium text-foreground">Tu Aliado en Crecimiento</p>
                <p className="text-sm text-muted-foreground">
                  Al adquirir herramientas o contratar servicios a través de este portal, estás apoyando el mantenimiento de esta plataforma gratuita y asegurando comisiones que revierten en mejoras de seguridad para tu empresa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="¿Qué herramienta o servicio buscas?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={tierFilter === null ? "default" : "outline"} size="sm" onClick={() => setTierFilter(null)}>
              Todos
            </Button>
            <Button variant={tierFilter === "service" ? "default" : "outline"} size="sm" onClick={() => setTierFilter("service")}>
              <Briefcase size={14} className="mr-1" /> Servicios
            </Button>
            <Button variant={tierFilter === "paid" ? "default" : "outline"} size="sm" onClick={() => setTierFilter("paid")}>
              Premium
            </Button>
          </div>
        </div>

        <Tabs defaultValue="explorar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="explorar">Explorar</TabsTrigger>
            <TabsTrigger value="servicios">Servicios Expertos</TabsTrigger>
            {isAdmin && <TabsTrigger value="comision">Ofertas de Afiliados (Sólo Admin)</TabsTrigger>}
          </TabsList>

          <TabsContent value="explorar" className="space-y-4">
            <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap rounded-full px-4"
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool) => (
                <Card key={tool.id} className="card-glass hover:border-primary/40 transition-all group flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl group-hover:scale-110 transition-transform">{tool.logo || "🛠️"}</div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getTierColor(tool.tier)}>
                          {tool.tier === "service" ? "Consultoría" : tool.tier === "free" ? "Gratis" : tool.tier === "freemium" ? "Freemium" : "Premium"}
                        </Badge>
                        {isAdmin && hasCommission(tool) && (
                          <Badge variant="outline" className="bg-warning/10 text-warning text-[10px] font-bold tracking-tight">
                            BENEFICIO EXCLUSIVO
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2 font-bold">{tool.nombre}</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wider font-medium opacity-70">{tool.categoria}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{tool.descripcion}</p>
                    {tool.precio && (
                      <p className="text-sm font-extrabold text-primary mt-3 flex items-center gap-1">
                        <DollarSign size={14} /> {tool.precio}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-3 border-t bg-muted/5 flex flex-col gap-2">
                    {tool.tier === 'service' ? (
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm" onClick={() => handleRequestQuote(tool)}>
                        <MessageSquare size={14} className="mr-1" /> Solicitar Presupuesto
                      </Button>
                    ) : (
                      <Button className="w-full" size="sm" asChild>
                        <a href={getUrl(tool)} target="_blank" rel="noopener noreferrer">
                          {isAdmin && hasCommission(tool) ? 'Comprar con Oferta' : 'Visitar Sitio'} <ExternalLink size={14} className="ml-1" />
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="servicios" className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.filter(t => t.tier === "service").map((tool) => (
                <Card key={tool.id} className="card-glass border-purple-500/20 bg-purple-500/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl">{tool.logo}</div>
                      <Badge className="bg-purple-500/10 text-purple-600">Servicio Experto</Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{tool.nombre}</CardTitle>
                    <CardDescription className="text-xs">{tool.categoria}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{tool.descripcion}</p>
                    <p className="text-sm font-bold text-purple-600 mt-3">{tool.precio}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm" onClick={() => handleRequestQuote(tool)}>
                      Consultar con el equipo <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comision" className="space-y-4">
            {tools.filter(hasCommission).length === 0 ? (
              <Card className="card-glass">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp size={48} className="text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">Próximamente beneficios exclusivos</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md"> estamos negociando descuentos y beneficios con plataformas líderes en ciberseguridad para ti.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.filter(hasCommission).map((tool) => (
                   <Card key={tool.id} className="card-glass border-orange-500/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="text-4xl">{tool.logo}</div>
                        <Badge className="bg-orange-500/10 text-orange-600">OFERTA AFILIADO</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{tool.nombre}</CardTitle>
                      <CardDescription className="text-xs">{tool.categoria}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{tool.descripcion}</p>
                      <p className="text-xs text-orange-600 font-bold mt-3">¡Hasta un {tool.commission_percent}% de descuento con este enlace!</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700" size="sm" asChild>
                        <a href={getUrl(tool)} target="_blank" rel="noopener noreferrer">
                          Activar Beneficio <TrendingUp size={14} className="ml-1" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Request Lead Dialog */}
        <Dialog open={isLeadModalOpen} onOpenChange={setIsLeadModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="text-purple-600" />
                Interés en {selectedItemForLead?.nombre}
              </DialogTitle>
              <CardDescription>
                Cuéntanos brevemente cuáles son tus necesidades y un experto en ciberseguridad te contactará para una consultoría personalizada.
              </CardDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Empresa solicitante</label>
                <Input value={empresa?.nombre || ''} disabled readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">¿En qué podemos ayudarte?</label>
                <Textarea 
                  placeholder="Ej: Necesitamos certificar la ISO 27001 para finales de año en nuestra sucursal de Madrid..." 
                  value={leadMessage}
                  onChange={e => setLeadMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={() => setIsLeadModalOpen(false)}>Cancelar</Button>
              <Button 
                onClick={submitLead} 
                disabled={!leadMessage || submittingLead} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                {submittingLead ? "Enviando..." : "Enviar Solicitud"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
