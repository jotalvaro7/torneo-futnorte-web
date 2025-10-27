import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

/**
 * Servicio para manejar alertas y notificaciones usando SweetAlert2
 * Proporciona métodos para mostrar diferentes tipos de alertas de forma consistente
 */
@Injectable({
  providedIn: 'root'
})
export class AlertService {

  /**
   * Muestra una alerta de éxito
   * @param title Título de la alerta
   * @param message Mensaje opcional de la alerta
   */
  success(title: string, message?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#10b981'
    });
  }

  /**
   * Muestra una alerta de error
   * @param title Título de la alerta
   * @param message Mensaje opcional de la alerta
   */
  error(title: string, message?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#ef4444'
    });
  }

  /**
   * Muestra una alerta de advertencia
   * @param title Título de la alerta
   * @param message Mensaje opcional de la alerta
   */
  warning(title: string, message?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#f59e0b'
    });
  }

  /**
   * Muestra una alerta informativa
   * @param title Título de la alerta
   * @param message Mensaje opcional de la alerta
   */
  info(title: string, message?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3b82f6'
    });
  }

  /**
   * Muestra un diálogo de confirmación
   * @param title Título del diálogo
   * @param message Mensaje del diálogo
   * @param confirmText Texto del botón de confirmación
   * @param cancelText Texto del botón de cancelación
   * @returns Promise que resuelve true si el usuario confirma, false si cancela
   */
  confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return Swal.fire({
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }).then((result) => result.isConfirmed);
  }

  /**
   * Muestra un diálogo de confirmación para eliminación
   * @param itemName Nombre del elemento a eliminar
   * @returns Promise que resuelve true si el usuario confirma, false si cancela
   */
  confirmDelete(itemName: string = 'este elemento'): Promise<boolean> {
    return Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro?',
      text: `Esta acción eliminará ${itemName}. Esta operación no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }).then((result) => result.isConfirmed);
  }

  /**
   * Muestra una notificación toast (pequeña y temporal)
   * @param icon Tipo de icono
   * @param title Título de la notificación
   * @param position Posición de la notificación
   */
  toast(
    icon: SweetAlertIcon,
    title: string,
    position: 'top' | 'top-end' | 'top-start' | 'center' | 'bottom' | 'bottom-end' | 'bottom-start' = 'top-end'
  ): void {
    Swal.fire({
      toast: true,
      position,
      icon,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  /**
   * Muestra una alerta de carga/procesamiento
   * @param title Título de la alerta
   * @param message Mensaje opcional
   */
  loading(title: string = 'Procesando...', message?: string): void {
    Swal.fire({
      title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Cierra cualquier alerta abierta
   */
  close(): void {
    Swal.close();
  }
}
