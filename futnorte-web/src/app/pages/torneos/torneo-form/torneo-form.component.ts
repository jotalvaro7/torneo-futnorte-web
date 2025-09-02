import { Component, OnInit } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TorneoService } from '../../../services/torneo.service';
import { Torneo, EstadoTorneo } from '../../../models';

@Component({
  selector: 'app-torneo-form',
  standalone: true,
  imports: [NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './torneo-form.component.html',
  styleUrl: './torneo-form.component.css'
})
export class TorneoFormComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly torneoService: TorneoService
  ) {}

  torneoForm!: FormGroup;
  isEditMode = false;
  torneoId: number | null = null;
  loading = false;
  error: string | null = null;
  success = false;

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
      this.isEditMode = true;
      this.torneoId = parseInt(id, 10);
      this.cargarTorneo(this.torneoId);
    }
  }

  private cargarTorneo(id: number): void {
    this.loading = true;
    this.torneoService.obtenerTorneo(id).subscribe({
      next: (torneo) => {
        this.torneoForm.patchValue({
          nombre: torneo.nombre,
          descripcion: torneo.descripcion,
          fechaInicio: this.formatDateForInput(torneo.fechaInicio),
          fechaFin: this.formatDateForInput(torneo.fechaFin)
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el torneo: ' + error.message;
        this.loading = false;
      }
    });
  }

  private formatDateForInput(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.torneoForm.valid) {
      this.loading = true;
      this.error = null;
      this.success = false;

      const formData = this.torneoForm.value;
      const torneoData = {
        ...formData,
        estado: EstadoTorneo.CREADO
      };

      const request = this.isEditMode
        ? this.torneoService.actualizarTorneo(this.torneoId!, torneoData)
        : this.torneoService.crearTorneo(torneoData);

      request.subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/torneos']);
          }, 1500);
        },
        error: (error) => {
          this.error = `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el torneo: ` + error.message;
          this.loading = false;
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
