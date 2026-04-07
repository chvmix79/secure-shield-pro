import { jsPDF } from 'jspdf';
import type { Diagnostico, Empresa, Accion } from './database.types';
import { calculateSecurityLevel } from './cybersecurity-data';

export function generateDiagnosticPDF(
  diagnostico: Diagnostico,
  empresa: Empresa,
  acciones: Accion[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  doc.setFontSize(20);
  doc.setTextColor(14, 165, 233);
  doc.text('CHV Ciberdefensa', margin, y);
  y += 10;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Reporte de Diagnóstico de Ciberseguridad', margin, y);
  y += 15;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha: ${new Date(diagnostico.created_at).toLocaleDateString('es-ES')}`, margin, y);
  y += 10;
  doc.text(`Empresa: ${empresa.nombre}`, margin, y);
  y += 10;
  doc.text(`Sector: ${empresa.sector}`, margin, y);
  y += 15;

  const securityInfo = calculateSecurityLevel(diagnostico.score);
  
  doc.setFillColor(14, 165, 233);
  doc.circle(pageWidth / 2, y + 20, 25, 'F');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(`${diagnostico.score}`, pageWidth / 2, y + 25, { align: 'center' });
  y += 50;

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Nivel de Seguridad: ${securityInfo.label}`, margin, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const descLines = doc.splitTextToSize(securityInfo.description, pageWidth - margin * 2);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 15;

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Resultados por Área', margin, y);
  y += 10;

  if (diagnostico.respuestas) {
    doc.setFontSize(10);
    Object.entries(diagnostico.respuestas).forEach(([category, score]) => {
      const s = score as number;
      const pct = s * 10;
      let color = [239, 68, 68];
      if (pct >= 70) color = [34, 197, 94];
      else if (pct >= 40) color = [234, 179, 8];

      doc.setTextColor(...color as [number, number, number]);
      doc.text(`${category}: ${pct}%`, margin, y);
      y += 7;
    });
  }

  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Acciones Recomendadas', margin, y);
  y += 10;

  doc.setFontSize(10);
  acciones.slice(0, 5).forEach((accion) => {
    doc.setTextColor(0, 0, 0);
    doc.text(`• ${accion.titulo}`, margin, y);
    y += 6;
    doc.setTextColor(100, 100, 100);
    const desc = accion.descripcion?.substring(0, 80) + '...' || '';
    doc.text(desc, margin + 5, y);
    y += 8;
  });

  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generado por CHV Ciberdefensa - www.chvciberdefensa.com', margin, y);

  doc.save(`diagnostico_${empresa.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateExecutiveReportPDF(
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
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFillColor(14, 165, 233);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('CiberSeguraPymes', margin, 20);
  doc.setFontSize(14);
  doc.text('Reporte Ejecutivo de Seguridad', margin, 30);
  
  y = 55;

  // Empresa info
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Empresa: ${empresa.nombre}`, margin, y);
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Sector: ${empresa.sector} | Empleados: ${empresa.empleados}`, margin, y);
  y += 10;
  doc.text(`Fecha del reporte: ${new Date().toLocaleDateString('es-ES')}`, margin, y);
  y += 20;

  // Score principal
  const score = diagnostico?.score || 0;
  const securityInfo = calculateSecurityLevel(score);
  
  doc.setFillColor(14, 165, 233);
  doc.circle(pageWidth / 2, y + 15, 30, 'F');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(`${score}`, pageWidth / 2, y + 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(securityInfo.label, pageWidth / 2, y + 35, { align: 'center' });
  y += 50;

  // Resumen de cumplimiento
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumen de Cumplimiento', margin, y);
  y += 10;

  // Grid de métricas
  const metricas = [
    { label: 'Score de Seguridad', value: `${score}/100`, color: [14, 165, 233] },
    { label: 'Documentos', value: `${stats.docsActualizados}/${stats.docsTotal}`, color: [34, 197, 94] },
    { label: 'Capacitación', value: `${stats.capacitacionCompletada}/${stats.capacitacionTotal}`, color: [234, 179, 8] },
    { label: 'Alertas', value: `${stats.alertasPendientes}`, color: [239, 68, 68] },
  ];

  const colWidth = (pageWidth - margin * 2) / 2;
  metricas.forEach((m, i) => {
    const x = margin + (i % 2) * colWidth;
    doc.setFillColor(m.color[0], m.color[1], m.color[2]);
    doc.roundedRect(x, y + (Math.floor(i / 2)) * 30, colWidth - 5, 25, 3, 3, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text(m.value, x + colWidth / 2 - 2, y + 15 + (Math.floor(i / 2)) * 30, { align: 'center' });
    doc.setFontSize(8);
    doc.text(m.label, x + colWidth / 2 - 2, y + 22 + (Math.floor(i / 2)) * 30, { align: 'center' });
  });

  y += 70;

  // Acciones críticas
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Acciones Críticas Pendientes', margin, y);
  y += 8;

  const accionesCriticas = acciones.filter(a => a.prioridad === 'alta' || a.prioridad === 'crítica');
  if (accionesCriticas.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    doc.text('✓ No hay acciones críticas pendientes', margin, y);
  } else {
    accionesCriticas.slice(0, 5).forEach((a) => {
      doc.setFontSize(9);
      doc.setTextColor(239, 68, 68);
      doc.text(`• ${a.titulo}`, margin, y);
      y += 5;
    });
  }

  y += 15;

  // Recomendaciones
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Próximos Pasos Recomendados', margin, y);
  y += 8;

  const recomendaciones = [
    'Completar diagnóstico si no se ha realizado',
    'Revisar y actualizar documentos de cumplimiento',
    'Completar módulos de capacitación pendientes',
    'Atender alertas de seguridad pendientes',
    'Realizar simulaciones de phishing mensuales',
  ];

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  recomendaciones.forEach((r) => {
    doc.text(`• ${r}`, margin, y);
    y += 5;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generado por CHV Ciberdefensa - Plataforma de Gestión de Ciberseguridad', margin, doc.internal.pageSize.getHeight() - 10);
  
  doc.save(`reporte_ejecutivo_${empresa.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}
