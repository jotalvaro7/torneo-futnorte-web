import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Equipo, GoleadorResponse } from '../models';

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
    doc.text(`Fecha: ${fecha}`, 14, startY);
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
    });

    // Guardar PDF
    doc.save(`goleadores-torneo-${torneoId}-${fecha}.pdf`);
  }

  exportarTablaPosiciones(equipos: Equipo[], torneoId: number, nombreTorneo?: string): void {
    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Tabla de Posiciones', 14, 20);

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
    const startY = nombreTorneo ? 34 : 28;
    doc.text(`Fecha: ${fecha}`, 14, startY);
    doc.text(`Equipos participantes: ${equipos.length}`, 14, startY + 6);

    // Preparar datos para la tabla
    const headers = [['Pos', 'Equipo', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'Pts']];
    const data = equipos.map((equipo, index) => [
      (index + 1).toString(),
      equipo.nombre,
      (equipo.partidosJugados || 0).toString(),
      (equipo.partidosGanados || 0).toString(),
      (equipo.partidosEmpatados || 0).toString(),
      (equipo.partidosPerdidos || 0).toString(),
      (equipo.golesAFavor || 0).toString(),
      (equipo.golesEnContra || 0).toString(),
      ((equipo.diferenciaGoles || 0) > 0 ? '+' : '') + (equipo.diferenciaGoles || 0).toString(),
      (equipo.puntos || 0).toString()
    ]);

    // Generar tabla
    autoTable(doc, {
      head: headers,
      body: data,
      startY: nombreTorneo ? 46 : 40,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [51, 65, 85], // slate-700
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'center', cellWidth: 50 },
        2: { halign: 'center', cellWidth: 12 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'center', cellWidth: 12 },
        5: { halign: 'center', cellWidth: 12 },
        6: { halign: 'center', cellWidth: 12 },
        7: { halign: 'center', cellWidth: 12 },
        8: { halign: 'center', cellWidth: 12 },
        9: { halign: 'center', cellWidth: 15, fontStyle: 'bold' }
      }
    });

    // Guardar PDF
    doc.save(`tabla-posiciones-torneo-${torneoId}-${fecha}.pdf`);
  }
}
