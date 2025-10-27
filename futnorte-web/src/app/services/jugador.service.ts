import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Jugador, JugadorRequest, GoleadorResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JugadorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/jugadores`;

  buscarJugadorPorId(id: number): Observable<Jugador> {
    return this.http.get<Jugador>(`${this.baseUrl}/${id}`);
  }

  buscarJugadoresPorEquipo(equipoId: number): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.baseUrl}/equipo/${equipoId}`);
  }

  buscarJugadorPorIdentificacion(identificacion: string): Observable<Jugador> {
    return this.http.get<Jugador>(`${this.baseUrl}/identificacion/${identificacion}`);
  }

  obtenerGoleadoresPorTorneo(torneoId: number): Observable<GoleadorResponse[]> {
    return this.http.get<GoleadorResponse[]>(`${this.baseUrl}/goleadores/torneo/${torneoId}`);
  }

  crearJugador(jugador: JugadorRequest): Observable<Jugador> {
    return this.http.post<Jugador>(this.baseUrl, jugador);
  }

  actualizarJugador(id: number, jugador: JugadorRequest): Observable<Jugador> {
    return this.http.put<Jugador>(`${this.baseUrl}/${id}`, jugador);
  }

  eliminarJugador(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}