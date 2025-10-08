import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-fecha-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-fecha-modal.component.html',
  styleUrl: './pdf-fecha-modal.component.css'
})
export class PdfFechaModalComponent {
  fechaProgramar = signal<string>('');

  confirm = output<string>();
  cancel = output<void>();

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.fechaProgramar.set(target.value);
  }

  onConfirm(): void {
    const fecha = this.fechaProgramar().trim();
    if (fecha) {
      this.confirm.emit(fecha);
      this.fechaProgramar.set('');
    }
  }

  onCancel(): void {
    this.fechaProgramar.set('');
    this.cancel.emit();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onConfirm();
    } else if (event.key === 'Escape') {
      this.onCancel();
    }
  }
}
