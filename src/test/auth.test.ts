import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Limpiar todos los mocks de supabase
    vi.restoreAllMocks();
  });

  describe('signUp', () => {
    it('debe registrar un usuario exitosamente', async () => {
      const mockData = {
        user: { id: '123', email: 'test@test.com' },
        session: null
      };
      vi.spyOn(supabase.auth, 'signUp').mockResolvedValue({ data: mockData, error: null } as any);

      const result = await authService.signUp('test@test.com', 'password123');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(result).toEqual(mockData);
    });

    it('debe lanzar error cuando el registro falla', async () => {
      const mockError = { message: 'Email already registered' };
      vi.spyOn(supabase.auth, 'signUp').mockRejectedValue(mockError);

      await expect(authService.signUp('test@test.com', 'password123'))
        .rejects.toEqual(mockError);
    });
  });

  describe('signIn', () => {
    it('debe iniciar sesión exitosamente', async () => {
      const mockData = {
        user: { id: '123', email: 'test@test.com' },
        session: { access_token: 'token123' }
      };
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({ data: mockData, error: null } as any);

      const result = await authService.signIn('test@test.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(result).toEqual(mockData);
    });

    it('debe lanzar error con credenciales inválidas', async () => {
      const mockError = { message: 'Invalid login credentials' };
      vi.spyOn(supabase.auth, 'signInWithPassword').mockRejectedValue(mockError);

      await expect(authService.signIn('test@test.com', 'wrongpassword'))
        .rejects.toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('debe cerrar sesión exitosamente', async () => {
      vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null } as any);

      await authService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('debe lanzar error si el cierre de sesión falla', async () => {
      const mockError = { message: 'Sign out failed' };
      vi.spyOn(supabase.auth, 'signOut').mockRejectedValue(mockError);

      await expect(authService.signOut()).rejects.toEqual(mockError);
    });
  });

  describe('getSession', () => {
    it('debe retornar la sesión activa', async () => {
      const mockSession = { access_token: 'token123', user: { id: '123' } };
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: mockSession as any },
        error: null
      });

      const result = await authService.getSession();

      expect(result).toEqual(mockSession);
    });

    it('debe lanzar error cuando no hay sesión', async () => {
      const mockError = { message: 'No session' };
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: null },
        error: mockError
      });

      await expect(authService.getSession()).rejects.toEqual(mockError);
    });
  });

  describe('getUser', () => {
    it('debe retornar el usuario actual', async () => {
      const mockUser = { id: '123', email: 'test@test.com' };
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: mockUser as any },
        error: null
      });

      const result = await authService.getUser();

      expect(result).toEqual(mockUser);
    });

    it('debe retornar null cuando hay error', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: { message: 'User not found' }
      });

      const result = await authService.getUser();

      expect(result).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('debe enviar email de recuperación de contraseña', async () => {
      vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockResolvedValue({ error: null });

      await authService.resetPassword('test@test.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@test.com');
    });

    it('debe lanzar error si el email no existe', async () => {
      const mockError = { message: 'User not found' };
      vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockRejectedValue(mockError);

      await expect(authService.resetPassword('notexist@test.com'))
        .rejects.toEqual(mockError);
    });
  });
});
