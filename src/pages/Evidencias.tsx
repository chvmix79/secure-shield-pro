import { useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useEmpresa } from "@/hooks/useEmpresa";
import { Upload, FileImage, FileText, Camera, CheckCircle2, X, FolderOpen, Loader2, Link as LinkIcon, ExternalLink, ShieldCheck } from "lucide-react";
import { accionService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const typeIcons: Record<string, any> = {
  imagen: FileImage,
  documento: FileText,
  captura: Camera,
};

const typeColors: Record<string, string> = {
  imagen: "text-primary",
  documento: "text-success",
  captura: "text-risk-medium",
};

export default function Evidencias() {
  const { empresa, acciones, evidencias, createEvidencia } = useEmpresa();
  const [selectedAction, setSelectedAction] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"imagen" | "documento" | "captura">("documento");
  const [dragOver, setDragOver] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeActions = acciones; // Show all actions so users can link evidence to pending ones

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  async function handleUpload() {
    if (!selectedAction) {
      toast.error('Selecciona una acción relacionada');
      return;
    }
    
    if (uploadMode === 'file' && !file) {
      toast.error('Selecciona un archivo para subir');
      return;
    }
    if (uploadMode === 'url' && (!externalUrl || !externalUrl.startsWith('http'))) {
      toast.error('Ingresa un enlace válido (por ejemplo, https://onedrive.com/...)');
      return;
    }
    
    setLoading(true);
    try {
      let archivo_url = externalUrl;
      let finalTitle = `evidencia_${type}_${Date.now()}`;

      if (uploadMode === 'file' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${empresa?.id || 'global'}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('evidencias')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('evidencias')
          .getPublicUrl(fileName);
          
        archivo_url = publicUrlData.publicUrl;
        finalTitle = file.name;
      }

      await createEvidencia({
        accion_id: selectedAction,
        titulo: finalTitle.substring(0, 100),
        tipo: type,
        notas: notes || "Sin notas",
        archivo_url: archivo_url,
      });

      // Automatically mark the action as completed
      try {
        await accionService.updateStatus(selectedAction, 'completada');
      } catch (err) {
        console.error("Error updating action status:", err);
      }
      
      setSelectedAction("");
      setNotes("");
      setFile(null);
      setExternalUrl("");
      setShowForm(false);
      toast.success("Evidencia registrada y guardada exitosamente");
    } catch (error: any) {
      console.error('Error creating evidencia:', error);
      toast.error(error.message || 'Error al subir la evidencia');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Evidencias</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sube archivos locales o enlaza documentos de OneDrive, SharePoint o Google Drive
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-primary-foreground hover:opacity-90 gap-2"
          >
            <Upload size={16} />
            Subir evidencia
          </Button>
        </div>

        {/* Upload form */}
        {showForm && (
          <div className="card-glass rounded-xl p-6 space-y-5 border-primary/20 bg-muted/10 relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary mb-2" size={32} />
                <p className="text-sm font-medium animate-pulse">Subiendo evidencia, por favor espera...</p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Nueva evidencia</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <Tabs value={uploadMode} onValueChange={(val: any) => setUploadMode(val)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file"><Upload size={14} className="mr-2" /> Archivo Local</TabsTrigger>
                <TabsTrigger value="url"><LinkIcon size={14} className="mr-2" /> Enlace Externo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="mt-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                  />
                  
                  {file ? (
                    <div className="space-y-2">
                      <CheckCircle2 size={32} className="mx-auto text-success" />
                      <p className="text-sm font-bold text-success break-all">{file.name}</p>
                      <p className="text-xs text-muted-foreground">Haz clic para cambiar de archivo</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">Haz clic para seleccionar un archivo</p>
                      <p className="text-xs text-muted-foreground">o arrastra tu documento aquí</p>
                      <p className="text-[10px] text-muted-foreground mt-2">Formatos PDF, Word, Excel, JPG, PNG (Max 10MB)</p>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pegar enlace público o compartido</label>
                  <Input 
                    placeholder="https://tu-empresa.sharepoint.com/..." 
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">Pega la URL del documento alojado en SharePoint, Google Drive, OneDrive, etc.</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tipo de evidencia</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["documento", "captura", "imagen"] as const).map((t) => {
                    const Icon = typeIcons[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          type === t ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                        }`}
                      >
                        <Icon size={16} className={cn(type === t ? "text-primary" : "text-muted-foreground", "mx-auto mb-1")} />
                        <p className="text-[10px] font-medium text-foreground capitalize">{t}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Acción de seguridad relacionada</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecciona una acción completada...</option>
                  {activeActions.map((a) => (
                    <option key={a.id} value={a.id}>{a.titulo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Anotaciones u observaciones clave (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Qué prueba exactamente esta evidencia o URL?"
                rows={2}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleUpload}
                disabled={!selectedAction || (uploadMode === 'file' ? !file : !externalUrl)}
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90 gap-2 font-semibold"
              >
                <Upload size={16} />
                Confirmar y Guardar Evidencia
              </Button>
            </div>
          </div>
        )}

        {/* Evidences list */}
        {evidencias.length === 0 ? (
          <div className="card-glass rounded-xl p-12 text-center">
            <FolderOpen size={40} className="mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Aún no hay evidencias subidas</h3>
            <p className="text-sm text-muted-foreground">
              Muestra a los auditores cómo aplicas tus controles vinculando documentos técnicos, políticas o capturas de tu software.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidencias.map((ev) => {
              const Icon = typeIcons[ev.tipo || 'documento'];
              const color = typeColors[ev.tipo || 'documento'];
              const action = acciones.find(a => a.id === ev.accion_id);
              return (
                <div key={ev.id} className="card-glass rounded-xl p-5 border border-primary/10 hover:border-primary/40 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Icon size={20} className={color} />
                    </div>
                    {ev.archivo_url && (
                      <a 
                        href={ev.archivo_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-full flex items-center gap-1 font-medium transition-colors"
                        title="Ver evidencia"
                      >
                        <ExternalLink size={12} /> Abrir prueba
                      </a>
                    )}
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-1 truncate" title={ev.titulo}>{ev.titulo}</p>
                  <p className="text-[11px] text-primary mb-2 line-clamp-1 bg-primary/5 p-1 rounded inline-block">Ref: {action?.titulo || 'Desconocida'}</p>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{ev.notas || 'Sin anotaciones adicionales.'}</p>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[10px] text-muted-foreground/80 font-medium bg-muted px-2 py-0.5 rounded uppercase">{ev.tipo}</span>
                    <span className="text-[10px] text-muted-foreground/80">{new Date(ev.created_at).toLocaleDateString()}</span>
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
