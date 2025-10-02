import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TorneoService } from '../../../services/torneo.service';
import { Torneo, EstadoTorneo } from '../../../models';

@Component({
  selector: 'app-torneo-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './torneo-detail.component.html',
  styleUrl: './torneo-detail.component.css'
})
export class TorneoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly torneoService = inject(TorneoService);

  torneo = signal<Torneo | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  torneoId = computed(() => this.torneo()?.id);
  canStart = computed(() =>
    this.torneo()?.estado === EstadoTorneo.CREADO
  );
  canFinalize = computed(() =>
    this.torneo()?.estado === EstadoTorneo.EN_CURSO
  );
  canCancel = computed(() =>
    this.torneo()?.estado !== EstadoTorneo.FINALIZADO
  );
  canDelete = computed(() => {
    const estado = this.torneo()?.estado;
    return estado === EstadoTorneo.CANCELADO || estado === EstadoTorneo.FINALIZADO;
  });

  estadoFormateado = computed(() => {
    return this.torneo()?.estado?.replace('_', ' ') || '';
  })

  statusColor = computed(() =>
    this.getEstadoColor(this.torneo()?.estado || '')
  );
  statusDotColor = computed(() =>
    this.getEstadoDotColor(this.torneo()?.estado || '')
  );

  EstadoTorneo = EstadoTorneo;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarTorneo(parseInt(id, 10));
    } else {
      this.router.navigate(['/torneos']);
    }
  }

  cargarTorneo(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.torneoService.obtenerTorneo(id).subscribe({
      next: (torneo) => {
        this.torneo.set(torneo);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar el torneo: ' + error.message);
        this.loading.set(false);
      }
    });
  }

  cambiarEstadoTorneo(accion: 'iniciar' | 'cancelar' | 'finalizar'): void {
    const tournamentId = this.torneoId();
    if (!tournamentId) return;

    let observable;
    switch (accion) {
      case 'iniciar':
        observable = this.torneoService.iniciarTorneo(tournamentId);
        break;
      case 'cancelar':
        observable = this.torneoService.cancelarTorneo(tournamentId);
        break;
      case 'finalizar':
        observable = this.torneoService.finalizarTorneo(tournamentId);
        break;
    }

    observable.subscribe({
      next: () => {
        this.cargarTorneo(tournamentId);
      },
      error: (error) => {
        this.error.set(`Error al ${accion} torneo: ` + error.message);
      }
    });
  }

  eliminarTorneo(): void {
    const tournamentId = this.torneoId();
    if (!tournamentId) return;

    if (confirm('¿Está seguro de que desea eliminar este torneo?')) {
      this.torneoService.eliminarTorneo(tournamentId).subscribe({
        next: () => {
          this.router.navigate(['/torneos']);
        },
        error: (error) => {
          this.error.set('Error al eliminar torneo: ' + error.message);
        }
      });
    }
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case EstadoTorneo.CREADO:
        return 'text-blue-800 bg-blue-100';
      case EstadoTorneo.EN_CURSO:
        return 'text-green-800 bg-green-100';
      case EstadoTorneo.FINALIZADO:
        return 'text-gray-800 bg-gray-100';
      case EstadoTorneo.CANCELADO:
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  }

  getEstadoDotColor(estado: string): string {
    switch (estado) {
      case EstadoTorneo.CREADO:
        return 'bg-blue-500';
      case EstadoTorneo.EN_CURSO:
        return 'bg-green-500';
      case EstadoTorneo.FINALIZADO:
        return 'bg-gray-500';
      case EstadoTorneo.CANCELADO:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }
}
