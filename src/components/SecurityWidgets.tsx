import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/cybersecurity-data";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  size?: "sm" | "md";
}

const config: Record<RiskLevel, { label: string; classes: string }> = {
  bajo: {
    label: "Bajo",
    classes: "bg-risk-low text-risk-low border-risk-low",
  },
  medio: {
    label: "Medio",
    classes: "bg-risk-medium text-risk-medium border-risk-medium",
  },
  alto: {
    label: "Alto",
    classes: "bg-risk-high text-risk-high border-risk-high",
  },
  crítico: {
    label: "Crítico",
    classes: "bg-risk-high text-risk-high border-risk-high",
  },
};

export function RiskBadge({ level, className, size = "sm" }: RiskBadgeProps) {
  const { label, classes } = config[level];
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full border uppercase tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        classes,
        className
      )}
    >
      {label}
    </span>
  );
}

interface SecurityScoreCircleProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export function SecurityScoreCircle({ score, size = 120, showLabel = true }: SecurityScoreCircleProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "hsl(158 64% 40%)";
  let textColor = "text-risk-low";
  let label = "Bueno";

  if (score < 25) {
    strokeColor = "hsl(0 72% 51%)";
    textColor = "text-risk-high";
    label = "Crítico";
  } else if (score < 50) {
    strokeColor = "hsl(0 72% 51%)";
    textColor = "text-risk-high";
    label = "Alto";
  } else if (score < 75) {
    strokeColor = "hsl(38 92% 50%)";
    textColor = "text-risk-medium";
    label = "Moderado";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" className="rotate-[-90deg]">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out", filter: `drop-shadow(0 0 6px ${strokeColor})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: `${size / 2 - 20}px` }}>
      </div>
      <div className="-mt-2 text-center" style={{ marginTop: `-${size / 2 + 8}px` }}>
        <p className={cn("font-bold leading-none", textColor, size >= 120 ? "text-2xl" : "text-lg")}>
          {score}
        </p>
        <p className="text-xs text-muted-foreground">/100</p>
      </div>
      {showLabel && (
        <div className="mt-1">
          <span className={cn("text-sm font-semibold", textColor)}>{label}</span>
        </div>
      )}
    </div>
  );
}

export function SecurityScoreWidget({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "hsl(158 64% 40%)";
  let textColor = "text-risk-low";
  let label = "Bueno";

  if (score < 25) { strokeColor = "hsl(0 72% 51%)"; textColor = "text-risk-high"; label = "Crítico"; }
  else if (score < 50) { strokeColor = "hsl(0 72% 51%)"; textColor = "text-risk-high"; label = "Riesgo Alto"; }
  else if (score < 75) { strokeColor = "hsl(38 92% 50%)"; textColor = "text-risk-medium"; label = "Moderado"; }

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width={140} height={140} viewBox="0 0 100 100" className="rotate-[-90deg] absolute">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={strokeColor} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1.2s ease-in-out", filter: `drop-shadow(0 0 8px ${strokeColor})` }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className={cn("text-3xl font-bold leading-none", textColor)}>{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
        <span className={cn("text-xs font-semibold mt-0.5", textColor)}>{label}</span>
      </div>
    </div>
  );
}
