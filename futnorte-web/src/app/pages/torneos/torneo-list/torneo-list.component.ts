import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TorneoService } from '../../../services/torneo.service';
import { Torneo, EstadoTorneo } from '../../../models';

@Component({
  selector: 'app-torneo-list',
  standalone: true,
  imports: [DatePipe, NgClass, RouterModule],
  templateUrl: './torneo-list.component.html',
  styleUrl: './torneo-list.component.css'
})
export class TorneoListComponent implements OnInit {
  private readonly torneoService = inject(TorneoService);
  
  torneos = signal<Torneo[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  EstadoTorneo = EstadoTorneo;

  ngOnInit(): void {
    this.cargarTorneos();
  }

  trackByTorneo(index: number, torneo: Torneo): number {
    return torneo.id || index;
  }

  torneosCreados = computed(() => 
    this.torneos().filter(torneo => torneo.estado === EstadoTorneo.CREADO).length
  );
  
  torneosEnCurso = computed(() => 
    this.torneos().filter(torneo => torneo.estado === EstadoTorneo.EN_CURSO).length
  );
  
  torneosFinalizados = computed(() => 
    this.torneos().filter(torneo => torneo.estado === EstadoTorneo.FINALIZADO).length
  );
  
  torneosCancelados = computed(() => 
    this.torneos().filter(torneo => torneo.estado === EstadoTorneo.CANCELADO).length
  );

  cargarTorneos(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.torneoService.obtenerTodosTorneos().subscribe({
      next: (torneos) => {
        this.torneos.set(torneos);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar torneos: ' + error.message);
        this.loading.set(false);
      }
    });
  }

  eliminarTorneo(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este torneo?')) {
      this.torneoService.eliminarTorneo(id).subscribe({
        next: () => {
          this.cargarTorneos();
        },
        error: (error) => {
          this.error.set('Error al eliminar torneo: ' + error.message);
        }
      });
    }
  }

  cambiarEstadoTorneo(torneo: Torneo, accion: 'iniciar' | 'cancelar' | 'finalizar'): void {
    if (!torneo.id) return;

    let observable;
    switch (accion) {
      case 'iniciar':
        observable = this.torneoService.iniciarTorneo(torneo.id);
        break;
      case 'cancelar':
        observable = this.torneoService.cancelarTorneo(torneo.id);
        break;
      case 'finalizar':
        observable = this.torneoService.finalizarTorneo(torneo.id);
        break;
    }

    observable.subscribe({
      next: () => {
        this.cargarTorneos();
      },
      error: (error) => {
        this.error.set(`Error al ${accion} torneo: ` + error.message);
      }
    });
  }
}
