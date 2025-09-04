import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { JugadorService } from '../../../services/jugador.service';
import { EquipoService } from '../../../services/equipo.service';
import { Jugador, JugadorRequest, Equipo } from '../../../models';

@Component({
  selector: 'app-jugador-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './jugador-form.component.html',
  styleUrl: './jugador-form.component.css'
})
export class JugadorFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly jugadorService = inject(JugadorService);
  private readonly equipoService = inject(EquipoService);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    identificacion: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    nacionalidad: ['', [Validators.required, Validators.minLength(2)]],
    equipoId: [null as number | null, Validators.required]
  });

  jugador = signal<Jugador | null>(null);
  equipo = signal<Equipo | null>(null);
  equipos = signal<Equipo[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  equipoId = signal<number | null>(null);
  jugadorId = signal<number | null>(null);

  isEditing = computed(() => this.jugadorId() !== null);
  pageTitle = computed(() => this.isEditing() ? 'Editar Jugador' : 'Nuevo Jugador');
  submitButtonText = computed(() => this.isEditing() ? 'Actualizar Jugador' : 'Crear Jugador');

  ngOnInit() {
    this.route.params.subscribe(params => {
      const equipoId = params['equipoId'] ? +params['equipoId'] : null;
      const jugadorId = params['jugadorId'] ? +params['jugadorId'] : null;

      this.equipoId.set(equipoId);
      this.jugadorId.set(jugadorId);

      if (equipoId) {
        this.form.patchValue({ equipoId });
        this.cargarEquipo(equipoId);
      }

      if (jugadorId) {
        this.cargarJugador(jugadorId);
      }
    });

    this.cargarEquipos();
  }

  cargarEquipo(equipoId: number) {
    this.equipoService.buscarEquipoPorId(equipoId)
      .subscribe({
        next: (equipo) => {
          this.equipo.set(equipo);
        },
        error: (error) => {
          this.error.set(error.message);
        }
      });
  }

  cargarEquipos() {
    this.equipoService.buscarTodosLosEquipos()
      .subscribe({
        next: (equipos) => {
          this.equipos.set(equipos);
        },
        error: (error) => {
          console.error('Error al cargar equipos:', error);
        }
      });
  }

  cargarJugador(jugadorId: number) {
    this.loading.set(true);
    
    this.jugadorService.buscarJugadorPorId(jugadorId)
      .subscribe({
        next: (jugador) => {
          this.jugador.set(jugador);
          this.form.patchValue({
            nombre: jugador.nombre,
            apellido: jugador.apellido,
            identificacion: jugador.identificacion,
            nacionalidad: jugador.nacionalidad,
            equipoId: jugador.equipoId
          });
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error.message);
          this.loading.set(false);
        }
      });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const formValue = this.form.value as JugadorRequest;

    const operation = this.isEditing()
      ? this.jugadorService.actualizarJugador(this.jugadorId()!, formValue)
      : this.jugadorService.crearJugador(formValue);

    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/equipos', this.equipoId()]);
      },
      error: (error) => {
        this.error.set(error.message);
        this.saving.set(false);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/equipos', this.equipoId()]);
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return 'Solo se permiten números';
      }
    }
    return null;
  }
}