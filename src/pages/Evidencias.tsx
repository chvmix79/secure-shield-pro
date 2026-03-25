import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { mockActions } from "@/lib/cybersecurity-data";
import { Upload, FileImage, FileText, Camera, CheckCircle2, X, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Evidence {
  id: string;
  actionId: string;
  actionTitle: string;
  type: "imagen" | "documento" | "captura";
  name: string;
  notes: string;
  uploadedAt: string;
}

const mockEvidences: Evidence[] = [
  {
    id: "e1",
    actionId: "a4",
    actionTitle: "Instalar antivirus en todos los dispositivos",
    type: "captura",
    name: "antivirus_instalado.png",
    notes: "Captura del panel de administración con todos los equipos protegidos",
    uploadedAt: "2025-01-30",
  },
];

const typeIcons = {
  imagen: FileImage,
  documento: FileText,
  captura: Camera,
};

const typeColors = {
  imagen: "text-primary",
  documento: "text-success",
  captura: "text-risk-medium",
};

export default function Evidencias() {
  const [evidences, setEvidences] = useState<Evidence[]>(mockEvidences);
  const [selectedAction, setSelectedAction] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"imagen" | "documento" | "captura">("captura");
  const [dragOver, setDragOver] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const completedActions = mockActions.filter((a) => a.status === "completada" || a.status === "en_progreso");

  function handleUpload() {
    if (!selectedAction) return;
    const action = mockActions.find((a) => a.id === selectedAction);
    if (!action) return;

    const newEv: Evidence = {
      id: `e${Date.now()}`,
      actionId: selectedAction,
      actionTitle: action.title,
      type,
      name: `evidencia_${type}_${Date.now()}.${type === "documento" ? "pdf" : "png"}`,
      notes: notes || "Sin notas",
      uploadedAt: new Date().toISOString().split("T")[0],
    };

    setEvidences((prev) => [newEv, ...prev]);
    setSelectedAction("");
    setNotes("");
    setShowForm(false);
    setSuccessMsg("✅ Evidencia registrada correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Evidencias</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Documenta la implementación de tus acciones de seguridad
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

        {successMsg && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        {/* Upload form */}
        {showForm && (
          <div className="card-glass rounded-xl p-6 space-y-5 border-primary/20">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Nueva evidencia</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Drag area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Arrastra archivos aquí</p>
              <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
              <p className="text-xs text-muted-foreground mt-2">PNG, JPG, PDF hasta 10MB</p>
            </div>

            {/* Type selector */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Tipo de evidencia</label>
              <div className="grid grid-cols-3 gap-3">
                {(["captura", "imagen", "documento"] as const).map((t) => {
                  const Icon = typeIcons[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        type === t ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Icon size={20} className={cn_simple(type === t ? "text-primary" : "text-muted-foreground", "mx-auto mb-1")} />
                      <p className="text-xs font-medium text-foreground capitalize">{t}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action selector */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Acción relacionada *</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">Selecciona una acción...</option>
                {mockActions.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe qué muestra esta evidencia..."
                rows={3}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={!selectedAction}
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90 gap-2"
              >
                <Upload size={16} />
                Registrar evidencia
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-border text-muted-foreground">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Evidences list */}
        {evidences.length === 0 ? (
          <div className="card-glass rounded-xl p-12 text-center">
            <FolderOpen size={40} className="mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Sin evidencias aún</h3>
            <p className="text-sm text-muted-foreground">
              Sube capturas o documentos que prueben la implementación de tus acciones de seguridad
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidences.map((ev) => {
              const Icon = typeIcons[ev.type];
              const color = typeColors[ev.type];
              return (
                <div key={ev.id} className="card-glass rounded-xl p-5 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                      <Icon size={20} className={color} />
                    </div>
                    <CheckCircle2 size={16} className="text-success" />
                  </div>
                  <p className="font-medium text-foreground text-sm mb-1 truncate">{ev.name}</p>
                  <p className="text-xs text-primary mb-2 leading-tight">{ev.actionTitle}</p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{ev.notes}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{ev.uploadedAt}</span>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground capitalize">{ev.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="card-glass rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Progreso de evidencias</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{evidences.length}</p>
              <p className="text-xs text-muted-foreground">Subidas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-risk-medium">{mockActions.length - evidences.length}</p>
              <p className="text-xs text-muted-foreground">Sin evidencia</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{Math.round((evidences.length / mockActions.length) * 100)}%</p>
              <p className="text-xs text-muted-foreground">Cobertura</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function cn_simple(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
