import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JugadorService } from '../../../services/jugador.service';
import { EquipoService } from '../../../services/equipo.service';
import { Jugador, JugadorRequest } from '../../../models/jugador.interface';
import { Equipo } from '../../../models/equipo.interface';
import { catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-jugador-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './jugador-search.component.html',
  styleUrl: './jugador-search.component.css'
})
export class JugadorSearchComponent {
  private readonly jugadorService = inject(JugadorService);
  private readonly equipoService = inject(EquipoService);
  private readonly fb = inject(FormBuilder);

  // Signals para el estado del componente
  jugadorEncontrado = signal<Jugador | null>(null);
  equipos = signal<Equipo[]>([]);
  isLoading = signal(false);
  isEditing = signal(false);
  searchError = signal<string | null>(null);
  editError = signal<string | null>(null);
  identificacionValue = signal('');

  // Formularios
  searchForm = this.fb.group({
    identificacion: ['', [Validators.required]]
  });

  editForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    identificacion: ['', [Validators.required]],
    nacionalidad: ['', [Validators.required]],
    equipoId: [0, [Validators.required, Validators.min(1)]]
  });

  // Computed signals
  canSearch = signal(false);
  canEdit = computed(() => this.editForm.valid && !this.isLoading());
  hasJugador = computed(() => this.jugadorEncontrado() !== null);

  constructor() {
    this.loadEquipos();
    
    // Subscribe to form value changes to update canSearch signal
    this.searchForm.get('identificacion')?.valueChanges.subscribe(value => {
      const trimmed = value?.trim() || '';
      this.canSearch.set(trimmed.length > 0 && !this.isLoading());
    });
  }

  buscarJugador(): void {
    if (!this.canSearch()) return;

    const identificacion = this.searchForm.value.identificacion!;
    this.isLoading.set(true);
    this.updateCanSearch();
    this.searchError.set(null);
    this.jugadorEncontrado.set(null);

    this.jugadorService.buscarJugadorPorIdentificacion(identificacion)
      .pipe(
        catchError(error => {
          this.searchError.set(error.message || 'Jugador no encontrado');
          return of(null);
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.updateCanSearch();
        })
      )
      .subscribe(jugador => {
        if (jugador) {
          this.jugadorEncontrado.set(jugador);
          this.populateEditForm(jugador);
        }
      });
  }

  iniciarEdicion(): void {
    this.isEditing.set(true);
  }

  cancelarEdicion(): void {
    this.isEditing.set(false);
    this.editError.set(null);
    const jugador = this.jugadorEncontrado();
    if (jugador) {
      this.populateEditForm(jugador);
    }
  }

  guardarCambios(): void {
    if (!this.canEdit()) return;

    const jugador = this.jugadorEncontrado();
    if (!jugador) return;

    const jugadorRequest: JugadorRequest = {
      nombre: this.editForm.value.nombre!,
      apellido: this.editForm.value.apellido!,
      identificacion: this.editForm.value.identificacion!,
      nacionalidad: this.editForm.value.nacionalidad!,
      equipoId: this.editForm.value.equipoId!
    };

    this.isLoading.set(true);
    this.updateCanSearch();
    this.editError.set(null);

    this.jugadorService.actualizarJugador(jugador.id, jugadorRequest)
      .pipe(
        catchError(error => {
          this.editError.set(error.message || 'Error al actualizar el jugador');
          return of(null);
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.updateCanSearch();
        })
      )
      .subscribe(jugadorActualizado => {
        if (jugadorActualizado) {
          this.jugadorEncontrado.set(jugadorActualizado);
          this.isEditing.set(false);
          this.editError.set(null);
        }
      });
  }

  eliminarJugador(): void {
    const jugador = this.jugadorEncontrado();
    if (!jugador) return;

    if (!confirm(`¿Está seguro de eliminar al jugador ${jugador.nombre} ${jugador.apellido}?`)) {
      return;
    }

    this.isLoading.set(true);
    this.updateCanSearch();

    this.jugadorService.eliminarJugador(jugador.id)
      .pipe(
        catchError(error => {
          this.editError.set(error.message || 'Error al eliminar el jugador');
          return of(null);
        }),
        finalize(() => {
          this.isLoading.set(false);
          this.updateCanSearch();
        })
      )
      .subscribe(() => {
        this.jugadorEncontrado.set(null);
        this.isEditing.set(false);
        this.searchForm.reset();
        this.editForm.reset();
      });
  }

  private loadEquipos(): void {
    this.equipoService.buscarTodosLosEquipos()
      .pipe(
        catchError(error => {
          console.error('Error cargando equipos:', error);
          return of([]);
        })
      )
      .subscribe(equipos => {
        this.equipos.set(equipos);
      });
  }

  private populateEditForm(jugador: Jugador): void {
    this.editForm.patchValue({
      nombre: jugador.nombre,
      apellido: jugador.apellido,
      identificacion: jugador.identificacion,
      nacionalidad: jugador.nacionalidad,
      equipoId: jugador.equipoId
    });
  }

  getEquipoNombre(equipoId: number): string {
    const equipo = this.equipos().find(e => e.id === equipoId);
    return equipo ? equipo.nombre : 'Equipo no encontrado';
  }

  private updateCanSearch(): void {
    const identificacion = this.searchForm.get('identificacion')?.value?.trim() || '';
    this.canSearch.set(identificacion.length > 0 && !this.isLoading());
  }
}
