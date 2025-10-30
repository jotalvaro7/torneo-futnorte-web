import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EnfrentamientoService } from '../../../../services/enfrentamiento.service';
import { EquipoService } from '../../../../services/equipo.service';
import { TorneoService } from '../../../../services/torneo.service';
import { JugadorService } from '../../../../services/jugador.service';
import { AlertService } from '../../../../services/alert.service';
import {
  EnfrentamientoResponse,
  CrearEnfrentamientoRequest,
  ActualizarEnfrentamientoRequest,
  Equipo,
  Torneo,
  Jugador
} from '../../../../models';

@Injectable()
export class TorneoFixtureStateService {
  private readonly enfrentamientoService: EnfrentamientoService;
  private readonly equipoService: EquipoService;
  private readonly torneoService: TorneoService;
  private readonly jugadorService: JugadorService;
  private readonly alertService: AlertService;

  // Estado principal
  torneo = signal<Torneo | null>(null);
  equipos = signal<Equipo[]>([]);
  enfrentamientos = signal<EnfrentamientoResponse[]>([]);
  jugadoresLocal = signal<Jugador[]>([]);
  jugadoresVisitante = signal<Jugador[]>([]);
  loading = signal(false);

  // Filtros de fecha
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  filtrandoPorFecha = signal(false);
  cargandoTodos = signal(false);

  // Estado de operaciones
  creating = signal(false);
  updating = signal(false);
  deleting = signal(false);

  // Computed properties para enfrentamientos organizados
  enfrentamientosProgramados = computed(() => {
    const programados = this.enfrentamientos().filter(e => e.estado === 'PROGRAMADO');
    return [...programados].sort((a, b) => {
      // Ordenar primero por cancha
      const canchaComparison = a.cancha.localeCompare(b.cancha);
      if (canchaComparison !== 0) return canchaComparison;
      // Luego por fecha/hora ascendente
      return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime();
    });
  });

  enfrentamientosFinalizados = computed(() => {
    const finalizados = this.enfrentamientos().filter(e => e.estado === 'FINALIZADO');
    return [...finalizados].sort((a, b) => {
      // Ordenar primero por cancha
      const canchaComparison = a.cancha.localeCompare(b.cancha);
      if (canchaComparison !== 0) return canchaComparison;
      // Luego por fecha/hora ascendente
      return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime();
    });
  });

  enfrentamientosAplazados = computed(() => {
    const aplazados = this.enfrentamientos().filter(e => e.estado === 'APLAZADO');
    return [...aplazados].sort((a, b) => {
      // Ordenar primero por cancha
      const canchaComparison = a.cancha.localeCompare(b.cancha);
      if (canchaComparison !== 0) return canchaComparison;
      // Luego por fecha/hora ascendente
      return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime();
    });
  });

  enfrentamientosOrdenados = computed(() => {
    return [...this.enfrentamientos()].sort((a, b) => {
      // Ordenar primero por cancha
      const canchaComparison = a.cancha.localeCompare(b.cancha);
      if (canchaComparison !== 0) return canchaComparison;
      // Luego por fecha/hora ascendente
      return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime();
    });
  });

  constructor(
    enfrentamientoService: EnfrentamientoService,
    equipoService: EquipoService,
    torneoService: TorneoService,
    jugadorService: JugadorService,
    alertService: AlertService
  ) {
    this.enfrentamientoService = enfrentamientoService;
    this.equipoService = equipoService;
    this.torneoService = torneoService;
    this.jugadorService = jugadorService;
    this.alertService = alertService;
  }

  /**
   * Mapea los IDs de equipos a nombres en los enfrentamientos
   * El backend envía equipoLocalId/equipoVisitanteId, necesitamos los nombres
   */
  private mapearNombresEquipos(enfrentamientos: EnfrentamientoResponse[]): EnfrentamientoResponse[] {
    const equipos = this.equipos();
    return enfrentamientos.map(enf => ({
      ...enf,
      equipoLocal: equipos.find(e => e.id === enf.equipoLocalId)?.nombre || 'Equipo Local',
      equipoVisitante: equipos.find(e => e.id === enf.equipoVisitanteId)?.nombre || 'Equipo Visitante'
    }));
  }

