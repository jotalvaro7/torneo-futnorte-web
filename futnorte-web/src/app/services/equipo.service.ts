import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Equipo, EquipoRequest } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/equipos`;

  buscarTodosLosEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  buscarEquipoPorId(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  crearEquipo(equipo: EquipoRequest): Observable<Equipo> {
    return this.http.post<Equipo>(this.baseUrl, equipo)
      .pipe(catchError(this.handleError));
  }

  actualizarEquipo(id: number, equipo: EquipoRequest): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.baseUrl}/${id}`, equipo)
      .pipe(catchError(this.handleError));
  }

  eliminarEquipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  buscarEquiposPorTorneo(torneoId: number): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.baseUrl}/torneo/${torneoId}`)
      .pipe(catchError(this.handleError));
  }

  obtenerEquiposOrdenadosPorNombre(torneoId: number): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.baseUrl}/torneo/${torneoId}/ordenados-por-nombre`)
      .pipe(catchError(this.handleError));
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
            errorMessage = 'Equipo no encontrado';
            break;
          case 409:
            errorMessage = 'Conflicto: El equipo ya existe';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error del servidor: ${error.status}`;
        }
      }
    }

    console.error('Error en EquipoService:', error);
    return throwError(() => new Error(errorMessage));
  };
}