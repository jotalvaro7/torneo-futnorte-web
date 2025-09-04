import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { EquipoService } from '../../../services/equipo.service';
import { TorneoService } from '../../../services/torneo.service';
import { Equipo, EquipoRequest, Torneo } from '../../../models';

@Component({
  selector: 'app-equipo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './equipo-form.component.html',
  styleUrl: './equipo-form.component.css'
})
export class EquipoFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly equipoService = inject(EquipoService);
  private readonly torneoService = inject(TorneoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  equipoId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  torneos = signal<Torneo[]>([]);
  torneoId = signal<string | null>(null);
  
  isEditing = computed(() => this.equipoId() !== null);
  pageTitle = computed(() => this.isEditing() ? 'Editar Equipo' : 'Nuevo Equipo');
  submitButtonText = computed(() => this.isEditing() ? 'Actualizar Equipo' : 'Crear Equipo');

  equipoForm: FormGroup = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    entrenador: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    torneoId: [null, [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarTorneos();
    this.verificarModoEdicion();
    this.inicializarTorneoId();
  }

  private verificarModoEdicion(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.equipoId.set(+id);
      this.cargarEquipo(+id);
    }
  }

  private cargarTorneos(): void {
    this.torneoService.obtenerTodosTorneos().subscribe({
      next: (torneos) => {
        this.torneos.set(torneos.filter(t => t.estado === 'CREADO' || t.estado === 'EN_CURSO'));
      },
      error: (error) => {
        this.error.set('Error al cargar torneos: ' + error.message);
      }
    });
  }

  private cargarEquipo(id: number): void {
    this.loading.set(true);
    this.equipoService.buscarEquipoPorId(id).subscribe({
      next: (equipo) => {
        this.equipoForm.patchValue({
          nombre: equipo.nombre,
          entrenador: equipo.entrenador,
          torneoId: equipo.torneoId
        });
        this.actualizarTorneoId(equipo.torneoId.toString());
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar equipo: ' + error.message);
        this.loading.set(false);
      }
    });
  }

  private inicializarTorneoId(): void {
    const torneoIdParam = this.route.snapshot.queryParamMap.get('torneoId');
    if (torneoIdParam) {
      this.actualizarTorneoId(torneoIdParam);
      this.equipoForm.patchValue({ torneoId: +torneoIdParam });
      
      if (!this.isEditing()) {
        this.equipoForm.get('torneoId')?.disable();
      }
    }

    this.equipoForm.get('torneoId')?.valueChanges.subscribe(value => {
      if (value) {
        this.actualizarTorneoId(value.toString());
      }
    });
  }

  private actualizarTorneoId(torneoId: string): void {
    this.torneoId.set(torneoId);
  }

  onSubmit(): void {
    if (this.equipoForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const torneoControl = this.equipoForm.get('torneoId');
    const equipoData: EquipoRequest = {
      ...this.equipoForm.value,
      torneoId: torneoControl?.disabled 
        ? +this.torneoId()! 
        : torneoControl?.value
    };

    const operation = this.isEditing()
      ? this.equipoService.actualizarEquipo(this.equipoId()!, equipoData)
      : this.equipoService.crearEquipo(equipoData);

    operation.subscribe({
      next: () => {
        this.actualizarTorneoId(this.equipoForm.get('torneoId')?.value);
        this.router.navigate(['/torneos', this.torneoId(), "equipos"]);
      },
      error: (error) => {
        this.error.set('Error al guardar equipo: ' + error.message);
        this.saving.set(false);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.equipoForm.controls).forEach(key => {
      const control = this.equipoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.equipoForm.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return `El campo ${fieldName} es requerido`;
      }
      if (field.errors?.['minlength']) {
        return `El campo ${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors?.['maxlength']) {
        return `El campo ${fieldName} no puede tener más de ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.equipoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onCancel(): void {
    const torneoIdValue = this.equipoForm.get('torneoId')?.value || this.torneoId();
    this.actualizarTorneoId(torneoIdValue);
    this.router.navigate(['/torneos', this.torneoId(), "equipos"]);
  }

  onVolver(): void {
    const torneoIdValue = this.equipoForm.get('torneoId')?.value || this.torneoId();
    
    if (torneoIdValue) {
      this.router.navigate(['/torneos', torneoIdValue, 'equipos']);
    }
  }
}
