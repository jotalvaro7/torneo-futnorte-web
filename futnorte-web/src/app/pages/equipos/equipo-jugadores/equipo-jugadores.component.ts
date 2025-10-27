import { Component, Input, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JugadorService } from '../../../services/jugador.service';
import { AlertService } from '../../../services/alert.service';
import { Jugador } from '../../../models';

@Component({
  selector: 'app-equipo-jugadores',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './equipo-jugadores.component.html',
  styleUrl: './equipo-jugadores.component.css'
})
export class EquipoJugadoresComponent implements OnInit {
  @Input({ required: true }) equipoId!: number;
  @Input() equipoNombre: string = '';
  @Input() showHeader: boolean = true; // Control para mostrar/ocultar header

  private readonly jugadorService = inject(JugadorService);
  private readonly alertService = inject(AlertService);

  jugadores = signal<Jugador[]>([]);
  loading = signal(false);
  deleting = signal<number | null>(null);

  totalJugadores = computed(() => this.jugadores().length);
  totalGoles = computed(() => this.jugadores().reduce((acc, j) => acc + j.numeroGoles, 0));

  ngOnInit() {
    this.cargarJugadores();
  }

  cargarJugadores() {
    this.loading.set(true);

    this.jugadorService.buscarJugadoresPorEquipo(this.equipoId)
      .subscribe({
        next: (jugadores) => {
          this.jugadores.set(jugadores);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  async confirmarEliminar(jugador: Jugador): Promise<void> {
    const confirmed = await this.alertService.confirmDelete(`al jugador "${jugador.nombre} ${jugador.apellido}"`);
    if (!confirmed) return;

    this.deleting.set(jugador.id);

    this.jugadorService.eliminarJugador(jugador.id)
      .subscribe({
        next: () => {
          this.jugadores.update(jugadores =>
            jugadores.filter(j => j.id !== jugador.id)
          );
          this.alertService.toast('success', 'Jugador eliminado exitosamente');
          this.deleting.set(null);
        },
        error: () => {
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