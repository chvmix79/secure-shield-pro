import * as XLSX from 'xlsx';
import type { Diagnostico, Empresa, Accion } from './database.types';
import { calculateSecurityLevel, getQuestionsWithNormativas } from './cybersecurity-data';

/**
 * Genera un archivo Excel (.xlsx) con múltiples pestañas
 * conteniendo el reporte ejecutivo completo de la empresa.
 */
export function generateExecutiveReportXLSX(
  empresa: Empresa,
  diagnostico: Diagnostico | null,
  acciones: Accion[],
  stats: {
    docsActualizados: number;
    docsTotal: number;
    capacitacionCompletada: number;
    capacitacionTotal: number;
    alertasPendientes: number;
  }
) {
  const wb = XLSX.utils.book_new();
  const fecha = new Date().toLocaleDateString('es-ES');

  // ═══════════════════════════════════════
  //  Pestaña 1: Resumen Ejecutivo
  // ═══════════════════════════════════════
  const score = diagnostico?.score ?? 0;
  const level = calculateSecurityLevel(score);

  const resumenData = [
    ['CHV Ciberdefensa - Reporte Ejecutivo de Seguridad'],
    [''],
    ['Empresa', empresa.nombre],
    ['Sector', empresa.sector],
    ['Empleados', empresa.empleados],
    ['Fecha del Reporte', fecha],
    [''],
    ['═══ RESULTADO DEL DIAGNÓSTICO ═══'],
    ['Score de Seguridad', `${score}/100`],
    ['Nivel', level.label],
    ['Descripción', level.description],
    [''],
    ['═══ MÉTRICAS DE CUMPLIMIENTO ═══'],
    ['Documentos Actualizados', `${stats.docsActualizados} de ${stats.docsTotal}`],
    ['Capacitación Completada', `${stats.capacitacionCompletada} de ${stats.capacitacionTotal}`],
    ['Alertas Pendientes', stats.alertasPendientes],
    ['Acciones Totales', acciones.length],
    ['Acciones Pendientes', acciones.filter(a => a.estado === 'pendiente').length],
    ['Acciones Completadas', acciones.filter(a => a.estado === 'completada').length],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  wsResumen['!cols'] = [{ wch: 30 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');

  // ═══════════════════════════════════════
  //  Pestaña 2: Detalle por Área
  // ═══════════════════════════════════════
  if (diagnostico?.respuestas) {
    const questions = getQuestionsWithNormativas(empresa.sector);
    const areaHeaders = ['Área', 'Puntaje', 'Porcentaje', 'Estado'];
    const areaRows = questions.map(q => {
      const s = (diagnostico.respuestas[q.id] as number) ?? 0;
      const pct = s * 10;
      const estado = pct >= 70 ? '✅ Cumple' : pct >= 40 ? '⚠️ Parcial' : '❌ No cumple';
      return [q.category, `${s}/10`, `${pct}%`, estado];
    });

    const wsAreas = XLSX.utils.aoa_to_sheet([areaHeaders, ...areaRows]);
    wsAreas['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsAreas, 'Detalle por Área');
  }

  // ═══════════════════════════════════════
  //  Pestaña 3: Plan de Acción
  // ═══════════════════════════════════════
  if (acciones.length > 0) {
    const accionHeaders = ['Título', 'Descripción', 'Prioridad', 'Estado', 'Responsable', 'Categoría', 'Fecha Límite'];
    const accionRows = acciones.map(a => [
      a.titulo,
      a.descripcion?.substring(0, 200) || '',
      a.prioridad,
      a.estado,
      a.responsable || 'Sin asignar',
      a.categoria || '',
      a.fecha_limite || '',
    ]);

    const wsAcciones = XLSX.utils.aoa_to_sheet([accionHeaders, ...accionRows]);
    wsAcciones['!cols'] = [
      { wch: 30 }, { wch: 50 }, { wch: 12 }, { wch: 14 },
      { wch: 25 }, { wch: 20 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, wsAcciones, 'Plan de Acción');
  }

  // ═══════════════════════════════════════
  //  Pestaña 4: Recomendaciones
  // ═══════════════════════════════════════
  const recomendaciones = [
    ['#', 'Recomendación', 'Prioridad'],
    [1, 'Completar todos los diagnósticos pendientes por departamento', 'Alta'],
    [2, 'Actualizar las políticas y documentos de cumplimiento', 'Alta'],
    [3, 'Completar los módulos de capacitación en ciberseguridad', 'Media'],
    [4, 'Realizar simulaciones de phishing mensuales', 'Media'],
    [5, 'Configurar integraciones con sistemas EDR/SIEM', 'Media'],
    [6, 'Atender todas las alertas de seguridad pendientes', 'Alta'],
    [7, 'Implementar autenticación multifactor (MFA)', 'Alta'],
    [8, 'Realizar escaneos de vulnerabilidades periódicos', 'Media'],
  ];

  const wsRecs = XLSX.utils.aoa_to_sheet(recomendaciones);
  wsRecs['!cols'] = [{ wch: 5 }, { wch: 55 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsRecs, 'Recomendaciones');

  // Descargar el archivo
  const fileName = `reporte_ejecutivo_${empresa.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Genera un archivo Excel con el detalle de un diagnóstico individual.
 */
export function generateDiagnosticXLSX(
  diagnostico: Diagnostico,
  empresa: Empresa,
  acciones: Accion[]
) {
  const wb = XLSX.utils.book_new();
  const level = calculateSecurityLevel(diagnostico.score);
  const questions = getQuestionsWithNormativas(empresa.sector);

  // Pestaña 1: Resultado
  const resultData = [
    ['CHV Ciberdefensa - Diagnóstico de Ciberseguridad'],
    [''],
    ['Empresa', empresa.nombre],
    ['Sector', empresa.sector],
    ['Departamento', diagnostico.departamento || 'General'],
    ['Fecha', new Date(diagnostico.created_at).toLocaleDateString('es-ES')],
    [''],
    ['Score', `${diagnostico.score}/100`],
    ['Nivel', level.label],
    ['Descripción', level.description],
  ];

  const wsResult = XLSX.utils.aoa_to_sheet(resultData);
  wsResult['!cols'] = [{ wch: 20 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsResult, 'Resultado');

  // Pestaña 2: Detalle
  if (diagnostico.respuestas) {
    const headers = ['Área', 'Pregunta', 'Puntaje', 'Porcentaje', 'Estado'];
    const rows = questions.map(q => {
      const s = (diagnostico.respuestas[q.id] as number) ?? 0;
      const pct = s * 10;
      const estado = pct >= 70 ? 'Cumple' : pct >= 40 ? 'Parcial' : 'No cumple';
      return [q.category, q.question, `${s}/10`, `${pct}%`, estado];
    });

    const wsDetail = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    wsDetail['!cols'] = [{ wch: 25 }, { wch: 50 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalle');
  }

  // Pestaña 3: Acciones generadas
  if (acciones.length > 0) {
    const headers = ['Título', 'Prioridad', 'Estado', 'Fecha Límite'];
    const rows = acciones.map(a => [a.titulo, a.prioridad, a.estado, a.fecha_limite || '']);

    const wsAcc = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    wsAcc['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsAcc, 'Acciones');
  }

  const fileName = `diagnostico_${empresa.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
