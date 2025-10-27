import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EquipoService } from '../../../services/equipo.service';
import { EnfrentamientoService } from '../../../services/enfrentamiento.service';
import { JugadorService } from '../../../services/jugador.service';
import { AlertService } from '../../../services/alert.service';
import { Equipo, EnfrentamientoResponse, ActualizarEnfrentamientoRequest, Jugador } from '../../../models';
import { EquipoJugadoresComponent } from '../equipo-jugadores/equipo-jugadores.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { EnfrentamientoEditModalComponent } from '../../torneos/torneo-fixture/components/enfrentamiento-edit-modal/enfrentamiento-edit-modal.component';

@Component({
  selector: 'app-equipo-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EquipoJugadoresComponent, DeleteConfirmationModalComponent, EnfrentamientoEditModalComponent],
  templateUrl: './equipo-detail.component.html',
  styleUrl: './equipo-detail.component.css'
})
export class EquipoDetailComponent implements OnInit {
  private readonly equipoService = inject(EquipoService);
  private readonly enfrentamientoService = inject(EnfrentamientoService);
  private readonly jugadorService = inject(JugadorService);
  private readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  equipo = signal<Equipo | null>(null);
  loading = signal(false);
  deleting = signal(false);

  // Modal de confirmación
  showDeleteModal = signal(false);
  deleteModalMessage = computed(() => {
    const equipo = this.equipo();
    if (!equipo) return '';
    return `¿Está seguro de que desea eliminar el equipo <span class="font-bold text-slate-900">"${equipo.nombre}"</span>?`;
  });

  // Historial de enfrentamientos
  enfrentamientos = signal<EnfrentamientoResponse[]>([]);
  loadingEnfrentamientos = signal(false);
  mostrarHistorial = signal(false);

  // Modal de edición de enfrentamiento
  showEditEnfrentamientoModal = signal(false);
  editingEnfrentamiento = signal<EnfrentamientoResponse | null>(null);
  jugadoresLocal = signal<Jugador[]>([]);
  jugadoresVisitante = signal<Jugador[]>([]);
  updatingEnfrentamiento = signal(false);

  // Toggle para mostrar/ocultar estadísticas y jugadores
  mostrarEstadisticas = signal(false);
  mostrarJugadores = signal(true); // Mostrar jugadores por defecto

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
    }
  }

  cargarEquipo(id: number): void {
    this.loading.set(true);

    this.equipoService.buscarEquipoPorId(id).subscribe({
      next: (equipo) => {
        this.equipo.set(equipo);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  confirmarEliminar(): void {
    const equipo = this.equipo();
    if (!equipo?.id) return;

    this.deleting.set(true);
    this.equipoService.eliminarEquipo(equipo.id).subscribe({
      next: () => {
        const torneoId = equipo.torneoId;
        this.alertService.toast('success', 'Equipo eliminado exitosamente');
        this.router.navigate(['/torneos', torneoId, 'equipos']);
      },
      error: () => {
        this.deleting.set(false);
      }
    });
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

  // Método para toggle de jugadores
  toggleJugadores(): void {
    this.mostrarJugadores.update(valor => !valor);
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
      error: () => {
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

  toggleEstadisticas(): void {
    this.mostrarEstadisticas.update(value => !value);
  }

  async navegarAEnfrentamiento(enfrentamiento: EnfrentamientoResponse): Promise<void> {
    // Abrir modal de edición directamente
    this.editingEnfrentamiento.set(enfrentamiento);
    await this.cargarJugadoresParaEdicion(enfrentamiento);
    this.showEditEnfrentamientoModal.set(true);
  }

  async cargarJugadoresParaEdicion(enfrentamiento: EnfrentamientoResponse): Promise<void> {
    try {
      // Cargar equipos del torneo para obtener IDs
      const equipos = await new Promise<Equipo[]>((resolve, reject) => {
        this.equipoService.buscarEquiposPorTorneo(enfrentamiento.torneoId).subscribe({
          next: resolve,
          error: reject
        });
      });

      const equipoLocal = equipos.find(e => e.nombre === enfrentamiento.equipoLocal);
      const equipoVisitante = equipos.find(e => e.nombre === enfrentamiento.equipoVisitante);

      const promesas: Promise<void>[] = [];

      if (equipoLocal) {
        promesas.push(
          new Promise<void>((resolve, reject) => {
            this.jugadorService.buscarJugadoresPorEquipo(equipoLocal.id!).subscribe({
              next: (jugadores) => {
                this.jugadoresLocal.set(jugadores);
                resolve();
              },
              error: reject
            });
          })
        );
      }

      if (equipoVisitante) {
        promesas.push(
          new Promise<void>((resolve, reject) => {
            this.jugadorService.buscarJugadoresPorEquipo(equipoVisitante.id!).subscribe({
              next: (jugadores) => {
                this.jugadoresVisitante.set(jugadores);
                resolve();
              },
              error: reject
            });
          })
        );
      }

      await Promise.all(promesas);
    } catch (error) {
      console.error('Error cargando jugadores:', error);
    }
  }

  cerrarModalEditarEnfrentamiento(): void {
    this.showEditEnfrentamientoModal.set(false);
    this.editingEnfrentamiento.set(null);
    this.jugadoresLocal.set([]);
    this.jugadoresVisitante.set([]);
  }

  async actualizarEnfrentamiento(request: ActualizarEnfrentamientoRequest): Promise<void> {
    const enfrentamiento = this.editingEnfrentamiento();
    if (!enfrentamiento) return;

    this.updatingEnfrentamiento.set(true);

    this.enfrentamientoService.actualizarEnfrentamiento(enfrentamiento.id, request).subscribe({
      next: (enfrentamientoActualizado) => {
        // Actualizar en la lista de enfrentamientos
        this.enfrentamientos.update(current =>
          current.map(e => e.id === enfrentamiento.id ? enfrentamientoActualizado : e)
        );
        this.alertService.toast('success', 'Enfrentamiento actualizado exitosamente');
        this.updatingEnfrentamiento.set(false);
        this.cerrarModalEditarEnfrentamiento();
      },
      error: () => {
        this.updatingEnfrentamiento.set(false);
      }
    });
  }
}
