import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Building2, Users, Shield, TrendingUp, ArrowRight, Search, Filter, CheckCircle2, AlertTriangle, Clock, Eye, Pencil, Trash2, X, Plus, ExternalLink, MessageSquare, DollarSign, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANES } from "@/lib/suscripcion";
import { pagoService } from "@/lib/pago";
import { toast } from "sonner";
import { esAdminGlobal } from "@/lib/admin-utils";
import { useEmpresa } from "@/hooks/useEmpresa";
import { PlanDialog } from "@/components/admin/PlanDialog";
import { EmpresaEditDialog } from "@/components/admin/EmpresaEditDialog";
import { ToolDialog } from "@/components/admin/ToolDialog";
import { useAdminData, EmpresaStats, Tool, Lead } from "@/hooks/useAdminData";

interface EmpresaStats {
  id: string;
  nombre: string;
  sector: string;
  email: string;
  diagnosticos_count: number;
  ultimo_diagnostico: string | null;
  score_promedio: number;
  acciones_pendientes: number;
  acciones_completadas: number;
  plan: string;
}

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
  commission_percent: number | null;
}

interface Lead {
  id: string;
  empresa: { nombre: string };
  tipo_servicio: string;
  mensaje: string;
  estado: string;
  created_at: string;
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

export default function Admin() {
  const navigate = useNavigate();
  const { refresh } = useEmpresa();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterSector, setFilterSector] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  
  // Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDialogOpen] = useState(false);
  const [toolDialogOpen, setToolDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaStats | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedEmpresaForPlan, setSelectedEmpresaForPlan] = useState<EmpresaStats | null>(null);

  const { isAdmin: contextIsAdmin } = useEmpresa();
  const isAdmin = contextIsAdmin || esAdminGlobal(localStorage.getItem("user_email"));
  
  const {
    empresas,
    tools,
    leads,
    solicitudes,
    loading,
    setLeads,
    loadEmpresas,
    loadTools,
    loadLeads,
    loadSolicitudes,
    handleAprobarPago,
    handleRechazarPago,
    handleDeleteTool,
    updateLeadStatus,
    handleDeleteEmpresa
  } = useAdminData(isAdmin);

  const handleIrDashboard = (empresaId: string) => {
    localStorage.setItem("empresa_id", empresaId);
    window.location.href = '/dashboard';
  };

  const filteredEmpresas = empresas.filter((emp) => {
    const matchSearch = emp.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      emp.email.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchSector = !filterSector || filterSector === "all" || emp.sector === filterSector;
    return matchSearch && matchSector;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterSector]);

  const totalPages = Math.ceil(filteredEmpresas.length / itemsPerPage);
  const paginatedEmpresas = filteredEmpresas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
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
            <h1 className="text-2xl font-bold text-foreground">Panel de Control Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestión global de la plataforma CHV Ciberdefensa</p>
          </div>
        </div>