  async cargarDatos(torneoId: number): Promise<void> {
    this.loading.set(true);

    try {
      const [torneo, equipos] = await Promise.all([
        firstValueFrom(this.torneoService.obtenerTorneo(torneoId)),
        firstValueFrom(this.equipoService.buscarEquiposPorTorneo(torneoId))
      ]);

      this.torneo.set(torneo);
      this.equipos.set(equipos);

      // Cargar partidos de la semana actual por defecto
      await this.cargarPartidosSemanaActual(torneoId);

      this.loading.set(false);
    } catch (error: any) {
      this.loading.set(false);
    }
  }

  async cargarPartidosSemanaActual(torneoId: number): Promise<void> {
    const hoy = new Date();

    // Encontrar el sábado de esta semana
    const sabado = new Date(hoy);
    const dayOfWeek = hoy.getDay();

    if (dayOfWeek === 0) {
      sabado.setDate(hoy.getDate() - 1);
    } else if (dayOfWeek !== 6) {
      sabado.setDate(hoy.getDate() + (6 - dayOfWeek));
    }
    sabado.setHours(0, 0, 0, 0);

    const lunes = new Date(sabado);
    lunes.setDate(sabado.getDate() + 2);
    lunes.setHours(0, 0, 0, 0);

    this.fechaInicio.set(sabado.toISOString().split('T')[0]);
    this.fechaFin.set(lunes.toISOString().split('T')[0]);

    const lunesCompleto = new Date(lunes);
    lunesCompleto.setDate(lunes.getDate() + 1);

    try {
      const enfrentamientos = await firstValueFrom(
        this.enfrentamientoService.obtenerEnfrentamientosPorFecha(
          sabado.toISOString(),
          lunesCompleto.toISOString()
        )
      );

      const enfrentamientosFiltrados = enfrentamientos.filter(e => e.torneoId === torneoId);
      const enfrentamientosConNombres = this.mapearNombresEquipos(enfrentamientosFiltrados);
      this.enfrentamientos.set(enfrentamientosConNombres);
    } catch (error) {
      await this.cargarTodosLosEnfrentamientos(torneoId);
    }
  }

  async cargarTodosLosEnfrentamientos(torneoId: number): Promise<void> {
    this.cargandoTodos.set(true);
    try {
      const enfrentamientos = await firstValueFrom(
        this.enfrentamientoService.obtenerEnfrentamientosPorTorneo(torneoId)
      );
      const enfrentamientosConNombres = this.mapearNombresEquipos(enfrentamientos);
      this.enfrentamientos.set(enfrentamientosConNombres);
    } catch (error: any) {
      // El interceptor manejará el error
    } finally {
      this.cargandoTodos.set(false);
    }
  }

  async filtrarPorFecha(torneoId: number): Promise<void> {
    if (!this.fechaInicio() || !this.fechaFin()) {
      return;
    }

    if (new Date(this.fechaInicio()) > new Date(this.fechaFin())) {
      return;
    }

    this.filtrandoPorFecha.set(true);

    const fechaInicioCompleta = this.fechaInicio() + 'T00:00:00';
    const fechaFinDate = new Date(this.fechaFin());
    fechaFinDate.setDate(fechaFinDate.getDate() + 1);
    const fechaFinCompleta = fechaFinDate.toISOString().split('T')[0] + 'T00:00:00';

    try {
      const enfrentamientos = await firstValueFrom(
        this.enfrentamientoService.obtenerEnfrentamientosPorFecha(
          fechaInicioCompleta,
          fechaFinCompleta
        )
      );

      const enfrentamientosFiltrados = enfrentamientos.filter(e => e.torneoId === torneoId);
      const enfrentamientosConNombres = this.mapearNombresEquipos(enfrentamientosFiltrados);
      this.enfrentamientos.set(enfrentamientosConNombres);
      this.filtrandoPorFecha.set(false);
    } catch (error: any) {
      this.filtrandoPorFecha.set(false);
    }
  }

