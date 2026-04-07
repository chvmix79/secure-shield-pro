import { useState, useEffect, useCallback, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { FileText, Upload, CheckCircle2, AlertCircle, XCircle, Download, Eye, Calendar, Shield, BookOpen, Lock, Key, Server, Users, Bug, FileCheck, Clock, AlertTriangle, Link as LinkIcon, ExternalLink, Loader2, RefreshCw, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useEmpresa } from "@/hooks/useEmpresa";
import { getTemplate, getAllTemplates } from "@/lib/documentTemplates";
import { documentoService } from "@/lib/services";
import { DocumentoCumplimiento } from "@/lib/database.types";
import { toast } from "sonner";

export default function DocumentosCumplimiento() {
  const { empresa } = useEmpresa();
  const [documentos, setDocumentos] = useState<DocumentoCumplimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorTable, setErrorTable] = useState(false);
  
  // Upload States
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocumentos = useCallback(async (showToast = false) => {
    if (!empresa?.id) return;
    setLoading(true);
    console.log("Loading documents for empresa:", empresa.id);
    try {
      const { data, error } = await supabase
        .from('cumplimiento_documentos')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('nombre', { ascending: true });

      if (error) throw error;
      
      setDocumentos(data as DocumentoCumplimiento[]);
      if (showToast) toast.success("Documentos actualizados");
      setErrorTable(false);
    } catch (error: any) {
      console.error("Error loading docs:", error);
      if (error?.code === 'PGRST116' || error?.message?.includes('does not exist') || error?.code === '42P01') {
        setErrorTable(true);
        toast.error("La tabla de documentos no existe o no es accesible.");
      } else {
        toast.error("Error de carga: " + (error?.message || error?.details || "Causa desconocida"));
      }
    } finally {
      setLoading(false);
    }
  }, [empresa?.id]);

  const handleInitialize = async () => {
    if (!empresa?.id) return;
    setLoading(true);
    const tId = toast.loading("Inicializando normas (ISO 27001, GDPR)...");
    try {
      console.log("Starting initialization for:", empresa.id);
      await documentoService.initialize(empresa.id);
      console.log("Initialization complete, reloading...");
      await loadDocumentos();
      toast.success("Normas inicializadas correctamente", { id: tId });
    } catch (error: any) {
      console.error("Init error:", error);
      toast.error("Error en inicialización: " + (error.message || "Error desconocido"), { id: tId });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (id: string, nuevoEstado: any) => {
    try {
      await documentoService.update(id, { estado: nuevoEstado });
      setDocumentos(prev => prev.map(doc => 
        doc.id === id ? { ...doc, estado: nuevoEstado } : doc
      ));
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (docId: string) => {
    if (uploadMode === 'file' && !file) {
      toast.error('Selecciona un archivo primero');
      return;
    }
    if (uploadMode === 'url' && (!externalUrl || !externalUrl.startsWith('http'))) {
      toast.error('Ingresa una URL válida (http/https)');
      return;
    }

    setUploadingId(docId);
    try {
      let archivo_url = externalUrl;

      if (uploadMode === 'file' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${empresa?.id || 'global'}/docs_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('evidencias')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('evidencias')
          .getPublicUrl(fileName);
          
        archivo_url = publicUrlData.publicUrl;
      }

      await documentoService.update(docId, { 
        archivo_url, 
        estado: 'actualizado',
        fecha_subida: new Date().toISOString()
      });
      
      setDocumentos(prev => prev.map(d => 
        d.id === docId ? { ...d, archivo_url, estado: 'actualizado', fecha_subida: new Date().toISOString() } : d
      ));
      
      toast.success("Documento subido y actualizado correctamente");
      setFile(null);
      setExternalUrl("");
      
      // We manually clear the file input
      if (fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (error: any) {
      console.error(error);
      toast.error("Error al subir el documento: " + error.message);
    } finally {
      setUploadingId(null);
    }
  };

  useEffect(() => {
    if (empresa?.id) {
      loadDocumentos();
    }
  }, [empresa?.id, loadDocumentos]);

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "actualizado": return <CheckCircle2 className="text-success" />;
      case "pendiente": return <Clock className="text-warning" />;
      case "obsoleto": return <AlertTriangle className="text-risk-high" />;
      case "faltante": return <XCircle className="text-risk-critical" />;
      default: return <FileText />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "actualizado": return "bg-success/10 text-success border-success/20";
      case "pendiente": return "bg-warning/10 text-warning border-warning/20";
      case "obsoleto": return "bg-risk-high/10 text-risk-high border-risk-high/20";
      case "faltante": return "bg-risk-critical/10 text-risk-critical border-risk-critical/20";
      default: return "bg-muted";
    }
  };

  const stats = {
    total: documentos.length,
    actualizados: documentos.filter(d => d.estado === "actualizado").length,
    pendientes: documentos.filter(d => d.estado === "pendiente").length,
    obsoletos: documentos.filter(d => d.estado === "obsoleto").length,
    faltantes: documentos.filter(d => d.estado === "faltante").length,
  };

  const progress = stats.total > 0 ? Math.round((stats.actualizados / stats.total) * 100) : 0;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileCheck className="text-primary" />
              Cumplimiento Normativo
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona los documentos obligatorios según ISO 27001, GDPR/LGPD y otras normas
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadDocumentos(true)} 
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Sincronizar
            </Button>
            {documentos.length === 0 && !errorTable && (
              <Button 
                size="sm" 
                onClick={handleInitialize} 
                className="gap-2 bg-primary text-white"
                disabled={loading}
              >
                <Plus size={14} />
                Inicializar Normas
              </Button>
            )}
          </div>
        </div>

        {errorTable && (
          <Alert variant="destructive" className="bg-red-950/50 border-red-500/50 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Acción Requerida: Base de Datos Incompleta</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>
                Para activar el módulo de cumplimiento, es necesario crear la tabla 
                <code>cumplimiento_documentos</code> en tu base de datos de Supabase.
              </p>
              <div className="bg-black/40 p-3 rounded-md border border-white/10 text-xs font-mono">
                1. Abre tu panel de Supabase<br/>
                2. Ve a la sección "SQL Editor"<br/>
                3. Abre el archivo <code>setup_database.sql</code> en este proyecto<br/>
                4. Copia el contenido y ejecútalo en el editor de Supabase.
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Ya lo he ejecutado, reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Card */}
        <Card className="card-glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Documentación completa</p>
                <p className="text-2xl font-bold text-foreground">{progress}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-success font-medium">{stats.actualizados} documentos</p>
                <p className="text-xs text-muted-foreground">de {stats.total} requeridos</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="card-glass">
            <CardContent className="pt-4 pb-2 text-center">
              <CheckCircle2 className="mx-auto text-success mb-1" size={24} />
              <p className="text-xl font-bold text-success">{stats.actualizados}</p>
              <p className="text-xs text-muted-foreground">Actualizados</p>
            </CardContent>
          </Card>
          <Card className="card-glass">
            <CardContent className="pt-4 pb-2 text-center">
              <Clock className="mx-auto text-warning mb-1" size={24} />
              <p className="text-xl font-bold text-warning">{stats.pendientes}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
          <Card className="card-glass">
            <CardContent className="pt-4 pb-2 text-center">
              <AlertTriangle className="mx-auto text-risk-high mb-1" size={24} />
              <p className="text-xl font-bold text-risk-high">{stats.obsoletos}</p>
              <p className="text-xs text-muted-foreground">Obsoletos</p>
            </CardContent>
          </Card>
          <Card className="card-glass">
            <CardContent className="pt-4 pb-2 text-center">
              <XCircle className="mx-auto text-risk-critical mb-1" size={24} />
              <p className="text-xl font-bold text-risk-critical">{stats.faltantes}</p>
              <p className="text-xs text-muted-foreground">Faltantes</p>
            </CardContent>
          </Card>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {documentos.map((doc) => (
            <Card key={doc.id} className={`card-glass hover:border-primary/30 transition-all ${doc.estado === 'faltante' ? 'border-risk-critical/30' : ''}`}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEstadoColor(doc.estado)}`}>
                      {getEstadoIcon(doc.estado)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground">{doc.nombre}</h3>
                        <Badge variant="outline" className="text-xs">{doc.categoria}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{doc.descripcion}</p>
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <BookOpen size={12} />
                        {doc.norma}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {doc.archivo_url && (
                      <a 
                        href={doc.archivo_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-md flex items-center gap-1 font-medium transition-colors"
                        title="Ver evidencia"
                      >
                        <ExternalLink size={14} /> Abrir
                      </a>
                    )}
                    <Dialog onOpenChange={(open) => {
                      if(!open) {
                        setFile(null);
                        setExternalUrl("");
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          {doc.estado === "faltante" ? <Upload size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
                          {doc.estado === "faltante" ? "Subir" : "Gestionar"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>{doc.nombre}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Shield size={14} className="text-primary" />
                              Requisitos según {doc.norma}
                            </h4>
                            <p className="text-sm text-muted-foreground">{doc.descripcion}</p>
                          </div>
                          
                          <div>
                            <Label>Estado del documento</Label>
                            <Select 
                              defaultValue={doc.estado}
                              onValueChange={(v) => handleUpdateEstado(doc.id, v as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="actualizado">✓ Actualizado</SelectItem>
                                <SelectItem value="pendiente">En revisión</SelectItem>
                                <SelectItem value="obsoleto">⚠️ Obsoleto</SelectItem>
                                <SelectItem value="faltante">✗ No existe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="bg-card border rounded-lg p-4 space-y-4">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Upload size={16} className="text-primary" />
                              Adjuntar Evidencia o Documento Final
                            </h4>
                            
                            <Tabs value={uploadMode} onValueChange={(val: any) => setUploadMode(val)} className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="file"><FileText size={14} className="mr-2" /> Archivo Local</TabsTrigger>
                                <TabsTrigger value="url"><LinkIcon size={14} className="mr-2" /> Enlace Externo</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="file" className="mt-4">
                                <div
                                  onClick={() => fileInputRef.current?.click()}
                                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer border-border hover:border-primary/50`}
                                >
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                  />
                                  
                                  {file ? (
                                    <div className="space-y-2">
                                      <CheckCircle2 size={24} className="mx-auto text-success" />
                                      <p className="text-sm font-bold text-success break-all">{file.name}</p>
                                    </div>
                                  ) : (
                                    <>
                                      <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                                      <p className="text-sm font-medium text-foreground mb-1">Clic para seleccionar archivo</p>
                                      <p className="text-xs text-muted-foreground">PDF, Word, Excel (Max 10MB)</p>
                                    </>
                                  )}
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="url" className="mt-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Pegar enlace público o compartido</Label>
                                  <Input 
                                    placeholder="https://tu-empresa.sharepoint.com/..." 
                                    value={externalUrl}
                                    onChange={(e) => setExternalUrl(e.target.value)}
                                  />
                                  <p className="text-xs text-muted-foreground">Pega la URL del documento alojado en SharePoint, Google Drive, OneDrive, etc.</p>
                                </div>
                              </TabsContent>
                            </Tabs>

                            <Button 
                              onClick={() => handleUploadSubmit(doc.id)} 
                              disabled={uploadingId === doc.id || (uploadMode === 'file' ? !file : !externalUrl)}
                              className="w-full gap-2"
                            >
                              {uploadingId === doc.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16}/>}
                              Adjuntar Documento
                            </Button>
                            
                            {doc.archivo_url && (
                              <p className="text-xs text-success text-center mt-2 flex items-center justify-center gap-1">
                                <CheckCircle2 size={12}/> Este requisito ya cuenta con un documento anexado.
                              </p>
                            )}
                          </div>

                          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                            <h4 className="font-medium text-primary text-sm mb-3 flex items-center gap-2">
                              <Download size={16} />
                              Plantillas de Referencia
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              Descarga modelos estándar para adaptar a tu empresa y cumplir este requisito más fácilmente.
                            </p>
                            <div className="flex flex-col gap-2">
                              {getAllTemplates().map((t) => (
                                <Button 
                                  key={t.key} 
                                  variant="outline" 
                                  size="sm"
                                  className="justify-start text-left"
                                  onClick={() => {
                                    const template = getTemplate(t.key);
                                    if (template) {
                                      const blob = new Blob([template.contenido], { type: 'text/plain' });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `${t.nombre.replace(/\s+/g, '_')}.txt`;
                                      a.click();
                                    }
                                  }}
                                >
                                  <FileText size={14} className="mr-2 shrink-0" />
                                  <span className="truncate">Descargar: {t.nombre}</span>
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {documentos.length === 0 && !loading && !errorTable && (
          <div className="card-glass rounded-xl p-12 text-center border-dashed border-2 border-white/10">
            <FileText size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-white">Sin requisitos cargados</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
              No hemos encontrado requisitos de cumplimiento para esta empresa. 
              Presiona el botón para cargar los modelos estándar (ISO 27001, GDPR).
            </p>
            <Button 
              onClick={handleInitialize} 
              disabled={loading}
              className="mt-6 gap-2 bg-primary text-white hover:bg-primary/90"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Cargar Requisitos Estándar
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
