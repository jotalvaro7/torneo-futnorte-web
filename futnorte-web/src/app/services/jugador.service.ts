import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Jugador, JugadorRequest, GoleadorResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JugadorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/jugadores`;

  buscarJugadorPorId(id: number): Observable<Jugador> {
    return this.http.get<Jugador>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  buscarJugadoresPorEquipo(equipoId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.baseUrl}/equipo/${equipoId}`)
      .pipe(catchError(this.handleError));
  }

  buscarJugadorPorIdentificacion(identificacion: string): Observable<Jugador> {
    return this.http.get<Jugador>(`${this.baseUrl}/identificacion/${identificacion}`)
      .pipe(catchError(this.handleError));
  }

  obtenerGoleadoresPorTorneo(torneoId: number): Observable<GoleadorResponse[]> {
    return this.http.get<GoleadorResponse[]>(`${this.baseUrl}/goleadores/torneo/${torneoId}`)
      .pipe(catchError(this.handleError));
  }

  crearJugador(jugador: JugadorRequest): Observable<Jugador> {
    return this.http.post<Jugador>(this.baseUrl, jugador)
      .pipe(catchError(this.handleError));
  }

  actualizarJugador(id: number, jugador: JugadorRequest): Observable<Jugador> {
    return this.http.put<Jugador>(`${this.baseUrl}/${id}`, jugador)
      .pipe(catchError(this.handleError));
  }

  eliminarJugador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
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
            errorMessage = 'Jugador no encontrado';
            break;
          case 409:
            errorMessage = 'Conflicto: El jugador ya existe';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = `Error del servidor: ${error.status}`;
        }
      }
    }

    console.error('Error en JugadorService:', error);
    return throwError(() => new Error(errorMessage));
  };
}