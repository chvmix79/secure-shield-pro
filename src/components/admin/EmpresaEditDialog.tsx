import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useEmpresa } from "@/hooks/useEmpresa";

interface EmpresaStats {
  id: string;
  nombre: string;
  sector: string;
  email: string;
}

interface EmpresaEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: EmpresaStats | null;
  onSuccess: () => void;
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

export function EmpresaEditDialog({ open, onOpenChange, empresa, onSuccess }: EmpresaEditDialogProps) {
  const { refresh } = useEmpresa();
  const [editForm, setEditForm] = useState({ nombre: "", sector: "", email: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (empresa) {
      setEditForm({
        nombre: empresa.nombre || "",
        sector: empresa.sector || "",
        email: empresa.email || ""
      });
    }
  }, [empresa]);

  const handleSaveEmpresa = async () => {
    if (!empresa) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("empresas")
        .update(editForm)
        .eq("id", empresa.id);
        
      if (error) throw error;
      toast.success("Empresa actualizada correctamente correctamente");
      refresh(); // Sincroniza el contexto
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Error al actualizar la empresa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Empresa: {empresa?.nombre}</DialogTitle>
          <DialogDescription>
            Actualiza la información básica de la organización.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre de la Empresa</Label>
            <Input value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Sector</Label>
            <Select value={editForm.sector} onValueChange={v => setEditForm({...editForm, sector: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(sectores).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Email de Contacto</Label>
            <Input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSaveEmpresa} disabled={loading}>{loading ? "Guardando..." : "Guardar Cambios"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
