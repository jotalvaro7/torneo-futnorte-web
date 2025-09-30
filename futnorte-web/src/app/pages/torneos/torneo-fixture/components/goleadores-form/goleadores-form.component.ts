import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Jugador, GolesJugadorResponse } from '../../../../../models';

@Component({
  selector: 'app-goleadores-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './goleadores-form.component.html',
  styleUrl: './goleadores-form.component.css'
})
export class GoleadoresFormComponent {
  private readonly fb = inject(FormBuilder);

  // Inputs
  equipoNombre = input.required<string>();
  jugadores = input.required<Jugador[]>();
  golesExistentes = input<GolesJugadorResponse[]>([]);
  editMode = input<boolean>(false);
  golesFormArray = input.required<FormArray>();
  tipoEquipo = input.required<'local' | 'visitante'>();

  // Outputs
  agregarGol = output<void>();
  eliminarGol = output<number>();

  onAgregarGol(): void {
    this.agregarGol.emit();
  }

  onEliminarGol(index: number): void {
    this.eliminarGol.emit(index);
  }

  calcularSumaGoles(): number {
    return this.golesFormArray().controls.reduce((suma, control) => {
      return suma + (control.get('cantidadGoles')?.value || 0);
    }, 0);
  }
}