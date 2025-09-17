import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EquipoService } from '../../../services/equipo.service';
import { EnfrentamientoService } from '../../../services/enfrentamiento.service';
import { Equipo, EnfrentamientoResponse } from '../../../models';
import { EquipoJugadoresComponent } from '../equipo-jugadores/equipo-jugadores.component';

@Component({
  selector: 'app-equipo-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EquipoJugadoresComponent],
  templateUrl: './equipo-detail.component.html',
  styleUrl: './equipo-detail.component.css'
})
export class EquipoDetailComponent implements OnInit {
  private readonly equipoService = inject(EquipoService);
  private readonly enfrentamientoService = inject(EnfrentamientoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  equipo = signal<Equipo | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  deleting = signal(false);

  // Historial de enfrentamientos
  enfrentamientos = signal<EnfrentamientoResponse[]>([]);
  loadingEnfrentamientos = signal(false);
  mostrarHistorial = signal(false);

  equipoId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? +id : null;
  });

  // Computed statistics
  diferenciadeGoles = computed(() => {
    return (this.equipo()) ? this.equipo()?.diferenciaGoles! : 0;
  });

  porcentajeVictorias = computed(() => {
    const equipo = this.equipo();
    if (!equipo || !equipo.partidosJugados) return 0;
    return Math.round(((equipo.partidosGanados || 0) / equipo.partidosJugados) * 100);
  });

  // Computed properties para el historial
  enfrentamientosOrdenados = computed(() => {
    return [...this.enfrentamientos()].sort((a, b) => {
      const dateA = new Date(a.fechaHora);
      const dateB = new Date(b.fechaHora);
      return dateB.getTime() - dateA.getTime(); // Más recientes primero
    });
  });

  totalEnfrentamientos = computed(() => this.enfrentamientos().length);

  ngOnInit(): void {
    const id = this.equipoId();
    if (id) {
      this.cargarEquipo(id);
    } else {
      this.error.set('ID de equipo inválido');
    }
  }

  cargarEquipo(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.equipoService.buscarEquipoPorId(id).subscribe({
      next: (equipo) => {
        this.equipo.set(equipo);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar equipo: ' + error.message);
        this.loading.set(false);
      }
    });
  }

  eliminarEquipo(): void {
    const equipo = this.equipo();
    if (!equipo?.id) return;

    if (confirm(`¿Está seguro de que desea eliminar el equipo "${equipo.nombre}"? Esta acción no se puede deshacer.`)) {
      this.deleting.set(true);
      this.equipoService.eliminarEquipo(equipo.id).subscribe({
        next: () => {
          this.router.navigate(['/equipos']);
        },
        error: (error) => {
          this.error.set('Error al eliminar equipo: ' + error.message);
          this.deleting.set(false);
        }
      });
    }
  }

  onEdit(): void {
    const equipoId = this.equipoId();
    if (equipoId) {
      this.router.navigate(['/equipos', equipoId, 'editar']);
    }
  }

  onBack(): void {
    const torneoId = this.equipo()?.torneoId;
    this.router.navigate(['/torneos', torneoId, 'equipos']);
  }

  // Métodos para historial de enfrentamientos
  cargarHistorialEnfrentamientos(): void {
    const equipoId = this.equipoId();
    if (!equipoId) return;

    this.loadingEnfrentamientos.set(true);

    this.enfrentamientoService.obtenerEnfrentamientosPorEquipo(equipoId).subscribe({
      next: (enfrentamientos) => {
        this.enfrentamientos.set(enfrentamientos);
        this.loadingEnfrentamientos.set(false);
        this.mostrarHistorial.set(true);
      },
      error: (error) => {
        this.error.set('Error al cargar historial: ' + error.message);
        this.loadingEnfrentamientos.set(false);
      }
    });
  }

  cerrarHistorial(): void {
    this.mostrarHistorial.set(false);
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('es-CO');
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PROGRAMADO': return 'bg-blue-100 text-blue-800';
      case 'FINALIZADO': return 'bg-green-100 text-green-800';
      case 'APLAZADO': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  esEquipoLocal(enfrentamiento: EnfrentamientoResponse): boolean {
    return enfrentamiento.equipoLocal === this.equipo()?.nombre;
  }
}
