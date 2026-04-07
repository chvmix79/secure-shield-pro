import { describe, it, expect, vi, beforeEach } from 'vitest';
import { suscripcionService, PLANES } from '@/lib/suscripcion';
import type { PlanType } from '@/lib/database.types';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

import { supabase } from '@/lib/supabase';

const mockEmpresaData = {
  id: 'emp-123',
  plan: 'basic' as PlanType,
  fecha_inicio: new Date().toISOString(),
  fecha_fin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días
  subscription_status: 'active',
  cuenta_bloqueada: false,
};

describe('suscripcionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEstadoSuscripcion', () => {
    it('debe retornar estado completo de suscripción', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockEmpresaData, error: null }),
          }),
        }),
      } as any);

      const estado = await suscripcionService.getEstadoSuscripcion('emp-123');

      expect(estado.plan).toBe('basic');
      expect(estado.cuenta_bloqueada).toBe(false);
      expect(estado.subscription_status).toBe('active');
      expect(estado.diasRestantes).toBeGreaterThan(0);
      expect(estado.estaVencida).toBe(false);
      expect(estado.estaBloqueada).toBe(false);
    });

    it('debe retornar plan free si la empresa no existe', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as any);

      const estado = await suscripcionService.getEstadoSuscripcion('emp-inexistente');

      expect(estado.plan).toBe('free');
      expect(estado.cuenta_bloqueada).toBe(false);
    });

    it('debe marcar como bloqueada si cuenta_bloqueada es true', async () => {
      const bloqueadaData = { ...mockEmpresaData, cuenta_bloqueada: true };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: bloqueadaData, error: null }),
          }),
        }),
      } as any);

      const estado = await suscripcionService.getEstadoSuscripcion('emp-123');

      expect(estado.estaBloqueada).toBe(true);
      expect(estado.subscription_status).toBe('blocked');
    });

    it('debe marcar como vencida si la fecha_fin ya pasó', async () => {
      const vencidaData = {
        ...mockEmpresaData,
        fecha_fin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // hace 5 días
      };

      // Mock para la primera llamada (select) y la segunda (update dentro del flujo)
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: vencidaData, error: null }),
        }),
      });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'empresas') {
          return {
            select: mockSelect,
            update: mockUpdate,
          } as any;
        }
        return {} as any;
      });

      const estado = await suscripcionService.getEstadoSuscripcion('emp-123');

      expect(estado.estaVencida).toBe(true);
    });
  });

  describe('getPlan', () => {
    it('debe retornar el plan de la empresa', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockEmpresaData, error: null }),
          }),
        }),
      } as any);

      const plan = await suscripcionService.getPlan('emp-123');

      expect(plan).toBe('basic');
    });
  });

  describe('estaBloqueada', () => {
    it('debe retornar true si la cuenta está bloqueada', async () => {
      const bloqueadaData = { ...mockEmpresaData, cuenta_bloqueada: true };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: bloqueadaData, error: null }),
          }),
        }),
      } as any);

      const bloqueada = await suscripcionService.estaBloqueada('emp-123');

      expect(bloqueada).toBe(true);
    });

    it('debe retornar false si la cuenta no está bloqueada', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockEmpresaData, error: null }),
          }),
        }),
      } as any);

      const bloqueada = await suscripcionService.estaBloqueada('emp-123');

      expect(bloqueada).toBe(false);
    });
  });

  describe('puedeAcceder', () => {
    it('debe permitir acceso a phishing en plan basic', () => {
      expect(suscripcionService.puedeAcceder('phishing', 'basic')).toBe(true);
    });

    it('debe denegar acceso a vulnerabilidades en plan basic', () => {
      expect(suscripcionService.puedeAcceder('vulnerabilidades', 'basic')).toBe(false);
    });

    it('debe permitir acceso a vulnerabilidades en plan pro', () => {
      expect(suscripcionService.puedeAcceder('vulnerabilidades', 'pro')).toBe(true);
    });

    it('debe permitir siempre acceso al dashboard básico', () => {
      expect(suscripcionService.puedeAcceder('dashboard', 'free')).toBe(true);
    });
  });

  describe('puedeExportarPDF', () => {
    it('debe permitir exportar en plan basic', () => {
      expect(suscripcionService.puedeExportarPDF('basic')).toBe(true);
    });

    it('no debe permitir exportar en plan free', () => {
      expect(suscripcionService.puedeExportarPDF('free')).toBe(false);
    });
  });

  describe('upgradePlan', () => {
    it('debe actualizar el plan de la empresa', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockEmpresaData, plan: 'pro' },
                error: null
              }),
            }),
          }),
        }),
      } as any);

      const result = await suscripcionService.upgradePlan('emp-123', 'pro', 30);

      expect(supabase.from).toHaveBeenCalledWith('empresas');
      expect(result).toBeDefined();
    });
  });

  describe('cancelPlan', () => {
    it('debe cancelar el plan de la empresa', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockEmpresaData, subscription_status: 'cancelled' },
                error: null
              }),
            }),
          }),
        }),
      } as any);

      const result = await suscripcionService.cancelPlan('emp-123');

      expect(supabase.from).toHaveBeenCalledWith('empresas');
      expect(result).toBeDefined();
    });
  });
});

describe('PLANES', () => {
  it('debe tener 3 planes definidos', () => {
    expect(Object.keys(PLANES)).toHaveLength(3);
    expect(PLANES.free).toBeDefined();
    expect(PLANES.basic).toBeDefined();
    expect(PLANES.pro).toBeDefined();
  });

  it('free plan debe tener precio 0', () => {
    expect(PLANES.free.precio).toBe(0);
    expect(PLANES.free.precio_anual).toBe(0);
  });

  it('basic plan debe tener características correctas', () => {
    expect(PLANES.basic.features.moduloPhishing).toBe(true);
    expect(PLANES.basic.features.moduloVulnerabilidades).toBe(false);
    expect(PLANES.basic.features.maxUsuarios).toBe(3);
  });

  it('pro plan debe tener todas las características', () => {
    expect(PLANES.pro.features.moduloPhishing).toBe(true);
    expect(PLANES.pro.features.moduloVulnerabilidades).toBe(true);
    expect(PLANES.pro.features.moduloMicrosoft365).toBe(true);
    expect(PLANES.pro.features.soportePrioritario).toBe(true);
    expect(PLANES.pro.features.maxUsuarios).toBe(999);
  });
});
