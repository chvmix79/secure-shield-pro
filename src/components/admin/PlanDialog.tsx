import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { PLANES, suscripcionService } from "@/lib/suscripcion";
import { toast } from "sonner";
import { useEmpresa } from "@/hooks/useEmpresa";

interface EmpresaStats {
  id: string;
  nombre: string;
  plan: string;
}

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: EmpresaStats | null;
  onSuccess: () => void;
}

export function PlanDialog({ open, onOpenChange, empresa, onSuccess }: PlanDialogProps) {
  const { refresh } = useEmpresa();
  const [planForm, setPlanForm] = useState({ plan: "free", duration: "30" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (empresa) {
      setPlanForm({ plan: empresa.plan || "free", duration: "30" });
    }
  }, [empresa]);

  const handleUpdatePlan = async () => {
    if (!empresa) return;
    setLoading(true);
    
    const diasContratados = parseInt(planForm.duration);
    const fechaFinEfectiva = new Date();
    // Suma 2 días de gracia automáticamente
    fechaFinEfectiva.setDate(fechaFinEfectiva.getDate() + diasContratados + 2);

    const fmt = (d: Date) => d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

    try {
      await suscripcionService.upgradePlan(
        empresa.id,
        planForm.plan as any,
        diasContratados
      );
      toast.success(
        `✅ Plan ${PLANES[planForm.plan as keyof typeof PLANES]?.nombre} activado para ${empresa.nombre}. Acceso total hasta el ${fmt(fechaFinEfectiva)} (Incluye ${diasContratados} días contratados + 2 de gracia).`,
        { duration: 6000 }
      );
      refresh(); // Sincroniza el contexto global
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error("Error: " + (error.message || "Error al actualizar el plan"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar Plan para {empresa?.nombre}</DialogTitle>
          <DialogDescription>
            Cambia el plan de suscripción y la duración del acceso.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Seleccionar Plan</Label>
            <Select value={planForm.plan} onValueChange={v => setPlanForm({...planForm, plan: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Prueba Gratis (Limitado)</SelectItem>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="pro">Profesional (Full)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Duración (días)</Label>
            <Select value={planForm.duration} onValueChange={v => setPlanForm({...planForm, duration: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 días (Express)</SelectItem>
                <SelectItem value="30">30 días (Mes)</SelectItem>
                <SelectItem value="90">90 días (Trimestre)</SelectItem>
                <SelectItem value="365">365 días (Año)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {planForm.plan !== 'free' && (() => {
            const hoy = new Date();
            const diasContratados = parseInt(planForm.duration);
            const fin = new Date();
            fin.setDate(fin.getDate() + diasContratados + 2);
            const fmt = (d: Date) => d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
            return (
              <div className="bg-muted/60 rounded-lg p-3 space-y-1.5 border border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Vista previa de acceso</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span className="font-bold text-foreground">{fmt(hoy)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-border pt-1.5 mt-1">
                  <span className="text-muted-foreground font-bold">Bloqueo Definitivo:</span>
                  <span className="font-bold text-danger">{fmt(fin)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 italic">
                  * El acceso incluye {diasContratados} días de suscripción + 2 días de gracia.
                </p>
              </div>
            );
          })()}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleUpdatePlan} disabled={loading} className="bg-success hover:bg-success/90">
            <CheckCircle2 size={14} className="mr-2" /> {loading ? "Actualizando..." : "Actualizar Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
