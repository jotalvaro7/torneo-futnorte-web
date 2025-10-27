import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipo, EquipoRequest } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/equipos`;

  buscarTodosLosEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.baseUrl);
  }

  buscarEquipoPorId(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.baseUrl}/${id}`);
  }

  crearEquipo(equipo: EquipoRequest): Observable<Equipo> {
    return this.http.post<Equipo>(this.baseUrl, equipo);
  }

  actualizarEquipo(id: number, equipo: EquipoRequest): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.baseUrl}/${id}`, equipo);
  }

  eliminarEquipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  buscarEquiposPorTorneo(torneoId: number): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.baseUrl}/torneo/${torneoId}`);
  }

  obtenerEquiposOrdenadosPorNombre(torneoId: number): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.baseUrl}/torneo/${torneoId}/ordenados-por-nombre`);
  }
}