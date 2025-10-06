import { Component, Input, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JugadorService } from '../../../services/jugador.service';
import { Jugador } from '../../../models';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-equipo-jugadores',
  standalone: true,
  imports: [CommonModule, RouterModule, DeleteConfirmationModalComponent],
  templateUrl: './equipo-jugadores.component.html',
  styleUrl: './equipo-jugadores.component.css'
})
export class EquipoJugadoresComponent implements OnInit {
  @Input({ required: true }) equipoId!: number;
  @Input() equipoNombre: string = '';
  @Input() showHeader: boolean = true; // Control para mostrar/ocultar header

  private readonly jugadorService = inject(JugadorService);

  jugadores = signal<Jugador[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deleting = signal<number | null>(null);

  // Modal de confirmación
  showDeleteModal = signal(false);
  jugadorToDelete = signal<Jugador | null>(null);
  deleteModalMessage = computed(() => {
    const jugador = this.jugadorToDelete();
    if (!jugador) return '';
    return `¿Estás seguro de que deseas eliminar al jugador <span class="font-bold text-slate-900">${jugador.nombre} ${jugador.apellido}</span>?`;
  });

  totalJugadores = computed(() => this.jugadores().length);
  totalGoles = computed(() => this.jugadores().reduce((acc, j) => acc + j.numeroGoles, 0));

  ngOnInit() {
    this.cargarJugadores();
  }

  cargarJugadores() {
    this.loading.set(true);
    this.error.set(null);
    
    this.jugadorService.buscarJugadoresPorEquipo(this.equipoId)
      .subscribe({
        next: (jugadores) => {
          this.jugadores.set(jugadores);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error.message);
          this.loading.set(false);
        }
      });
  }

  openDeleteModal(jugador: Jugador) {
    this.jugadorToDelete.set(jugador);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.jugadorToDelete.set(null);
  }

  confirmarEliminar() {
    const jugador = this.jugadorToDelete();
    if (!jugador) return;

    this.deleting.set(jugador.id);

    this.jugadorService.eliminarJugador(jugador.id)
      .subscribe({
        next: () => {
          this.jugadores.update(jugadores =>
            jugadores.filter(j => j.id !== jugador.id)
          );
          this.deleting.set(null);
          this.closeDeleteModal();
        },
        error: (error) => {
          this.error.set(error.message);
          this.deleting.set(null);
        }
      });
  }

  onJugadorCreated() {
    this.cargarJugadores();
  }

  onJugadorUpdated() {
    this.cargarJugadores();
  }
}