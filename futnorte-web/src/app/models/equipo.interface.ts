export interface Equipo {
  id?: number;
  nombre: string;
  entrenador: string;
  torneoId: number;
  puntos?: number;
  partidosJugados?: number;
  partidosGanados?: number;
  partidosEmpatados?: number;
  partidosPerdidos?: number;
  golesAFavor?: number;
  golesEnContra?: number;
}

export interface EquipoRequest {
  nombre: string;
  entrenador: string;
  torneoId: number;
}

export interface EquipoResponse {
  id: number;
  nombre: string;
  entrenador: string;
  torneoId: number;
  puntos: number;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesAFavor: number;
  golesEnContra: number;
}