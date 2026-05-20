import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
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
  commission_percent: number | null;
}

interface ToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: Tool | null;
  onSuccess: () => void;
}

export function ToolDialog({ open, onOpenChange, tool, onSuccess }: ToolDialogProps) {
  const [toolForm, setToolForm] = useState<Partial<Tool>>({
    nombre: "",
    descripcion: "",
    categoria: "General",
    precio: "",
    sitio_web: "",
    tier: "free",
    logo: "🛠️",
    affiliate_link: "",
    commission_percent: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tool) {
      setToolForm(tool);
    } else {
      setToolForm({
        nombre: "",
        descripcion: "",
        categoria: "General",
        precio: "",
        sitio_web: "",
        tier: "free",
        logo: "🛠️",
        affiliate_link: "",
        commission_percent: 0
      });
    }
  }, [tool, open]);

  const handleSaveTool = async () => {
    setLoading(true);
    try {
      if (tool) {
        const { error } = await supabase
          .from("herramientas")
          .update(toolForm)
          .eq("id", tool.id);
        if (error) throw error;
        toast.success("Herramienta actualizada");
      } else {
        const { error } = await supabase
          .from("herramientas")
          .insert(toolForm);
        if (error) throw error;
        toast.success("Herramienta creada");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Error al guardar herramienta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{tool ? "Editar Herramienta" : "Nueva Herramienta"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={toolForm.nombre} onChange={e => setToolForm({...toolForm, nombre: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Input value={toolForm.categoria} onChange={e => setToolForm({...toolForm, categoria: e.target.value})} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Descripción</Label>
            <Textarea value={toolForm.descripcion} onChange={e => setToolForm({...toolForm, descripcion: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Precio (Texto)</Label>
            <Input value={toolForm.precio} onChange={e => setToolForm({...toolForm, precio: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Tier</Label>
            <Select value={toolForm.tier} onValueChange={v => setToolForm({...toolForm, tier: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Gratis</SelectItem>
                <SelectItem value="freemium">Freemium</SelectItem>
                <SelectItem value="paid">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Enlace de Afiliado (Importante)</Label>
            <Input placeholder="https://..." value={toolForm.affiliate_link || ''} onChange={e => setToolForm({...toolForm, affiliate_link: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>% Comisión Esperada</Label>
            <Input type="number" value={toolForm.commission_percent || 0} onChange={e => setToolForm({...toolForm, commission_percent: parseFloat(e.target.value) || 0})} />
          </div>
          <div className="space-y-2">
            <Label>Logo / Emoji</Label>
            <Input value={toolForm.logo || ''} onChange={e => setToolForm({...toolForm, logo: e.target.value})} />
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2 px-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSaveTool} disabled={loading}>{loading ? "Guardando..." : "Guardar Cambios"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
