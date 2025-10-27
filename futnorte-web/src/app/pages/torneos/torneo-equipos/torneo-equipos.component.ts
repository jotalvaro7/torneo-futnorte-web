import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EquipoService } from '../../../services/equipo.service';
import { TorneoService } from '../../../services/torneo.service';
import { AlertService } from '../../../services/alert.service';
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
  private readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  torneo = signal<Torneo | null>(null);
  equipos = signal<Equipo[]>([]);
  loading = signal(false);

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
    }
  }

  cargarTorneo(id: number): void {
    this.torneoService.obtenerTorneo(id).subscribe({
      next: (torneo) => {
        this.torneo.set(torneo);
      }
    });
  }

  cargarEquiposPorTorneo(torneoId: number): void {
    this.loading.set(true);

    this.equipoService.obtenerEquiposOrdenadosPorNombre(torneoId).subscribe({
      next: (equipos) => {
        this.equipos.set(equipos);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  trackByEquipo(index: number, equipo: Equipo): number {
    return equipo.id || index;
  }

  async eliminarEquipo(id: number): Promise<void> {
    const confirmado = await this.alertService.confirmDelete('este equipo y todos sus jugadores');

    if (confirmado) {
      this.equipoService.eliminarEquipo(id).subscribe({
        next: () => {
          this.alertService.toast('success', 'Equipo eliminado exitosamente');
          const torneoId = this.torneoId();
          if (torneoId) {
            this.cargarEquiposPorTorneo(torneoId);
          }
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

}