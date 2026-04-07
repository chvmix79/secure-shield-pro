import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

// Fix for TypeScript type declaration for autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

export const generateSecurityReport = (
  empresaNombre: string,
  score: number,
  modulos: any[],
  acciones: any[],
  vulnerabilidades: any[]
) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const date = new Date().toLocaleDateString('es-ES');
  
  // -- Estilos Base --
  const primaryColor: [number, number, number] = [22, 119, 255]; // Azul
  const secondaryColor: [number, number, number] = [237, 40, 57]; // Rojo/Naranja
  const textColor: [number, number, number] = [51, 51, 51];
  
  // -- PORTADA --
  // Header Blue Bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE EJECUTIVO DE CIBERSEGURIDAD', 20, 25);
  
  // Info Empresa
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(16);
  doc.text(empresaNombre.toUpperCase(), 20, 55);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de generación: ${date}`, 20, 62);
  doc.text('Plataforma: CHV CyberDefense', 20, 67);

  // -- RESUMEN EJECUTIVO (PUNTAJE) --
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Resumen de Postura (CiberScore)', 20, 85);
  
  doc.setFontSize(36);
  const scoreColor = score >= 70 ? [40, 167, 69] : score >= 40 ? [255, 193, 7] : [220, 53, 69];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${score}%`, 20, 105);
  
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  const scoreText = score >= 70 ? 'NIVEL ÓPTIMO: Tu empresa cuenta con bases sólidas de seguridad.' : 
                    score >= 40 ? 'NIVEL MEDIO: Se requieren mejoras importantes en controles básicos.' : 
                    'NIVEL DE RIESGO: Tu infraestructura es altamente vulnerable.';
  doc.text(scoreText, 55, 102);

  // -- DETALLE POR MÓDULOS --
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Análisis Detallado por Módulos', 20, 125);
  
  const modulosBody = modulos.map(m => [
    m.nombre,
    `${m.actual}%`,
    `${m.objetivo}%`,
    m.actual >= m.objetivo ? 'CUMPLIDO' : `${m.objetivo - m.actual}% de brecha`
  ]);

  doc.autoTable({
    startY: 130,
    head: [['Módulo de Control', 'Nivel Actual', 'Nivel Objetivo', 'Estado']],
    body: modulosBody,
    headStyles: { fillColor: primaryColor },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // -- ACCIONES PRIORITARIAS --
  const finalY = (doc as any).lastAutoTable.cursor.y || 130;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Recomendaciones Prioritarias', 20, finalY + 15);
  
  const accionesBody = acciones.filter(a => !a.completada).slice(0, 5).map(a => [
    a.titulo,
    a.prioridad.toUpperCase(),
    'Acción Requerida'
  ]);

  doc.autoTable({
    startY: finalY + 20,
    head: [['Acción Recomendada', 'Prioridad', 'Siguiente Paso']],
    body: accionesBody.length > 0 ? accionesBody : [['No hay acciones pendientes críticas', '-', '-']],
    headStyles: { fillColor: secondaryColor },
  });

  // -- VULNERABILIDADES --
  const vulnY = (doc as any).lastAutoTable.cursor.y || finalY + 40;
  if (vulnerabilidades.length > 0) {
    // New page if needed
    if (vulnY > 230) doc.addPage();
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('4. Vulnerabilidades Críticas Detectadas (CVE)', 20, (vulnY > 230 ? 25 : vulnY + 15));
    
    const vulnBody = vulnerabilidades.slice(0, 6).map(v => [
        v.cve_id || 'CVE-PROPIO',
        v.severity.toUpperCase(),
        v.descripcion.substring(0, 100) + '...'
    ]);

    doc.autoTable({
        startY: (vulnY > 230 ? 30 : vulnY + 20),
        head: [['CVE ID', 'Severidad', 'Descripción']],
        body: vulnBody,
        headStyles: { fillColor: [0, 0, 0] },
    });
  }

  // -- FOOTER --
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Este reporte es estrictamente confidencial y generado automáticamente por CHV Ciberdefensa.', 20, 285);
    doc.text(`Página ${i} de ${totalPages}`, 180, 285);
  }

  // Descargar
  doc.save(`Reporte_Seguridad_${empresaNombre.replace(/\s+/g, '_')}_${date}.pdf`);
};
