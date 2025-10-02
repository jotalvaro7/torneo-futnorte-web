import { Component, OnInit, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Equipo, CrearEnfrentamientoRequest } from '../../../../../models';

@Component({
  selector: 'app-enfrentamiento-create-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enfrentamiento-create-form.component.html',
  styleUrl: './enfrentamiento-create-form.component.css'
})
export class EnfrentamientoCreateFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  // Inputs
  equipos = input.required<Equipo[]>();
  creating = input<boolean>(false);
  torneoId = input.required<number>();

  // Outputs
  createSubmit = output<CrearEnfrentamientoRequest>();
  cancel = output<void>();

  createForm = this.fb.nonNullable.group({
    equipoLocalId: ['', [Validators.required]],
    equipoVisitanteId: ['', [Validators.required]],
    fechaHora: ['', [Validators.required]],
    cancha: ['', [Validators.required, Validators.maxLength(100)]]
  });

  equiposDisponiblesLocal: Equipo[] = [];
  equiposDisponiblesVisitante: Equipo[] = [];

  ngOnInit(): void {
    this.equiposDisponiblesLocal = this.equipos();
    this.equiposDisponiblesVisitante = this.equipos();

    // Suscribirse a cambios para filtrar equipos
    this.createForm.get('equipoLocalId')?.valueChanges.subscribe(() => {
      this.actualizarEquiposDisponibles();
    });

    this.createForm.get('equipoVisitanteId')?.valueChanges.subscribe(() => {
      this.actualizarEquiposDisponibles();
    });
  }

  actualizarEquiposDisponibles(): void {
    const equipoLocalId = this.createForm.get('equipoLocalId')?.value;
    const equipoVisitanteId = this.createForm.get('equipoVisitanteId')?.value;

    this.equiposDisponiblesVisitante = this.equipos().filter(
      equipo => !equipoLocalId || equipo.id !== +equipoLocalId
    );

    this.equiposDisponiblesLocal = this.equipos().filter(
      equipo => !equipoVisitanteId || equipo.id !== +equipoVisitanteId
    );
  }

  onSubmit(): void {
    if (this.creating()) {
      return; // Prevenir múltiples submits
    }

    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const formValue = this.createForm.value;
    const request: CrearEnfrentamientoRequest = {
      torneoId: this.torneoId(),
      equipoLocalId: +formValue.equipoLocalId!,
      equipoVisitanteId: +formValue.equipoVisitanteId!,
      fechaHora: formValue.fechaHora!,
      cancha: formValue.cancha!
    };

    this.createSubmit.emit(request);
  }

  onCancel(): void {
    this.createForm.reset();
    this.cancel.emit();
  }

  getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength']) return `${fieldName} excede la longitud máxima`;
    }
    return '';
  }
}