  limpiarFiltros(torneoId: number): void {
    this.fechaInicio.set('');
    this.fechaFin.set('');
    this.cargarTodosLosEnfrentamientos(torneoId);
  }

  establecerFiltroSemana(): void {
    const hoy = new Date();
    const sabado = new Date(hoy);
    const dayOfWeek = hoy.getDay();

    if (dayOfWeek === 0) {
      sabado.setDate(hoy.getDate() - 1);
    } else if (dayOfWeek !== 6) {
      sabado.setDate(hoy.getDate() + (6 - dayOfWeek));
    }

    const lunes = new Date(sabado);
    lunes.setDate(sabado.getDate() + 2);
    lunes.setHours(0, 0, 0, 0);

    this.fechaInicio.set(sabado.toISOString().split('T')[0]);
    this.fechaFin.set(lunes.toISOString().split('T')[0]);
  }

  establecerFiltroMes(): void {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);

    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    finMes.setHours(0, 0, 0, 0);

    this.fechaInicio.set(inicioMes.toISOString().split('T')[0]);
    this.fechaFin.set(finMes.toISOString().split('T')[0]);
  }

  async crearEnfrentamiento(request: CrearEnfrentamientoRequest): Promise<void> {
    this.creating.set(true);

    try {
      const enfrentamiento = await firstValueFrom(
        this.enfrentamientoService.crearEnfrentamiento(request)
      );
      const enfrentamientoConNombres = this.mapearNombresEquipos([enfrentamiento])[0];
      this.enfrentamientos.update(current => [...current, enfrentamientoConNombres]);
      this.alertService.toast('success', 'Enfrentamiento creado exitosamente');
      this.creating.set(false);
    } catch (error: any) {
      this.creating.set(false);
      throw error;
    }
  }

  async actualizarEnfrentamiento(
    enfrentamientoId: number,
    request: ActualizarEnfrentamientoRequest
  ): Promise<void> {
    this.updating.set(true);

    try {
      const enfrentamientoActualizado = await firstValueFrom(
        this.enfrentamientoService.actualizarEnfrentamiento(enfrentamientoId, request)
      );
      const enfrentamientoConNombres = this.mapearNombresEquipos([enfrentamientoActualizado])[0];
      this.enfrentamientos.update(current =>
        current.map(e => e.id === enfrentamientoId ? enfrentamientoConNombres : e)
      );
      this.alertService.toast('success', 'Enfrentamiento actualizado exitosamente');
      this.updating.set(false);
    } catch (error: any) {
      this.updating.set(false);
      throw error;
    }
  }

  async eliminarEnfrentamiento(enfrentamientoId: number): Promise<void> {
    this.deleting.set(true);

    try {
      await firstValueFrom(
        this.enfrentamientoService.eliminarEnfrentamiento(enfrentamientoId)
      );
      this.enfrentamientos.update(current =>
        current.filter(e => e.id !== enfrentamientoId)
      );
      this.alertService.toast('success', 'Enfrentamiento eliminado exitosamente');
      this.deleting.set(false);
    } catch (error: any) {
      this.deleting.set(false);
      throw error;
    }
  }

  async cargarJugadoresDeEquipos(enfrentamiento: EnfrentamientoResponse): Promise<void> {
    const equipoLocal = this.equipos().find(e => e.nombre === enfrentamiento.equipoLocal);
    const equipoVisitante = this.equipos().find(e => e.nombre === enfrentamiento.equipoVisitante);

    const promesas: Promise<void>[] = [];

    if (equipoLocal) {
      promesas.push(
        firstValueFrom(this.jugadorService.buscarJugadoresPorEquipo(equipoLocal.id!))
          .then(jugadores => this.jugadoresLocal.set(jugadores))
          .catch(error => console.error('Error cargando jugadores locales:', error))
      );
    }

    if (equipoVisitante) {
      promesas.push(
        firstValueFrom(this.jugadorService.buscarJugadoresPorEquipo(equipoVisitante.id!))
          .then(jugadores => this.jugadoresVisitante.set(jugadores))
          .catch(error => console.error('Error cargando jugadores visitantes:', error))
      );
    }

    await Promise.all(promesas);
  }
}