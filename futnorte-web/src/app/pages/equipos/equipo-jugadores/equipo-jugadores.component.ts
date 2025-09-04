import { Component, Input, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JugadorService } from '../../../services/jugador.service';
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

  private readonly jugadorService = inject(JugadorService);

  jugadores = signal<Jugador[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deleting = signal<number | null>(null);

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

  eliminarJugador(jugador: Jugador) {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${jugador.nombre} ${jugador.apellido}?`)) {
      return;
    }

    this.deleting.set(jugador.id);
    
    this.jugadorService.eliminarJugador(jugador.id)
      .subscribe({
        next: () => {
          this.jugadores.update(jugadores => 
            jugadores.filter(j => j.id !== jugador.id)
          );
          this.deleting.set(null);
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