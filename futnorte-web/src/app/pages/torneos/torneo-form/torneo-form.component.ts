import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TorneoService } from '../../../services/torneo.service';
import { EstadoTorneo } from '../../../models';

@Component({
  selector: 'app-torneo-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './torneo-form.component.html',
  styleUrl: './torneo-form.component.css'
})
export class TorneoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly torneoService = inject(TorneoService);

  torneoForm!: FormGroup;
  isEditMode = signal(false);
  torneoId = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  
  pageTitle = computed(() => 
    this.isEditMode() ? 'Editar Torneo' : 'Crear Nuevo Torneo'
  );
  
  submitButtonText = computed(() => 
    this.loading() 
      ? (this.isEditMode() ? 'Actualizando...' : 'Creando...') 
      : (this.isEditMode() ? 'Actualizar' : 'Crear')
  );

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    this.torneoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['']
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.torneoId.set(parseInt(id, 10));
      this.cargarTorneo(this.torneoId());
    }
  }

  private cargarTorneo(id: number | null): void {
    if (!id) return;
    
    this.loading.set(true);
    this.torneoService.obtenerTorneo(id).subscribe({
      next: (torneo) => {
        this.torneoForm.patchValue({
          nombre: torneo.nombre,
          descripcion: torneo.descripcion,
          fechaInicio: this.formatDateForInput(torneo.fechaInicio),
          fechaFin: this.formatDateForInput(torneo.fechaFin)
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar el torneo: ' + error.message);
        this.loading.set(false);
      }
    });
  }

  private formatDateForInput(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';
    // Convertir fecha YYYY-MM-DD a LocalDateTime formato: YYYY-MM-DDTHH:MM:SS
    const date = new Date(dateString + 'T00:00:00');
    return date.toISOString().slice(0, 19); // Remover la Z y milisegundos
  }

  onSubmit(): void {
    if (this.torneoForm.valid) {
      this.loading.set(true);
      this.error.set(null);
      this.success.set(false);

      const formData = this.torneoForm.value;
      const torneoData = {
        ...formData,
        fechaInicio: formData.fechaInicio ? this.formatDateForBackend(formData.fechaInicio) : null,
        fechaFin: formData.fechaFin ? this.formatDateForBackend(formData.fechaFin) : null,
      };

      const request = this.isEditMode()
        ? this.torneoService.actualizarTorneo(this.torneoId()!, torneoData)
        : this.torneoService.crearTorneo(torneoData);

      request.subscribe({
        next: () => {
          this.success.set(true);
          this.loading.set(false);
          setTimeout(() => {
            this.router.navigate(['/torneos']);
          }, 1500);
        },
        error: (error) => {
          this.error.set(`Error al ${this.isEditMode() ? 'actualizar' : 'crear'} el torneo: ` + error.message);
          this.loading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.torneoForm.controls).forEach(key => {
      const control = this.torneoForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.torneoForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.torneoForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      descripcion: 'Descripción',
      fechaInicio: 'Fecha de inicio',
      fechaFin: 'Fecha de fin'
    };
    return labels[fieldName] || fieldName;
  }

  onCancel(): void {
    this.router.navigate(['/torneos']);
  }
}
