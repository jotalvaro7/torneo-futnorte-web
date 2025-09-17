import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  EnfrentamientoResponse, 
  CrearEnfrentamientoRequest, 
  ActualizarEnfrentamientoRequest,
  RegistrarResultadoRequest,
  RegistrarGolesJugadorRequest
} from '../models';
import { environment } from '../../environments/environment';

@Injectable({ 
  providedIn: 'root' 
})
export class EnfrentamientoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/enfrentamientos`;

  crearEnfrentamiento(request: CrearEnfrentamientoRequest): Observable<EnfrentamientoResponse> {
    return this.http.post<EnfrentamientoResponse>(this.baseUrl, request);
  }

  obtenerEnfrentamiento(id: number): Observable<EnfrentamientoResponse> {
    return this.http.get<EnfrentamientoResponse>(`${this.baseUrl}/${id}`);
  }

  actualizarEnfrentamiento(id: number, request: ActualizarEnfrentamientoRequest): Observable<EnfrentamientoResponse> {
    return this.http.put<EnfrentamientoResponse>(`${this.baseUrl}/${id}`, request);
  }

  eliminarEnfrentamiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  obtenerEnfrentamientosPorTorneo(torneoId: number): Observable<EnfrentamientoResponse[]> {
    return this.http.get<EnfrentamientoResponse[]>(`${this.baseUrl}/torneo/${torneoId}`);
  }

  obtenerEnfrentamientosPorEquipo(equipoId: number): Observable<EnfrentamientoResponse[]> {
    return this.http.get<EnfrentamientoResponse[]>(`${this.baseUrl}/equipo/${equipoId}`);
  }

  obtenerEnfrentamientosPorFecha(fechaInicio: string, fechaFin: string): Observable<EnfrentamientoResponse[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    
    return this.http.get<EnfrentamientoResponse[]>(`${this.baseUrl}/fecha`, { params });
  }

  registrarResultado(id: number, request: RegistrarResultadoRequest): Observable<EnfrentamientoResponse> {
    return this.http.post<EnfrentamientoResponse>(`${this.baseUrl}/${id}/resultado`, request);
  }

  registrarGolesJugador(id: number, request: RegistrarGolesJugadorRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/goles-jugador`, request);
  }

  cancelarEnfrentamiento(id: number): Observable<EnfrentamientoResponse> {
    return this.http.post<EnfrentamientoResponse>(`${this.baseUrl}/${id}/cancelar`, {});
  }
}