/**
 * Utilidades centralizadas para la gestión de administradores globales.
 * Estas utilidades aseguran que los correos maestros siempre tengan acceso,
 * independientemente de las variables de entorno o la base de datos de empresas.
 */

const ADMIN_EMAILS = [
  "chvmix79@gmail.com",
  "hvmix79@gmail.com",
  "hvmix.79@gmail.com"
];

/**
 * Verifica si un correo electrónico pertenece a un administrador global.
 * @param email Correo a verificar
 * @returns true si es un administrador autorizado
 */
export function esAdminGlobal(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const cleanEmail = email.trim().toLowerCase();
  
  // 1. Verificar lista hardcodeada de seguridad
  if (ADMIN_EMAILS.includes(cleanEmail)) return true;
  
  // 2. Verificar variable de entorno
  const envAdmin = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase();
  if (envAdmin && cleanEmail === envAdmin) return true;
  
  return false;
}

/**
 * Sincroniza el estado de administrador en localStorage.
 */
export function syncAdminState(email: string | null | undefined): boolean {
  const isAdmin = esAdminGlobal(email);
  // Secure contexts should rely on application state and JWTs, not localStorage.
  return isAdmin;
}
