import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GoleadorResponse } from '../../../models';
import { JugadorService } from '../../../services/jugador.service';

@Component({
  selector: 'app-goleadores-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './goleadores-list.component.html',
  styleUrl: './goleadores-list.component.css'
})
export class GoleadoresListComponent {
  private readonly jugadorService = inject(JugadorService);
  private readonly route = inject(ActivatedRoute);

  // Signal del torneoId desde la ruta
  torneoId = toSignal(
    this.route.params.pipe(map(params => +params['id'])),
    { initialValue: 0 }
  );

  // State signals
  goleadores = signal<GoleadorResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed signal para estadísticas
  totalGoles = computed(() =>
    this.goleadores().reduce((acc, g) => acc + g.numeroGoles, 0)
  );

  constructor() {
    // Effect para cargar goleadores cuando cambia el torneoId
    effect(() => {
      const id = this.torneoId();
      if (id && id > 0) {
        this.cargarGoleadores(id);
      }
    });
  }

  private cargarGoleadores(torneoId: number): void {
    this.loading.set(true);
    this.error.set(null);

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
    this.cargarGoleadores(this.torneoId());
  }
}