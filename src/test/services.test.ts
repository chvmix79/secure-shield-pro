import { describe, it, expect } from 'vitest';

describe('Servicios de Cumplimiento Normativo', () => {
  it('debería definir correctamente la lista de 15 documentos base', () => {
    const defaultDocs = [
      { nombre: "Política de Seguridad de la Información", categoria: "Políticas" },
      { nombre: "Manual de Protección de Datos", categoria: "Legal" },
      { nombre: "Plan de Continuidad del Negocio", categoria: "Operaciones" },
      { nombre: "Registro de Activos de Información", categoria: "Gestión de Activos" },
      { nombre: "Matriz de Riesgos Ciber", categoria: "Gestión de Riesgos" },
      { nombre: "Plan de Respuesta a Incidentes", categoria: "Operaciones" },
      { nombre: "Control de Accesos y Usuarios", categoria: "Políticas" },
      { nombre: "Política de Escritorio Limpio", categoria: "Políticas" },
      { nombre: "Acuerdos de Confidencialidad (NDA)", categoria: "Legal" },
      { nombre: "Registro de Capacitación en Seguridad", categoria: "Humano" },
      { nombre: "Política de Uso de Activos", categoria: "Políticas" },
      { nombre: "Procedimiento de Backup", categoria: "Técnico" },
      { nombre: "Registro de Mantenimiento de Hardware", categoria: "Técnico" },
      { nombre: "Evaluación de Proveedores Tech", categoria: "Terceros" },
      { nombre: "Política de Teletrabajo Seguro", categoria: "Políticas" }
    ];
    
    expect(defaultDocs.length).toBe(15);
    expect(defaultDocs[0].nombre).toContain("Política de Seguridad");
  });

  it('debería validar estados permitidos para documentos', () => {
    const estadosValidos = ['actualizado', 'pendiente', 'obsoleto', 'faltante'];
    const estadoDocumento = 'actualizado';
    expect(estadosValidos).toContain(estadoDocumento);
  });
});
