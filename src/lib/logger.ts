import { supabase } from "./supabase";

export type LogLevel = 'info' | 'warning' | 'error' | 'critical';

interface LogContext {
  module?: string;
  action?: string;
  userId?: string;
  empresaId?: string;
  metadata?: any;
}

/**
 * Servicio centralizado de monitoreo y logging para auditoría y debug.
 */
class LoggerService {
  private isProduction = import.meta.env.PROD;

  private async log(level: LogLevel, message: string, context?: LogContext, error?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? (error instanceof Error ? error.message : String(error)) : undefined,
      stack: error instanceof Error ? error.stack : undefined
    };

    // Log a la consola siempre
    if (level === 'error' || level === 'critical') {
      console.error(`[${level.toUpperCase()}] ${message}`, logEntry);
    } else if (level === 'warning') {
      console.warn(`[${level.toUpperCase()}] ${message}`, logEntry);
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, logEntry);
    }

    // En producción, guardar en base de datos si es crítico o error
    if (this.isProduction && (level === 'error' || level === 'critical')) {
      try {
        // Asumiendo que existe una tabla 'system_logs' o similar. 
        // Si no existe, supabase arrojará error silencioso localmente.
        await supabase.from('system_logs').insert({
          level,
          message,
          module: context?.module,
          action: context?.action,
          user_id: context?.userId,
          empresa_id: context?.empresaId,
          metadata: { ...context?.metadata, error: logEntry.error, stack: logEntry.stack }
        });
      } catch (e) {
        console.error('Fallo al registrar log en Supabase', e);
      }
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warning', message, context);
  }

  error(message: string, error?: any, context?: LogContext) {
    this.log('error', message, context, error);
  }

  critical(message: string, error?: any, context?: LogContext) {
    this.log('critical', message, context, error);
  }
}

export const logger = new LoggerService();
