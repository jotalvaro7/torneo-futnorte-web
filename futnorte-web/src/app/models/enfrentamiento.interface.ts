export interface Enfrentamiento {
  id?: number;
  torneoId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  fechaHora: string;
  cancha: string;
  estado: EstadoEnfrentamiento;
  golesLocal?: number | null;
  golesVisitante?: number | null;
}

export interface EnfrentamientoResponse {
  id: number;
  torneoId: number;
  equipoLocal: string;
  equipoVisitante: string;
  fechaHora: string;
  cancha: string;
  estado: EstadoEnfrentamiento;
  golesLocal?: number | null;
  golesVisitante?: number | null;
}

export interface CrearEnfrentamientoRequest {
  torneoId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  fechaHora: string;
  cancha: string;
}

export interface ActualizarEnfrentamientoRequest {
  fechaHora?: string;
  cancha?: string;
  estado?: EstadoEnfrentamiento;
  golesLocal?: number;
  golesVisitante?: number;
}

export interface RegistrarResultadoRequest {
  golesLocal: number;
  golesVisitante: number;
}

export interface RegistrarGolesJugadorRequest {
  jugadorId: number;
  cantidadGoles: number;
}

export type EstadoEnfrentamiento = 'PROGRAMADO' | 'FINALIZADO' | 'APLAZADO';