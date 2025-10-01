import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GoleadorResponse, Torneo } from '../../../models';
import { JugadorService } from '../../../services/jugador.service';
import { TorneoService } from '../../../services/torneo.service';
import { PdfExportService } from '../../../services/pdf-export.service';

@Component({
  selector: 'app-goleadores-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './goleadores-list.component.html',
  styleUrl: './goleadores-list.component.css'
})
export class GoleadoresListComponent {
  private readonly jugadorService = inject(JugadorService);
  private readonly torneoService = inject(TorneoService);
  private readonly pdfExportService = inject(PdfExportService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Signal del torneoId desde la ruta
  torneoId = toSignal(
    this.route.params.pipe(map(params => +params['id'])),
    { initialValue: 0 }
  );

  // State signals
  torneo = signal<Torneo | null>(null);
  goleadores = signal<GoleadorResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed signal para estadísticas
  totalGoles = computed(() =>
    this.goleadores().reduce((acc, g) => acc + g.numeroGoles, 0)
  );

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

    // Cargar goleadores
    this.jugadorService.obtenerGoleadoresPorTorneo(torneoId).subscribe({
      next: (goleadores) => {
        this.goleadores.set(goleadores);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar los goleadores');
        this.loading.set(false);
        console.error('Error cargando goleadores:', err);
      }
    });
  }

  recargarGoleadores(): void {
    this.cargarDatos(this.torneoId());
  }

  exportarPDF(): void {
    const nombreTorneo = this.torneo()?.nombre;
    this.pdfExportService.exportarGoleadores(this.goleadores(), this.torneoId(), nombreTorneo);
  }

  onBack(): void {
    this.router.navigate(['/torneos', this.torneoId()]);
  }
}