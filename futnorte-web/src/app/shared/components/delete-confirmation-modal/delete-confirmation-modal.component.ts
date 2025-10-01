import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrl: './delete-confirmation-modal.component.css'
})
export class DeleteConfirmationModalComponent {
  @Input({ required: true }) show = false;
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';
  @Input() subtitle = 'Esta acción no se puede deshacer';
  @Input() warningMessage = '';
  @Input() confirmButtonText = 'Eliminar';
  @Input() isDeleting = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
