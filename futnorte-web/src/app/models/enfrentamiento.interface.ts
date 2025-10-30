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
  equipoLocalId: number;
  equipoVisitanteId: number;
  equipoLocal?: string;  // Opcional por compatibilidad
  equipoVisitante?: string;  // Opcional por compatibilidad
  fechaHora: string;
  cancha: string;
  estado: EstadoEnfrentamiento;
  golesLocal?: number | null;
  golesVisitante?: number | null;
  golesJugadoresLocal: GolesJugadorResponse[];
  golesJugadoresVisitante: GolesJugadorResponse[];
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
  golesJugadoresLocal?: GolesJugadorDto[];
  golesJugadoresVisitante?: GolesJugadorDto[];
}

export interface GolesJugadorDto {
  jugadorId: number;
  cantidadGoles: number;
}

export interface GolesJugadorResponse {
  jugadorId: number;
  nombreJugador: string;
  apellidoJugador: string;
  cantidadGoles: number;
}

export type EstadoEnfrentamiento = 'PROGRAMADO' | 'FINALIZADO' | 'APLAZADO';