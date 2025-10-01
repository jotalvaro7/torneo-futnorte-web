import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Equipo, Torneo } from '../../../models';
import { EquipoService } from '../../../services/equipo.service';
import { TorneoService } from '../../../services/torneo.service';
import { PdfExportService } from '../../../services/pdf-export.service';

@Component({
  selector: 'app-tabla-posiciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-posiciones.component.html',
  styleUrl: './tabla-posiciones.component.css'
})
export class TablaPosicionesComponent {
  private readonly equipoService = inject(EquipoService);
  private readonly torneoService = inject(TorneoService);
  private readonly pdfExportService = inject(PdfExportService);
  private readonly route = inject(ActivatedRoute);

  // Signal del torneoId desde la ruta
  torneoId = toSignal(
    this.route.params.pipe(map(params => +params['id'])),
    { initialValue: 0 }
  );

  // State signals
  torneo = signal<Torneo | null>(null);
  equipos = signal<Equipo[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // Effect para cargar datos cuando cambia el torneoId
    effect(() => {
      const id = this.torneoId();
      if (id && id > 0) {
        this.cargarDatos(id);
      }
    }, { allowSignalWrites: true });
  }

  private cargarDatos(torneoId: number): void {
    this.loading.set(true);
    this.error.set(null);

    // Cargar torneo
    this.torneoService.obtenerTorneo(torneoId).subscribe({
      next: (torneo) => {
        this.torneo.set(torneo);
      },
      error: (err) => {
        console.error('Error cargando torneo:', err);
      }
    });

    // Cargar equipos del torneo (ya vienen ordenados)
    this.equipoService.buscarEquiposPorTorneo(torneoId).subscribe({
      next: (equipos) => {
        this.equipos.set(equipos);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar la tabla de posiciones');
        this.loading.set(false);
        console.error('Error cargando equipos:', err);
      }
    });
  }

  recargarTabla(): void {
    this.cargarDatos(this.torneoId());
  }

  exportarPDF(): void {
    const nombreTorneo = this.torneo()?.nombre;
    this.pdfExportService.exportarTablaPosiciones(this.equipos(), this.torneoId(), nombreTorneo);
  }
}
