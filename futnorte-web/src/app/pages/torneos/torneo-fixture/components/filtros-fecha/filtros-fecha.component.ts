import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filtros-fecha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filtros-fecha.component.html',
  styleUrl: './filtros-fecha.component.css'
})
export class FiltrosFechaComponent {
  // Inputs
  fechaInicio = input.required<string>();
  fechaFin = input.required<string>();
  filtrandoPorFecha = input<boolean>(false);

  // Outputs
  fechaInicioChange = output<string>();
  fechaFinChange = output<string>();
  filtrar = output<void>();
  limpiar = output<void>();
  establecerSemana = output<void>();
  establecerMes = output<void>();

  onFechaInicioChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechaInicioChange.emit(value);
  }

  onFechaFinChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.fechaFinChange.emit(value);
  }

  onFiltrar(): void {
    this.filtrar.emit();
  }

  onLimpiar(): void {
    this.limpiar.emit();
  }

  onEstablecerSemana(): void {
    this.establecerSemana.emit();
  }

  onEstablecerMes(): void {
    this.establecerMes.emit();
  }
}