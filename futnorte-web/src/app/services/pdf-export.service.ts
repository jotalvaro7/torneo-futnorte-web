import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Equipo, GoleadorResponse, EnfrentamientoResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  private readonly logoUrl = 'assets/logo/futnorte.png';
  private logoBase64: string | null = null;

  constructor() {
    this.cargarLogo();
  }

  private cargarLogo(): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        this.logoBase64 = canvas.toDataURL('image/png');
      }
    };
    img.onerror = (error) => {
      console.warn('No se pudo cargar el logo:', error);
    };
    img.src = this.logoUrl;
  }

  private agregarLogo(doc: jsPDF, ajusteX: number = 33): void {
    try {
      if (!this.logoBase64) {
        console.warn('Logo no disponible todavía');
        return;
      }

      // Agregar logo en la esquina superior derecha, alineado con la última columna de las tablas
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 25;
      const logoHeight = 25;
      const xPosition = pageWidth - logoWidth - ajusteX; // Alineado con el margen derecho de las tablas
      const yPosition = 14;

      doc.addImage(this.logoBase64, 'PNG', xPosition, yPosition, logoWidth, logoHeight);
    } catch (error) {
      console.warn('No se pudo agregar el logo al PDF:', error);
    }
  }

  exportarGoleadores(goleadores: GoleadorResponse[], torneoId: number, nombreTorneo?: string, fechaProgramar?: string): void {
    const doc = new jsPDF();

    // Agregar logo
    this.agregarLogo(doc);

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
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const textWidth = doc.getTextWidth(fechaProgramar);

      // Rectángulo rojo con esquinas redondeadas (estilo moderno)
      doc.setFillColor(220, 38, 38); // red-600
      doc.roundedRect(14, startY - 4, textWidth + 4, 6, 1, 1, 'F');

      doc.setTextColor(255, 255, 255); // Blanco
      doc.text(fechaProgramar, 16, startY);
      doc.setTextColor(0, 0, 0);

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
      didParseCell: (data) => {
        // Filas intercaladas: blanco/gris claro
        if (data.section === 'body' && data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [243, 244, 246]; // gray-100
        }
      }
    });

    // Guardar PDF
    const nombreArchivo = fechaProgramar
      ? `goleadores-torneo-${torneoId}-${fechaProgramar.replace(/\s+/g, '-')}.pdf`
      : `goleadores-torneo-${torneoId}-${fecha}.pdf`;
    doc.save(nombreArchivo);
  }

  exportarTablaPosiciones(equipos: Equipo[], torneoId: number, nombreTorneo?: string, fechaProgramar?: string): void {
    const doc = new jsPDF();

    // Agregar logo
    this.agregarLogo(doc);

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
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const textWidth = doc.getTextWidth(fechaProgramar);

      // Rectángulo rojo con esquinas redondeadas (estilo moderno)
      doc.setFillColor(220, 38, 38); // red-600
      doc.roundedRect(14, startY - 4, textWidth + 4, 6, 1, 1, 'F');

      doc.setTextColor(255, 255, 255); // Blanco
      doc.text(fechaProgramar, 16, startY);
      doc.setTextColor(0, 0, 0);

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
      },
      didParseCell: (data) => {
        // Filas intercaladas: blanco/gris claro
        if (data.section === 'body' && data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [243, 244, 246]; // gray-100
        }
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

    // Agregar logo con ajuste específico para fixture
    this.agregarLogo(doc, 12);

    // Determinar el tipo de partidos para ajustar el título
    const tienePartidosProgramados = enfrentamientos.some(e => e.estado === 'PROGRAMADO');
    const tienePartidosFinalizadosOAplazados = enfrentamientos.some(e => e.estado === 'FINALIZADO' || e.estado === 'APLAZADO');

    // Título del documento (dinámico según el estado de los partidos)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    let titulo: string;
    if (tienePartidosProgramados && tienePartidosFinalizadosOAplazados) {
      titulo = 'Programación y Resultados';
    } else if (tienePartidosProgramados) {
      titulo = 'Programación de Partidos';
    } else {
      titulo = 'Resultados de Partidos';
    }
    doc.text(titulo, 14, 22);

    // Nombre del torneo
    if (nombreTorneo) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(nombreTorneo, 14, 29);
      doc.setTextColor(0, 0, 0);
    }

    let startY = nombreTorneo ? 36 : 29;

    // Jornada/Fecha programar con diseño moderno
    if (fechaProgramar) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const textWidth = doc.getTextWidth(fechaProgramar);

      // Rectángulo con esquinas más modernas
      doc.setFillColor(220, 38, 38); // red-600
      doc.roundedRect(14, startY - 4, textWidth + 4, 6, 1, 1, 'F');

      doc.setTextColor(255, 255, 255);
      doc.text(fechaProgramar, 16, startY);
      doc.setTextColor(0, 0, 0);

      startY += 10;
    }

    // Agrupar enfrentamientos por fecha
    const enfrentamientosPorFecha = this.agruparEnfrentamientosPorFecha(enfrentamientos);

    let currentY = startY;
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginBottom = 20;

    // Iterar sobre cada grupo de fecha
    enfrentamientosPorFecha.forEach((grupo, indexGrupo) => {
      // Verificar si necesitamos una nueva página para el encabezado de fecha
      if (currentY + 20 > pageHeight - marginBottom) {
        doc.addPage();
        currentY = 20;
      }

      // Encabezado de fecha con diseño moderno
      doc.setFillColor(209, 213, 219); // gray-300 (gris más oscuro)
      doc.roundedRect(14, currentY, 182, 8, 1, 1, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(grupo.fechaTexto, 18, currentY + 5.5);
      doc.setTextColor(0, 0, 0);

      currentY += 8;

      // Headers de columnas (pegado al header de fecha)
      this.dibujarHeadersColumnas(doc, currentY);
      currentY += 6;

      // Dibujar cada partido como fila
      grupo.partidos.forEach((enfrentamiento, indexPartido) => {
        const rowHeight = 11;

        // Verificar si necesitamos una nueva página
        if (currentY + rowHeight > pageHeight - marginBottom) {
          doc.addPage();
          currentY = 20;
          // Redibujar headers de columnas en nueva página
          this.dibujarHeadersColumnas(doc, currentY);
          currentY += 8;
        }

        // Dibujar fila de partido
        this.dibujarFilaPartido(doc, enfrentamiento, currentY, indexPartido);

        currentY += rowHeight;
      });

      // Espacio entre grupos de fechas
      currentY += 4;
    });

    // Guardar PDF
    const fecha = new Date().toLocaleDateString('es-ES');
    const nombreArchivo = fechaProgramar
      ? `fixture-torneo-${torneoId}-${fechaProgramar.replace(/\s+/g, '-')}.pdf`
      : `fixture-torneo-${torneoId}-${fecha}.pdf`;
    doc.save(nombreArchivo);
  }

  private agruparEnfrentamientosPorFecha(enfrentamientos: EnfrentamientoResponse[]): Array<{fechaTexto: string, partidos: EnfrentamientoResponse[]}> {
    const grupos = new Map<string, EnfrentamientoResponse[]>();

    enfrentamientos.forEach(enfrentamiento => {
      const date = new Date(enfrentamiento.fechaHora);
      const fechaKey = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      const fechaTexto = date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      if (!grupos.has(fechaKey)) {
        grupos.set(fechaKey, []);
      }
      grupos.get(fechaKey)!.push(enfrentamiento);
    });

    // Convertir a array y ordenar por fecha
    return Array.from(grupos.entries())
      .sort((a, b) => {
        const [diaA, mesA, añoA] = a[0].split('/').map(Number);
        const [diaB, mesB, añoB] = b[0].split('/').map(Number);
        const fechaA = new Date(añoA, mesA - 1, diaA);
        const fechaB = new Date(añoB, mesB - 1, diaB);
        return fechaA.getTime() - fechaB.getTime();
      })
      .map(([_, partidos]) => {
        const primeraFecha = new Date(partidos[0].fechaHora);
        const fechaTexto = primeraFecha.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        // Capitalizar primera letra
        const fechaCapitalizada = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);

        return {
          fechaTexto: fechaCapitalizada,
          partidos: partidos.sort((a, b) => {
            // Primero ordenar por cancha
            const canchaComparison = a.cancha.localeCompare(b.cancha);
            if (canchaComparison !== 0) return canchaComparison;
            // Luego por hora dentro de cada cancha
            return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime();
          })
        };
      });
  }

  private dibujarHeadersColumnas(doc: jsPDF, y: number): void {
    const startX = 14;
    const colWidths = {
      enfrentamiento: 105,
      hora: 30,
      cancha: 47
    };

    // Fondo del header
    doc.setFillColor(220, 38, 38); // red-600
    doc.roundedRect(startX, y, 182, 6, 1, 1, 'F');

    // Textos de headers
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);

    // Header Partido (centrado)
    const enfrentamientoX = startX + colWidths.enfrentamiento / 2;
    const enfrentamientoWidth = doc.getTextWidth('Partido');
    doc.text('Partido', enfrentamientoX - enfrentamientoWidth / 2, y + 4.2);

    // Header Hora (centrado)
    const horaX = startX + colWidths.enfrentamiento + colWidths.hora / 2;
    const horaWidth = doc.getTextWidth('Hora');
    doc.text('Hora', horaX - horaWidth / 2, y + 4.2);

    // Header Cancha (centrado)
    const canchaX = startX + colWidths.enfrentamiento + colWidths.hora + colWidths.cancha / 2;
    const canchaWidth = doc.getTextWidth('Cancha');
    doc.text('Cancha', canchaX - canchaWidth / 2, y + 4.2);

    doc.setTextColor(0, 0, 0);
  }

  private dibujarFilaPartido(doc: jsPDF, enfrentamiento: EnfrentamientoResponse, y: number, index: number): void {
    const startX = 14;
    const colWidths = {
      enfrentamiento: 105,
      hora: 30,
      cancha: 47
    };
    const rowHeight = 11;

    // Determinar color de fondo según estado (filas intercaladas)
    let bgColor: [number, number, number];

    if (enfrentamiento.estado === 'APLAZADO') {
      // Partidos aplazados: fondo amarillo intercalado
      bgColor = index % 2 === 0 ? [254, 252, 232] : [254, 249, 195]; // yellow-50 / yellow-100
    } else {
      // Partidos finalizados y programados: blanco/gris intercalado
      bgColor = index % 2 === 0 ? [255, 255, 255] : [243, 244, 246]; // white / gray-100
    }

    // Fondo de fila
    doc.setFillColor(...bgColor);
    doc.rect(startX, y, 182, rowHeight, 'F');

    // Línea separadora inferior
    doc.setDrawColor(229, 231, 235); // gray-200
    doc.setLineWidth(0.1);
    doc.line(startX, y + rowHeight, startX + 182, y + rowHeight);

    // Columna 1: Enfrentamiento con alineación fija
    const baselineY = y + 7;

    // Posición fija del vs/resultado en el centro de la columna
    const resultadoCentroX = startX + colWidths.enfrentamiento / 2;

    // VS o Resultado
    let resultado: string;
    let resultadoColor: [number, number, number];
    let resultadoSize: number;

    if (enfrentamiento.estado === 'FINALIZADO' &&
        enfrentamiento.golesLocal !== null &&
        enfrentamiento.golesLocal !== undefined &&
        enfrentamiento.golesVisitante !== null &&
        enfrentamiento.golesVisitante !== undefined) {
      resultado = `${enfrentamiento.golesLocal} - ${enfrentamiento.golesVisitante}`;
      resultadoColor = [220, 38, 38]; // red-600
      resultadoSize = 11;
    } else if (enfrentamiento.estado === 'APLAZADO') {
      resultado = 'APLAZADO';
      resultadoColor = [234, 179, 8]; // yellow-600
      resultadoSize = 8;
    } else {
      resultado = 'vs';
      resultadoColor = [100, 116, 139]; // slate-500
      resultadoSize = 9;
    }

    // Calcular ancho del resultado para centrarlo
    doc.setFontSize(resultadoSize);
    const resultadoWidth = doc.getTextWidth(resultado);
    const resultadoX = resultadoCentroX - (resultadoWidth / 2);

    // Dibujar resultado/vs centrado (posición fija)
    doc.setTextColor(...resultadoColor);
    doc.setFont('helvetica', 'bold');
    doc.text(resultado, resultadoX, baselineY, { baseline: 'alphabetic' });

    // Equipo Local - alineado a la derecha del resultado
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const maxWidthLocal = resultadoX - startX - 4; // 4px de margen
    const equipoLocalTruncado = this.truncarTexto(doc, enfrentamiento.equipoLocal || 'Equipo Local', maxWidthLocal);
    const localWidth = doc.getTextWidth(equipoLocalTruncado);
    doc.text(equipoLocalTruncado, resultadoX - localWidth - 2, baselineY); // 2px de espacio

    // Equipo Visitante - alineado a la izquierda del resultado
    const maxWidthVisitante = (startX + colWidths.enfrentamiento) - (resultadoX + resultadoWidth) - 4; // 4px de margen
    const equipoVisitanteTruncado = this.truncarTexto(doc, enfrentamiento.equipoVisitante || 'Equipo Visitante', maxWidthVisitante);
    doc.text(equipoVisitanteTruncado, resultadoX + resultadoWidth + 2, baselineY); // 2px de espacio

    // Columna 2: Hora
    const date = new Date(enfrentamiento.fechaHora);
    const hora = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const horaX = startX + colWidths.enfrentamiento + colWidths.hora / 2;
    const horaWidth = doc.getTextWidth(hora);
    doc.text(hora, horaX - horaWidth / 2, y + 7);

    // Columna 3: Cancha
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const canchaX = startX + colWidths.enfrentamiento + colWidths.hora + colWidths.cancha / 2;
    const canchaTruncada = this.truncarTexto(doc, enfrentamiento.cancha, 43);
    const canchaWidth = doc.getTextWidth(canchaTruncada);
    doc.text(canchaTruncada, canchaX - canchaWidth / 2, y + 7);

    doc.setTextColor(0, 0, 0);
  }

  private truncarTexto(doc: jsPDF, texto: string, maxWidth: number): string {
    const textWidth = doc.getTextWidth(texto);
    if (textWidth <= maxWidth) {
      return texto;
    }

    // Truncar y agregar puntos suspensivos
    let truncado = texto;
    while (doc.getTextWidth(truncado + '...') > maxWidth && truncado.length > 0) {
      truncado = truncado.slice(0, -1);
    }
    return truncado + '...';
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
