import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, shareReplay, tap, switchMap } from 'rxjs';
import { retry } from 'rxjs/operators';
import { Torneo, TorneoRequest } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TorneoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/torneos`;
  
  private torneosCache = signal<Torneo[]>([]);
  private readonly refreshTrigger = new BehaviorSubject<void>(undefined);
  
  readonly torneos$ = this.refreshTrigger.pipe(
    switchMap(() => this.http.get<Torneo[]>(this.baseUrl)
      .pipe(
        retry(2),
        tap(torneos => this.torneosCache.set(torneos))
      )
    ),
    shareReplay(1)
  );
  
  readonly torneosSignal = this.torneosCache.asReadonly();

  obtenerTodosTorneos(): Observable<Torneo[]> {
    this.refreshTrigger.next();
    return this.torneos$;
  }

  obtenerTorneo(id: number): Observable<Torneo> {
    return this.http.get<Torneo>(`${this.baseUrl}/${id}`)
      .pipe(retry(2));
  }

  crearTorneo(torneo: TorneoRequest): Observable<Torneo> {
    return this.http.post<Torneo>(this.baseUrl, torneo)
      .pipe(tap(() => this.refreshTrigger.next()));
  }

  actualizarTorneo(id: number, torneo: TorneoRequest): Observable<Torneo> {
    return this.http.put<Torneo>(`${this.baseUrl}/${id}`, torneo)
      .pipe(tap(() => this.refreshTrigger.next()));
  }

  eliminarTorneo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this.refreshTrigger.next()));
  }

  iniciarTorneo(id: number): Observable<Torneo> {
    return this.http.post<Torneo>(`${this.baseUrl}/${id}/iniciar`, {})
      .pipe(tap(() => this.refreshTrigger.next()));
  }

  cancelarTorneo(id: number): Observable<Torneo> {
    return this.http.post<Torneo>(`${this.baseUrl}/${id}/cancelar`, {})
      .pipe(tap(() => this.refreshTrigger.next()));
  }

  finalizarTorneo(id: number): Observable<Torneo> {
    return this.http.post<Torneo>(`${this.baseUrl}/${id}/finalizar`, {})
      .pipe(tap(() => this.refreshTrigger.next()));
  }
}