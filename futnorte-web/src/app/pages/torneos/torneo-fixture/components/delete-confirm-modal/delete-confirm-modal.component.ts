import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnfrentamientoResponse } from '../../../../../models';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirm-modal.component.html',
  styleUrl: './delete-confirm-modal.component.css'
})
export class DeleteConfirmModalComponent {
  // Inputs
  enfrentamiento = input.required<EnfrentamientoResponse>();
  deleting = input<boolean>(false);

  // Outputs
  confirm = output<void>();
  cancel = output<void>();

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('es-CO');
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}