import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Equipo, GoleadorResponse, EnfrentamientoResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  exportarGoleadores(goleadores: GoleadorResponse[], torneoId: number, nombreTorneo?: string, fechaProgramar?: string): void {
    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Tabla de Goleadores', 14, 20);

    // Nombre del torneo
    if (nombreTorneo) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(nombreTorneo, 14, 28);
    }

    // Información adicional
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const fecha = new Date().toLocaleDateString('es-ES');
    let startY = nombreTorneo ? 35 : 28;

    if (fechaProgramar) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');

      // Calcular el ancho del texto
      const textWidth = doc.getTextWidth(fechaProgramar);

      // Dibujar rectángulo amarillo de fondo (resaltador)
      doc.setFillColor(255, 255, 0); // Amarillo
      doc.rect(14, startY - 3.5, textWidth, 4.5, 'F'); // F = fill (relleno)

      // Escribir el texto encima del fondo amarillo
      doc.setTextColor(0, 0, 0); // Negro
      doc.text(`${fechaProgramar}`, 14, startY);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      startY += 10;
    }

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
      startY: fechaProgramar ? startY : (nombreTorneo ? 40 : 34),
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [0, 0, 0] // Negro
      },
      headStyles: {
        fillColor: [220, 38, 38], // red-600
        textColor: [255, 255, 255], // Blanco
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
    const nombreArchivo = fechaProgramar
      ? `goleadores-torneo-${torneoId}-${fechaProgramar.replace(/\s+/g, '-')}.pdf`
      : `goleadores-torneo-${torneoId}-${fecha}.pdf`;
    doc.save(nombreArchivo);
  }

  exportarTablaPosiciones(equipos: Equipo[], torneoId: number, nombreTorneo?: string, fechaProgramar?: string): void {
    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Tabla de Posiciones', 14, 20);

    // Nombre del torneo
    if (nombreTorneo) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(nombreTorneo, 14, 28);
    }

    // Información adicional
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const fecha = new Date().toLocaleDateString('es-ES');
    let startY = nombreTorneo ? 35 : 28;

    if (fechaProgramar) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');

      // Calcular el ancho del texto
      const textWidth = doc.getTextWidth(fechaProgramar);

      // Dibujar rectángulo amarillo de fondo (resaltador)
      doc.setFillColor(255, 255, 0); // Amarillo
      doc.rect(14, startY - 3.5, textWidth, 4.5, 'F'); // F = fill (relleno)

      // Escribir el texto encima del fondo amarillo
      doc.setTextColor(0, 0, 0); // Negro
      doc.text(`${fechaProgramar}`, 14, startY);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      startY += 10;
    }

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
      startY: fechaProgramar ? startY : (nombreTorneo ? 40 : 34),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: [0, 0, 0] // Negro
      },
      headStyles: {
        fillColor: [220, 38, 38], // red-600
        textColor: [255, 255, 255], // Blanco
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
    const nombreArchivo = fechaProgramar
      ? `tabla-posiciones-torneo-${torneoId}-${fechaProgramar.replace(/\s+/g, '-')}.pdf`
      : `tabla-posiciones-torneo-${torneoId}-${fecha}.pdf`;
    doc.save(nombreArchivo);
  }

  exportarFixture(
    enfrentamientos: EnfrentamientoResponse[],
    torneoId: number,
    nombreTorneo?: string,
    fechaProgramar?: string
  ): void {
    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Programación de Partidos', 14, 20);

    // Nombre del torneo
    if (nombreTorneo) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(nombreTorneo, 14, 28);
    }

    // Información adicional
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const fecha = new Date().toLocaleDateString('es-ES');
    let startY = nombreTorneo ? 35 : 28;

    if (fechaProgramar) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');

      // Calcular el ancho del texto
      const textWidth = doc.getTextWidth(fechaProgramar);

      // Dibujar rectángulo amarillo de fondo (resaltador)
      doc.setFillColor(255, 255, 0); // Amarillo
      doc.rect(14, startY - 3.5, textWidth, 4.5, 'F'); // F = fill (relleno)

      // Escribir el texto encima del fondo amarillo
      doc.setTextColor(0, 0, 0); // Negro
      doc.text(`${fechaProgramar}`, 14, startY);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      startY += 10;
    }

    // Preparar datos para la tabla
    const headers = [['Fecha', 'Día', 'Hora', 'Local', 'vs', 'Visitante', 'Cancha']];
    const data = enfrentamientos.map((enfrentamiento) => {
      const date = new Date(enfrentamiento.fechaHora);
      const fecha = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const dia = date.toLocaleDateString('es-ES', {
        weekday: 'short'
      });
      const hora = date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const vs = 'vs';

      return [
        fecha,
        dia,
        hora,
        enfrentamiento.equipoLocal,
        vs,
        enfrentamiento.equipoVisitante,
        enfrentamiento.cancha
      ];
    });

    // Generar tabla con estilos condicionales
    autoTable(doc, {
      head: headers,
      body: data,
      startY: nombreTorneo ? 40 : 34,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [0, 0, 0] // Negro
      },
      headStyles: {
        fillColor: [220, 38, 38], // red-600
        textColor: [255, 255, 255], // Blanco
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },  // Fecha
        1: { halign: 'center', cellWidth: 15 },  // Día
        2: { halign: 'center', cellWidth: 20 },  // Hora
        3: { halign: 'center', cellWidth: 40 },  // Local
        4: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },  // Resultado
        5: { halign: 'center', cellWidth: 40 },  // Visitante
        6: { halign: 'center', cellWidth: 22 }   // Cancha
      }
    });

    // Guardar PDF
    const nombreArchivo = fechaProgramar
      ? `fixture-torneo-${torneoId}-${fechaProgramar.replace(/\s+/g, '-')}.pdf`
      : `fixture-torneo-${torneoId}-${fecha}.pdf`;
    doc.save(nombreArchivo);
  }

  private formatearFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

}
