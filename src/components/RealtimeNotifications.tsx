import { useEffect } from 'react';
import { useRealtimeAlerts } from '@/hooks/useRealtime';
import { Bell, X, AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeNotificationsProps {
  empresaId: string | undefined;
}

export function RealtimeNotifications({ empresaId }: RealtimeNotificationsProps) {
  const { newAlert } = useRealtimeAlerts(empresaId);

  if (!newAlert) return null;

  const iconMap = {
    critical: AlertCircle,
    error: AlertTriangle,
    warning: AlertTriangle,
    info: Info,
  };

  const colorMap = {
    critical: 'bg-danger border-danger text-white',
    error: 'bg-risk-high border-risk-high text-white',
    warning: 'bg-warning border-warning text-black',
    info: 'bg-primary border-primary text-white',
  };

  const Icon = iconMap[newAlert.tipo as keyof typeof iconMap] || Bell;
  const colorClass = colorMap[newAlert.tipo as keyof typeof colorMap] || colorMap.info;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm",
        colorClass
      )}>
        <Icon size={20} className="shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{newAlert.titulo}</p>
          {newAlert.descripcion && (
            <p className="text-xs mt-1 opacity-90">{newAlert.descripcion}</p>
          )}
        </div>
      </div>
    </div>
  );
}
