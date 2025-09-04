import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EquipoService } from '../../../services/equipo.service';
import { Equipo } from '../../../models';
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  equipo = signal<Equipo | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  deleting = signal(false);

  equipoId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? +id : null;
  });

  // Computed statistics
  partidosEmpatados = computed(() => this.equipo()?.partidosEmpatados || 0);
  partidosPerdidos = computed(() => this.equipo()?.partidosPerdidos || 0);
  diferenciadeGoles = computed(() => {
    const equipo = this.equipo();
    if (!equipo) return 0;
    return (equipo.golesAFavor || 0) - (equipo.golesEnContra || 0);
  });

  porcentajeVictorias = computed(() => {
    const equipo = this.equipo();
    if (!equipo || !equipo.partidosJugados) return 0;
    return Math.round(((equipo.partidosGanados || 0) / equipo.partidosJugados) * 100);
  });

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
}