        <Tabs defaultValue="empresas" className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="empresas" className="flex items-center gap-2">
              <Building2 size={16} /> Empresas
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <ShoppingBag size={16} /> Marketplace
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <TrendingUp size={16} /> Leads
            </TabsTrigger>
            <TabsTrigger value="pagos" className="flex items-center gap-2">
              <DollarSign size={16} /> Pagos y Suscripciones
              {solicitudes.length > 0 && (
                <Badge className="ml-1 bg-danger text-white hover:bg-danger px-1.5 py-0.5 h-auto text-[10px] rounded-full">
                  {solicitudes.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="empresas" className="space-y-6">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSector} onValueChange={setFilterSector}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todos los sectores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  {Object.entries(sectores).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {paginatedEmpresas.map((emp) => (
                <Card key={emp.id} className="card-glass hover:border-primary/30 transition-all overflow-hidden border-l-4 border-l-primary">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Building2 size={24} />
                        </div>
                          <div className="flex flex-col items-center">
                            <h3 className="font-bold text-foreground leading-tight">{emp.nombre}</h3>
                            <p className="text-xs text-muted-foreground">{emp.email} • {sectores[emp.sector] || emp.sector}</p>
                            <Badge variant="outline" className="mt-1 bg-primary/5 text-primary border-primary/20 capitalize font-bold">
                              Plan {PLANES[emp.plan as keyof typeof PLANES]?.nombre || emp.plan}
                            </Badge>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className={cn("text-xl font-black", emp.score_promedio >= 70 ? "text-success" : emp.score_promedio >= 40 ? "text-warning" : "text-danger")}>
                            {emp.score_promedio}%
                          </p>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">CiberScore</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleIrDashboard(emp.id)} className="h-8">
                            <Eye size={14} className="mr-1" /> Ver Tablero
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedEmpresaForPlan(emp);
                              setPlanDialogOpen(true);
                            }} 
                            className="h-8 border-primary/30 text-primary hover:bg-primary/5"
                          >
                            <Shield size={14} className="mr-1" /> Gestionar Plan
                          </Button>
                          {isAdmin && (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-primary border-primary/30"
                                onClick={() => {
                                  setSelectedEmpresa(emp);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteEmpresa(emp.id, emp.nombre)} className="h-8 w-8 bg-danger/20 text-danger hover:bg-danger/90 hover:text-white border-danger/30">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Mostrando {paginatedEmpresas.length} de {filteredEmpresas.length} empresas (Página {currentPage} de {totalPages})
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Gestión de Herramientas</h2>
              <Button onClick={() => {
                setSelectedTool(null);
                setToolDialogOpen(true);
              }}>
                <Plus size={16} className="mr-2" /> Nueva Herramienta
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(tool => (
                <Card key={tool.id} className="card-glass">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">{tool.logo}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => {
                          setSelectedTool(tool);
                          setToolDialogOpen(true);
                        }}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDeleteTool(tool.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{tool.nombre}</CardTitle>
                    <CardDescription>{tool.categoria}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">{tool.descripcion}</p>
                    {tool.affiliate_link && (
                      <div className="bg-success/10 p-2 rounded text-[10px] flex items-center gap-2">
                        <TrendingUp size={12} className="text-success" />
                        <span className="font-bold text-success">Afiliado: {tool.commission_percent || 0}% comisión</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xl font-bold">
                <TrendingUp className="text-success" />
                Solicitudes de Servicios (Leads)
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <Select defaultValue="all" onValueChange={(v) => {
                  if (v === 'all') loadLeads();
                  else {
                    const filtered = leads.filter(l => l.estado === v);
                    setLeads(filtered);
                  }
                }}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Filtrar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="nuevo">Nuevo</SelectItem>
                    <SelectItem value="contactado">Contactado</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                    <SelectItem value="comision_pagada">Comisión Pagada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-xl overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground font-medium border-b text-left">
                  <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Empresa</th>
                    <th className="p-4">Servicio</th>
                    <th className="p-4">Mensaje</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium">{lead.empresa?.nombre}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                          {lead.tipo_servicio}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs max-w-xs truncate">{lead.mensaje}</td>
                      <td className="p-4">
                        <Badge className={cn(
                          lead.estado === 'nuevo' ? "bg-primary" :
                          lead.estado === 'contactado' ? "bg-warning" :
                          lead.estado === 'cerrado' ? "bg-success" : "bg-success"
                        )}>
                          {lead.estado}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Select value={lead.estado} onValueChange={(v) => updateLeadStatus(lead.id, v)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nuevo">Nuevo</SelectItem>
                            <SelectItem value="contactado">Contactado</SelectItem>
                            <SelectItem value="cerrado">Cerrado / Pago Pendiente</SelectItem>
                            <SelectItem value="comision_pagada">Comisión Pagada ✅</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leads.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">No hay solicitudes todavía.</div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
               {leads.map(lead => (
                 <Card key={lead.id} className="card-glass border-l-4 border-l-purple-500">
                   <CardContent className="p-4 space-y-3">
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="text-[10px] text-muted-foreground">{new Date(lead.created_at).toLocaleString()}</p>
                         <h4 className="font-bold">{lead.empresa?.nombre}</h4>
                       </div>
                       <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                         {lead.tipo_servicio}
                       </Badge>
                     </div>
                     <p className="text-sm text-muted-foreground line-clamp-3 bg-muted/30 p-2 rounded italic">
                       "{lead.mensaje}"
                     </p>
                     <div className="flex items-center justify-between gap-4 pt-2">
                        <Badge className={cn(
                          lead.estado === 'nuevo' ? "bg-primary" :
                          lead.estado === 'contactado' ? "bg-warning" :
                          lead.estado === 'cerrado' ? "bg-success" : "bg-success"
                        )}>
                          {lead.estado}
                        </Badge>
                        <Select value={lead.estado} onValueChange={(v) => updateLeadStatus(lead.id, v)}>
                          <SelectTrigger className="h-8 text-xs w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nuevo">Nuevo</SelectItem>
                            <SelectItem value="contactado">Contactado</SelectItem>
                            <SelectItem value="cerrado">Cerrado</SelectItem>
                            <SelectItem value="comision_pagada">Pagado ✅</SelectItem>
                          </SelectContent>
                        </Select>
                     </div>
                   </CardContent>
                 </Card>
               ))}
               {leads.length === 0 && (
                <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-dashed">No hay solicitudes todavía.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pagos" className="space-y-6">
            <div className="flex items-center gap-2 text-xl font-bold">
              <DollarSign className="text-success" />
              Solicitudes de Pago Pendientes
            </div>

            <div className="grid gap-4">
              {solicitudes.length === 0 ? (
                <Card className="card-glass p-12 text-center">
                  <CheckCircle2 size={40} className="mx-auto text-success mb-3" />
                  <h3 className="font-semibold">No hay pagos pendientes</h3>
                  <p className="text-sm text-muted-foreground">Todas las suscripciones están al día.</p>
                </Card>
              ) : (
                solicitudes.map((sol: any) => {
                  const planInfo = PLANES[sol.plan as keyof typeof PLANES];
                  return (
                    <Card key={sol.id} className="card-glass border-l-4 border-l-success">
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                              <DollarSign size={24} />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{sol.empresas?.nombre}</h3>
                              <p className="text-sm text-muted-foreground">{sol.empresas?.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                                  Plan {planInfo?.nombre}
                                </Badge>
                                <Badge variant="outline" className={cn(
                                  "capitalize font-bold ml-1",
                                  sol.ciclo === 'anual' ? "border-green-500 text-green-600 bg-green-50" : "border-blue-500 text-blue-600 bg-blue-50"
                                )}>
                                  {sol.ciclo || 'mensual'}
                                </Badge>
                                <span className="text-sm font-bold text-success ml-2">${sol.monto.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground">• {sol.metodo}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-muted-foreground">Solicitado el: {new Date(sol.fecha_solicitud).toLocaleDateString()}</span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-danger hover:bg-danger/10 border-danger/20" onClick={() => handleRechazarPago(sol)}>
                                <X size={14} className="mr-1" /> Rechazar
                              </Button>
                              <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleAprobarPago(sol)}>
                                <CheckCircle2 size={14} className="mr-1" /> Aprobar Pago
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        <PlanDialog 
          open={planDialogOpen} 
          onOpenChange={setPlanDialogOpen} 
          empresa={selectedEmpresaForPlan} 
          onSuccess={loadEmpresas} 
        />

        <EmpresaEditDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen} 
          empresa={selectedEmpresa} 
          onSuccess={loadEmpresas} 
        />

        <ToolDialog 
          open={toolDialogOpen} 
          onOpenChange={setToolDialogOpen} 
          tool={selectedTool} 
          onSuccess={loadTools} 
        />
      </div>
    </AppLayout>
  );
}
