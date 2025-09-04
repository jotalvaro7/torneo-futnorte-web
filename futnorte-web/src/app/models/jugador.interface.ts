export interface Jugador {
  id: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  nacionalidad: string;
  equipoId: number;
  numeroGoles: number;
}

export interface JugadorRequest {
  nombre: string;
  apellido: string;
  identificacion: string;
  nacionalidad: string;
  equipoId: number;
}

export interface GoleadorResponse {
  id: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  nacionalidad: string;
  numeroGoles: number;
  nombreEquipo: string;
}