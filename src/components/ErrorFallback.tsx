import React from "react";
import { AlertOctagon, RefreshCw, Copy, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  moduleName?: string;
}

export function ErrorFallback({ error, resetErrorBoundary, moduleName }: ErrorFallbackProps) {
  const copyError = () => {
    navigator.clipboard.writeText(`${error.name}: ${error.message}\n${error.stack}`);
    alert("Error copiado al portapapeles");
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4 bg-[#020617] text-slate-100 font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),transparent_70%)] pointer-events-none" />
      
      <Card className="max-w-xl w-full border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
        
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <AlertOctagon size={32} className="text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {moduleName ? `Error en: ${moduleName}` : 'Ocurrió un error inesperado'}
          </CardTitle>
          <p className="text-slate-400 mt-2">El módulo ha fallado. Los demás módulos siguen funcionando con normalidad.</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10 font-mono text-sm overflow-auto max-h-[200px] custom-scrollbar">
            <p className="text-red-400 font-bold mb-1">{error.name}: {error.message}</p>
            <p className="text-slate-500 whitespace-pre text-[10px] leading-relaxed">
              {error.stack}
            </p>
          </div>
          
          <div className="flex justify-between items-center text-xs text-slate-500 px-1">
            <span>Evidence Shield System | Módulo de Diagnóstico</span>
            <button 
              onClick={copyError}
              className="flex items-center gap-1 hover:text-primary transition-colors font-medium p-1 rounded hover:bg-slate-800"
            >
              <Copy size={12} /> Copiar detalles del error
            </button>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 pb-8">
          <Button 
            onClick={resetErrorBoundary} 
            className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white gap-2 transition-all"
          >
            <RefreshCw size={16} /> Reintentar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full sm:flex-1 border-slate-700 hover:bg-slate-800 text-slate-300 gap-2 transition-all"
          >
            <LayoutDashboard size={16} /> Ir al Tablero
          </Button>
        </CardFooter>
      </Card>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </div>
  );
}
