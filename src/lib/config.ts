/**
 * Configuración centralizada de la aplicación.
 * Todas las constantes globales que pueden cambiar entre ambientes.
 */

export const APP_CONFIG = {
  /**
   * Email del administrador global.
   * Se lee desde variable de entorno VITE_ADMIN_EMAIL.
   * En producción, configurar este valor en el dashboard de Supabase.
   */
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL as string,

  /**
   * Determina si la aplicación corre en modo desarrollo.
   */
  isDevelopment: import.meta.env.MODE === 'development',

  /**
   * Determina si la aplicación corre en producción.
   */
  isProduction: import.meta.env.PROD,

  /**
   * URL base de la aplicación (para emails, links, etc.)
   */
  appUrl: import.meta.env.VITE_APP_URL || window.location.origin,
} as const;

/**
 * Obtiene el email del admin de forma segura.
 * Retorna null si no está configurado.
 */
export function getAdminEmail(): string | null {
  const email = APP_CONFIG.adminEmail;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    console.warn('[Config] VITE_ADMIN_EMAIL no está configurado o es inválido.');
    return null;
  }
  return email.toLowerCase().trim();
}

/**
 * Verifica si un email es el administrador global.
 */
export function isAdminEmail(email: string): boolean {
  const admin = getAdminEmail();
  if (!admin) return false;
  return email.toLowerCase().trim() === admin;
}
