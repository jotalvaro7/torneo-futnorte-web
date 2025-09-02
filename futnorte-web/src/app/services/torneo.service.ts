import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Torneo, TorneoRequest, ErrorResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TorneoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/torneos`;

  obtenerTodosTorneos(): Observable<Torneo[]> {
    return this.http.get<Torneo[]>(this.baseUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  obtenerTorneo(id: number): Observable<Torneo> {
    return this.http.get<Torneo>(`${this.baseUrl}/${id}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  crearTorneo(torneo: TorneoRequest): Observable<Torneo> {
    return this.http.post<Torneo>(this.baseUrl, torneo)
      .pipe(
        catchError(this.handleError)
      );
  }

  actualizarTorneo(id: number, torneo: TorneoRequest): Observable<Torneo> {
    return this.http.put<Torneo>(`${this.baseUrl}/${id}`, torneo)
      .pipe(
        catchError(this.handleError)
      );
  }

  eliminarTorneo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  iniciarTorneo(id: number): Observable<Torneo> {
    return this.http.post<Torneo>(`${this.baseUrl}/${id}/iniciar`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  cancelarTorneo(id: number): Observable<Torneo> {
    return this.http.post<Torneo>(`${this.baseUrl}/${id}/cancelar`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  finalizarTorneo(id: number): Observable<Torneo> {
    return this.http.post<Torneo>(`${this.baseUrl}/${id}/finalizar`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Solicitud inválida';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 409:
            errorMessage = 'Conflicto: El recurso ya existe';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error del servidor: ${error.status}`;
        }
      }
    }

    console.error('Error en TorneoService:', error);
    return throwError(() => new Error(errorMessage));
  };
}