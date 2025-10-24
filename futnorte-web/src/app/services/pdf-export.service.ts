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
      },
      didParseCell: (data) => {
        // Filas intercaladas: gris tenue para filas pares
        if (data.section === 'body' && data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [235, 235, 235]; // gris oscuro
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
      if (currentY + 15 > pageHeight - marginBottom) {
        doc.addPage();
        currentY = 20;
      }

      // Encabezado de fecha con diseño moderno
      doc.setFillColor(245, 245, 245); // Gris muy claro
      doc.roundedRect(14, currentY, 182, 8, 1, 1, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(grupo.fechaTexto, 18, currentY + 5.5);
      doc.setTextColor(0, 0, 0);

      currentY += 11;

      // Dibujar cada partido como tarjeta
      grupo.partidos.forEach((enfrentamiento, indexPartido) => {
        const cardHeight = 13;

        // Verificar si necesitamos una nueva página
        if (currentY + cardHeight > pageHeight - marginBottom) {
          doc.addPage();
          currentY = 20;
        }

        // Dibujar tarjeta de partido
        this.dibujarTarjetaPartido(doc, enfrentamiento, currentY);

        currentY += cardHeight + 2; // Espacio entre tarjetas
      });

      // Espacio entre grupos de fechas
      currentY += 3;
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
          partidos: partidos.sort((a, b) =>
            new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
          )
        };
      });
  }

  private dibujarTarjetaPartido(doc: jsPDF, enfrentamiento: EnfrentamientoResponse, y: number): void {
    const cardX = 14;
    const cardWidth = 182;
    const cardHeight = 13;

    // Determinar color de fondo según estado
    let bgColor: [number, number, number];
    let borderColor: [number, number, number];

    if (enfrentamiento.estado === 'FINALIZADO') {
      bgColor = [240, 253, 244]; // green-50
      borderColor = [34, 197, 94]; // green-500
    } else if (enfrentamiento.estado === 'APLAZADO') {
      bgColor = [254, 252, 232]; // yellow-50
      borderColor = [234, 179, 8]; // yellow-500
    } else {
      bgColor = [248, 250, 252]; // slate-50
      borderColor = [148, 163, 184]; // slate-400
    }

    // Fondo de tarjeta con borde redondeado
    doc.setFillColor(...bgColor);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 1.5, 1.5, 'F');

    // Borde izquierdo de color
    doc.setFillColor(...borderColor);
    doc.roundedRect(cardX, y, 2, cardHeight, 1.5, 1.5, 'F');

    // Hora
    const date = new Date(enfrentamiento.fechaHora);
    const hora = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(hora, cardX + 6, y + 6);

    // Equipo Local
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const equipoLocalX = cardX + 28;
    const equipoLocalMaxWidth = 50;
    const equipoLocalTruncado = this.truncarTexto(doc, enfrentamiento.equipoLocal, equipoLocalMaxWidth);
    doc.text(equipoLocalTruncado, equipoLocalX, y + 6);

    // VS o Resultado
    let resultado: string;
    let resultadoColor: [number, number, number] = [100, 100, 100];

    if (enfrentamiento.estado === 'FINALIZADO' &&
        enfrentamiento.golesLocal !== null &&
        enfrentamiento.golesLocal !== undefined &&
        enfrentamiento.golesVisitante !== null &&
        enfrentamiento.golesVisitante !== undefined) {
      resultado = `${enfrentamiento.golesLocal} - ${enfrentamiento.golesVisitante}`;
      resultadoColor = [220, 38, 38]; // red-600
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
    } else if (enfrentamiento.estado === 'APLAZADO') {
      resultado = 'APLAZADO';
      resultadoColor = [234, 179, 8]; // yellow-500
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
    } else {
      resultado = 'vs';
      resultadoColor = [148, 163, 184]; // slate-400
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    doc.setTextColor(...resultadoColor);
    const resultadoWidth = doc.getTextWidth(resultado);
    const resultadoX = cardX + 90 - (resultadoWidth / 2);
    doc.text(resultado, resultadoX, y + 6.5);

    // Equipo Visitante
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const equipoVisitanteX = cardX + 105;
    const equipoVisitanteMaxWidth = 50;
    const equipoVisitanteTruncado = this.truncarTexto(doc, enfrentamiento.equipoVisitante, equipoVisitanteMaxWidth);
    doc.text(equipoVisitanteTruncado, equipoVisitanteX, y + 6);

    // Cancha con ícono
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const canchaTexto = `📍 ${enfrentamiento.cancha}`;
    const canchaX = cardX + 160;
    doc.text(canchaTexto, canchaX, y + 6);

    // Línea inferior sutil
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(cardX + 4, y + cardHeight - 0.5, cardX + cardWidth - 4, y + cardHeight - 0.5);
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
