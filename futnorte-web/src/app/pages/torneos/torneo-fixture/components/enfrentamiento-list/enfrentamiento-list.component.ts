import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnfrentamientoResponse } from '../../../../../models';

@Component({
  selector: 'app-enfrentamiento-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './enfrentamiento-list.component.html',
  styleUrl: './enfrentamiento-list.component.css'
})
export class EnfrentamientoListComponent {
  // Inputs
  enfrentamientos = input.required<EnfrentamientoResponse[]>();
  programadosCount = input<number>(0);
  finalizadosCount = input<number>(0);
  aplazadosCount = input<number>(0);
  fechaInicio = input<string>('');
  fechaFin = input<string>('');

  // Outputs
  editar = output<EnfrentamientoResponse>();
  eliminar = output<EnfrentamientoResponse>();

  formatDateTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  onEditar(enfrentamiento: EnfrentamientoResponse): void {
    this.editar.emit(enfrentamiento);
  }

  onEliminar(enfrentamiento: EnfrentamientoResponse): void {
    this.eliminar.emit(enfrentamiento);
  }
}