import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EquipoService } from '../../../services/equipo.service';
import { TorneoService } from '../../../services/torneo.service';
import { Equipo, Torneo } from '../../../models';

@Component({
  selector: 'app-torneo-equipos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './torneo-equipos.component.html',
  //styleUrl: './torneo-equipos.component.css'
})
export class TorneoEquiposComponent implements OnInit {
  private readonly equipoService = inject(EquipoService);
  private readonly torneoService = inject(TorneoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  torneo = signal<Torneo | null>(null);
  equipos = signal<Equipo[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  torneoId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? +id : null;
  });

  equiposTotal = computed(() => this.equipos().length);
  equiposConPartidos = computed(() => 
    this.equipos().filter(equipo => (equipo.partidosJugados || 0) > 0).length
  );
  equiposSinPartidos = computed(() => 
    this.equipos().filter(equipo => (equipo.partidosJugados || 0) === 0).length
  );

  ngOnInit(): void {
    const id = this.torneoId();
    if (id) {
      this.cargarTorneo(id);
      this.cargarEquiposPorTorneo(id);
    } else {
      this.error.set('ID de torneo inválido');
    }
  }

  cargarTorneo(id: number): void {
    this.torneoService.obtenerTorneo(id).subscribe({
      next: (torneo) => {
        this.torneo.set(torneo);
      },
      error: (error) => {
        this.error.set('Error al cargar torneo: ' + error.message);
      }
    });
  }

  cargarEquiposPorTorneo(torneoId: number): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.equipoService.buscarEquiposPorTorneo(torneoId).subscribe({
      next: (equipos) => {
        this.equipos.set(equipos);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar equipos: ' + error.message);
        this.loading.set(false);
      }
    });
  }

  trackByEquipo(index: number, equipo: Equipo): number {
    return equipo.id || index;
  }

  eliminarEquipo(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este equipo? También se eliminarán todos sus jugadores.')) {
      this.equipoService.eliminarEquipo(id).subscribe({
        next: () => {
          const torneoId = this.torneoId();
          if (torneoId) {
            this.cargarEquiposPorTorneo(torneoId);
          }
        },
        error: (error) => {
          this.error.set('Error al eliminar equipo: ' + error.message);
        }
      });
    }
  }

  onBack(): void {
    const id = this.torneoId();
    if (id) {
      this.router.navigate(['/torneos', id]);
    } else {
      this.router.navigate(['/torneos']);
    }
  }

  crearNuevoEquipo(): void {
    const id = this.torneoId();
    if (id) {
      this.router.navigate(['/equipos/nuevo'], { 
        queryParams: { torneoId: id } 
      });
    } else {
      this.router.navigate(['/equipos/nuevo']);
    }
  }

  editarEquipo(equipoId: number): void {
    const id = this.torneoId();
    if (id) {
      this.router.navigate(['/equipos', equipoId, 'editar'], {
        queryParams: { torneoId: id }
      });
    } else {
      this.router.navigate(['/equipos', equipoId, 'editar']);
    }
  }
}