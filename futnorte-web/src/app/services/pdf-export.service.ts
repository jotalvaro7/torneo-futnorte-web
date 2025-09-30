import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoleadorResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  exportarGoleadores(goleadores: GoleadorResponse[], torneoId: number, nombreTorneo?: string): void {
    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Tabla de Goleadores', 14, 20);

    // Nombre del torneo
    if (nombreTorneo) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(nombreTorneo, 14, 28);
    }

    // Información adicional
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const fecha = new Date().toLocaleDateString('es-ES');
    const totalGoles = goleadores.reduce((acc, g) => acc + g.numeroGoles, 0);
    const startY = nombreTorneo ? 34 : 28;
    doc.text(`Fecha de generación: ${fecha}`, 14, startY);
    doc.text(`Total de goles: ${totalGoles}`, 14, startY + 6);

    // Preparar datos para la tabla
    const headers = [['Pos.', 'Jugador', 'Equipo', 'Goles']];
    const data = goleadores.map((goleador, index) => [
      (index + 1).toString(),
      `${goleador.nombre} ${goleador.apellido}`,
      goleador.nombreEquipo,
      goleador.numeroGoles.toString()
    ]);

    // Generar tabla
    autoTable(doc, {
      head: headers,
      body: data,
      startY: nombreTorneo ? 46 : 40,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [51, 65, 85], // slate-700
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 70 },
        2: { halign: 'center', cellWidth: 60 },
        3: { halign: 'center', cellWidth: 20, fontStyle: 'bold' }
      },
      didDrawCell: (data) => {
        // Destacar los primeros 3 lugares
        if (data.section === 'body' && data.column.index === 0) {
          const pos = parseInt(data.cell.text[0]);
          if (pos <= 3) {
            // Oro, Plata, Bronce
            if (pos === 1) {
              doc.setFillColor(250, 204, 21); // Oro
            } else if (pos === 2) {
              doc.setFillColor(203, 213, 225); // Plata
            } else {
              doc.setFillColor(251, 146, 60); // Bronce
            }
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
            doc.setTextColor(pos === 2 ? 0 : 255);
            doc.text(data.cell.text, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center', baseline: 'middle' });
            doc.setTextColor(0);
          }
        }
      }
    });

    // Guardar PDF
    doc.save(`goleadores-torneo-${torneoId}-${fecha}.pdf`);
  }
}
