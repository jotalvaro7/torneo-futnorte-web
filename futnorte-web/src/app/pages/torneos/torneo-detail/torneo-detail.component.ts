import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TorneoService } from '../../../services/torneo.service';
import { Torneo, EstadoTorneo } from '../../../models';

@Component({
  selector: 'app-torneo-detail',
  standalone: true,
  imports: [DatePipe, RouterModule],
  templateUrl: './torneo-detail.component.html',
  styleUrl: './torneo-detail.component.css'
})
export class TorneoDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly torneoService = inject(TorneoService);

  torneo: Torneo | null = null;
  loading = false;
  error: string | null = null;

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
    this.loading = true;
    this.error = null;

    this.torneoService.obtenerTorneo(id).subscribe({
      next: (torneo) => {
        this.torneo = torneo;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el torneo: ' + error.message;
        this.loading = false;
      }
    });
  }

  cambiarEstadoTorneo(accion: 'iniciar' | 'cancelar' | 'finalizar'): void {
    if (!this.torneo?.id) return;

    let observable;
    switch (accion) {
      case 'iniciar':
        observable = this.torneoService.iniciarTorneo(this.torneo.id);
        break;
      case 'cancelar':
        observable = this.torneoService.cancelarTorneo(this.torneo.id);
        break;
      case 'finalizar':
        observable = this.torneoService.finalizarTorneo(this.torneo.id);
        break;
    }

    observable.subscribe({
      next: () => {
        this.cargarTorneo(this.torneo!.id!);
      },
      error: (error) => {
        this.error = `Error al ${accion} torneo: ` + error.message;
      }
    });
  }

  eliminarTorneo(): void {
    if (!this.torneo?.id) return;

    if (confirm('¿Está seguro de que desea eliminar este torneo?')) {
      this.torneoService.eliminarTorneo(this.torneo.id).subscribe({
        next: () => {
          this.router.navigate(['/torneos']);
        },
        error: (error) => {
          this.error = 'Error al eliminar torneo: ' + error.message;
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
