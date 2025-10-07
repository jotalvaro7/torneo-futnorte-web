import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Equipo, GoleadorResponse, EnfrentamientoResponse } from '../models';

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

  exportarFixture(
    enfrentamientos: EnfrentamientoResponse[],
    torneoId: number,
    nombreTorneo?: string,
    fechaInicio?: string,
    fechaFin?: string
  ): void {
    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Fixture de Partidos', 14, 20);

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
    let startY = nombreTorneo ? 34 : 28;
    doc.text(`Fecha de generación: ${fecha}`, 14, startY);

    if (fechaInicio && fechaFin) {
      const fechaInicioFormateada = this.formatearFecha(fechaInicio);
      const fechaFinFormateada = this.formatearFecha(fechaFin);
      doc.text(`Período: ${fechaInicioFormateada} - ${fechaFinFormateada}`, 14, startY + 6);
      startY += 6;
    }

    doc.text(`Total de partidos: ${enfrentamientos.length}`, 14, startY + 6);

    // Estadísticas por estado
    const programados = enfrentamientos.filter(e => e.estado === 'PROGRAMADO').length;
    const finalizados = enfrentamientos.filter(e => e.estado === 'FINALIZADO').length;
    const aplazados = enfrentamientos.filter(e => e.estado === 'APLAZADO').length;

    doc.text(`Programados: ${programados} | Finalizados: ${finalizados} | Aplazados: ${aplazados}`, 14, startY + 12);

    // Preparar datos para la tabla
    const headers = [['Fecha/Hora', 'Local', 'Resultado', 'Visitante', 'Cancha', 'Estado']];
    const data = enfrentamientos.map((enfrentamiento) => {
      const fechaHora = this.formatearFechaHora(enfrentamiento.fechaHora);
      const resultado = enfrentamiento.estado === 'FINALIZADO'
        ? `${enfrentamiento.golesLocal ?? 0} - ${enfrentamiento.golesVisitante ?? 0}`
        : 'VS';
      const estado = this.getEstadoTexto(enfrentamiento.estado);

      return [
        fechaHora,
        enfrentamiento.equipoLocal,
        resultado,
        enfrentamiento.equipoVisitante,
        enfrentamiento.cancha,
        estado
      ];
    });

    // Generar tabla con estilos condicionales
    autoTable(doc, {
      head: headers,
      body: data,
      startY: nombreTorneo ? 58 : 52,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5
      },
      headStyles: {
        fillColor: [51, 65, 85], // slate-700
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 32 },
        1: { halign: 'center', cellWidth: 40 },
        2: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
        3: { halign: 'center', cellWidth: 40 },
        4: { halign: 'center', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 25 }
      },
      didParseCell: (data) => {
        // Aplicar colores según el estado
        if (data.section === 'body' && data.column.index === 5) {
          const estado = data.cell.raw as string;
          if (estado === 'PROGRAMADO') {
            data.cell.styles.fillColor = [219, 234, 254]; // blue-100
            data.cell.styles.textColor = [30, 64, 175]; // blue-800
            data.cell.styles.fontStyle = 'bold';
          } else if (estado === 'FINALIZADO') {
            data.cell.styles.fillColor = [220, 252, 231]; // green-100
            data.cell.styles.textColor = [22, 101, 52]; // green-800
            data.cell.styles.fontStyle = 'bold';
          } else if (estado === 'APLAZADO') {
            data.cell.styles.fillColor = [254, 243, 199]; // yellow-100
            data.cell.styles.textColor = [161, 98, 7]; // yellow-800
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Resaltar resultado si es partido finalizado
        if (data.section === 'body' && data.column.index === 2) {
          const resultado = data.cell.raw as string;
          if (resultado !== 'VS') {
            data.cell.styles.fillColor = [220, 252, 231]; // green-100
            data.cell.styles.textColor = [22, 101, 52]; // green-800
          }
        }
      }
    });

    // Guardar PDF
    const nombreArchivo = fechaInicio && fechaFin
      ? `fixture-torneo-${torneoId}-${fechaInicio}-${fechaFin}.pdf`
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

  private formatearFechaHora(dateTime: string): string {
    const date = new Date(dateTime);
    const fechaFormateada = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const horaFormateada = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${fechaFormateada}\n${horaFormateada}`;
  }

  private getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'PROGRAMADO': return 'PROGRAMADO';
      case 'FINALIZADO': return 'FINALIZADO';
      case 'APLAZADO': return 'APLAZADO';
      default: return estado;
    }
  }
}
