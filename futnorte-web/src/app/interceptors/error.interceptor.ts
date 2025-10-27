import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';

/**
 * Interceptor HTTP para manejo centralizado de errores
 * Captura todos los errores HTTP y los presenta usando Sweet Alert
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorTitle = 'Error';
      let errorMessage = 'Ha ocurrido un error desconocido';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente o de red
        errorTitle = 'Error de Conexión';
        errorMessage = `No se pudo conectar con el servidor: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        if (error.error && error.error.message) {
          // Si el backend envía un mensaje específico, usarlo
          errorMessage = error.error.message;
        } else {
          // Mensajes por defecto según el código de estado HTTP
          switch (error.status) {
            case 0:
              errorTitle = 'Error de Conexión';
              errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
              break;
            case 400:
              errorTitle = 'Solicitud Inválida';
              errorMessage = 'Los datos enviados no son válidos. Por favor verifica la información.';
              break;
            case 401:
              errorTitle = 'No Autorizado';
              errorMessage = 'No tienes autorización para realizar esta acción.';
              break;
            case 403:
              errorTitle = 'Acceso Prohibido';
              errorMessage = 'No tienes permisos para acceder a este recurso.';
              break;
            case 404:
              errorTitle = 'No Encontrado';
              errorMessage = 'El recurso solicitado no fue encontrado.';
              break;
            case 409:
              errorTitle = 'Conflicto';
              errorMessage = 'Ya existe un registro con la información proporcionada.';
              break;
            case 422:
              errorTitle = 'Error de Validación';
              errorMessage = 'Los datos proporcionados no cumplen con las validaciones requeridas.';
              break;
            case 500:
              errorTitle = 'Error del Servidor';
              errorMessage = 'Ha ocurrido un error interno en el servidor. Por favor intenta más tarde.';
              break;
            case 502:
              errorTitle = 'Servidor No Disponible';
              errorMessage = 'El servidor no está disponible en este momento. Por favor intenta más tarde.';
              break;
            case 503:
              errorTitle = 'Servicio No Disponible';
              errorMessage = 'El servicio está temporalmente no disponible. Por favor intenta más tarde.';
              break;
            default:
              errorTitle = 'Error del Servidor';
              errorMessage = `Error del servidor (${error.status}). Por favor intenta más tarde.`;
          }
        }
      }

      // Mostrar el error usando Sweet Alert
      alertService.error(errorTitle, errorMessage);

      // Log del error en consola para debugging
      console.error('Error HTTP interceptado:', {
        status: error.status,
        message: errorMessage,
        url: error.url,
        error: error.error
      });

      // Re-lanzar el error para que los componentes puedan manejarlo si es necesario
      return throwError(() => new Error(errorMessage));
    })
  );
};