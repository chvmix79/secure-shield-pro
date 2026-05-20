import React from 'react';
import { cn } from "@/lib/utils";

interface RiskPoint {
  id: string;
  name: string;
  probability: number; // 1-5
  impact: number;      // 1-5
  level: 'bajo' | 'medio' | 'alto' | 'crítico';
}

interface RiskHeatmapProps {
  risks: RiskPoint[];
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ risks }) => {
  const labels = ["Insignificante", "Menor", "Moderado", "Mayor", "Catastrófico"];
  const probLabels = ["Raro", "Improbable", "Posible", "Probable", "Casi Seguro"];

  // Helper to get color based on grid position (Impact x Probability)
  const getCellColor = (impact: number, probability: number) => {
    const score = impact * probability;
    if (score >= 16) return "bg-danger/40 border-danger/50";
    if (score >= 10) return "bg-warning/30 border-warning/50";
    if (score >= 5) return "bg-primary/20 border-primary/40";
    return "bg-success/20 border-success/40";
  };

  return (
    <div className="card-glass rounded-2xl p-6 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Matriz de Riesgos (MinTIC)</h3>
          <p className="text-xs text-muted-foreground">Distribución de Probabilidad vs Impacto</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-danger/50" />
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Crítico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-warning/50" />
            <span className="text-[10px] text-muted-foreground uppercase font-medium">Alto</span>
          </div>
        </div>
      </div>

      <div className="relative flex">
        {/* Y-Axis Label */}
        <div className="absolute -left-12 top-1/2 -rotate-90 origin-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Impacto (Consecuencia)
        </div>

        {/* The Grid */}
        <div className="flex-1 ml-4 sm:ml-8">
          <div className="grid grid-cols-5 gap-1.5 aspect-square sm:aspect-video md:aspect-[2/1]">
            {[5, 4, 3, 2, 1].map((impact) => (
              <React.Fragment key={`row-${impact}`}>
                {/* Row Labels */}
                <div className="absolute -left-1 sm:-left-4 mt-2 sm:mt-4 text-[8px] sm:text-[10px] text-muted-foreground font-medium pr-2 text-right w-12 sm:w-16 opacity-60">
                   {/* This is handled by a separate grid if needed, but we'll use absolute positioning for simple labels */}
                </div>
                
                {[1, 2, 3, 4, 5].map((prob) => {
                  const cellRisks = risks.filter(r => Math.round(r.probability) === prob && Math.round(r.impact) === impact);
                  
                  return (
                    <div 
                      key={`${impact}-${prob}`}
                      className={cn(
                        "relative rounded-lg border flex items-center justify-center transition-all duration-300 group hover:scale-[1.02]",
                        getCellColor(impact, prob)
                      )}
                    >
                      {/* Grid Cell Background Number (Subtle) */}
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold opacity-5 pointer-events-none">
                        {impact * prob}
                      </span>

                      {/* Risk Points */}
                      <div className="flex flex-wrap gap-1 p-1 justify-center">
                        {cellRisks.map((risk, idx) => (
                          <div 
                            key={risk.id}
                            className={cn(
                              "w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-background shadow-md cursor-help transition-transform hover:scale-125 animate-pulse-slow",
                              risk.level === 'crítico' ? "bg-danger" : 
                              risk.level === 'alto' ? "bg-warning" : 
                              risk.level === 'medio' ? "bg-primary" : "bg-success"
                            )}
                            title={`${risk.name} (P:${prob}, I:${impact})`}
                          />
                        ))}
                      </div>

                      {/* Tooltip on hover for empty or filled cells */}
                      <div className="absolute opacity-0 group-hover:opacity-100 bg-popover text-popover-foreground text-[8px] sm:text-[10px] px-2 py-1 rounded shadow-xl -top-8 z-50 pointer-events-none whitespace-nowrap border border-border transition-all">
                        {probLabels[prob-1]} x {labels[impact-1]}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* X-Axis Labels */}
          <div className="grid grid-cols-5 gap-1.5 mt-3">
            {probLabels.map((label) => (
              <div key={label} className="text-[8px] sm:text-[10px] text-muted-foreground font-medium text-center truncate">
                {label}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Probabilidad (Frecuencia)
          </div>
        </div>

        {/* Legend / Sidebar Labels */}
        <div className="hidden lg:flex flex-col justify-between py-2 pl-4 text-[10px] text-muted-foreground font-medium opacity-60">
          {labels.reverse().map(l => <span key={l}>{l}</span>)}
        </div>
      </div>
    </div>
  );
};
