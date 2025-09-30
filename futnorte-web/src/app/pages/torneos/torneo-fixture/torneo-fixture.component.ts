import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EnfrentamientoService } from '../../../services/enfrentamiento.service';
import { EquipoService } from '../../../services/equipo.service';
import { TorneoService } from '../../../services/torneo.service';
import { JugadorService } from '../../../services/jugador.service';
import { EnfrentamientoResponse, CrearEnfrentamientoRequest, ActualizarEnfrentamientoRequest, GolesJugadorDto, Equipo, Torneo, Jugador } from '../../../models';

@Component({
  selector: 'app-torneo-fixture',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './torneo-fixture.component.html',
  styleUrl: './torneo-fixture.component.css'
})
export class TorneoFixtureComponent implements OnInit {
  private readonly enfrentamientoService = inject(EnfrentamientoService);
  private readonly equipoService = inject(EquipoService);
  private readonly torneoService = inject(TorneoService);
  private readonly jugadorService = inject(JugadorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  torneo = signal<Torneo | null>(null);
  equipos = signal<Equipo[]>([]);
  enfrentamientos = signal<EnfrentamientoResponse[]>([]);
  jugadoresLocal = signal<Jugador[]>([]);
  jugadoresVisitante = signal<Jugador[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showCreateForm = signal(false);
  creating = signal(false);

  // Edición de enfrentamiento
  showEditForm = signal(false);
  editingEnfrentamiento = signal<EnfrentamientoResponse | null>(null);
  updating = signal(false);
  editMode = signal(false);
  originalFormValues: any = null;

  // Eliminación de enfrentamiento
  deleting = signal(false);
  showDeleteConfirm = signal(false);
  enfrentamientoToDelete = signal<EnfrentamientoResponse | null>(null);

  // Filtros de fecha
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  filtrandoPorFecha = signal(false);
  mostrarFiltros = signal(false);
  
  // Control de acordeón
  seccionProgramadosAbierta = signal(true);
  seccionFinalizadosAbierta = signal(true);
  seccionAplazadosAbierta = signal(false);

  torneoId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? +id : null;
  });

  createForm = this.fb.nonNullable.group({
    equipoLocalId: ['', [Validators.required]],
    equipoVisitanteId: ['', [Validators.required]],
    fechaHora: ['', [Validators.required]],
    cancha: ['', [Validators.required, Validators.maxLength(100)]]
  });

  editForm = this.fb.nonNullable.group({
    fechaHora: ['', [Validators.required]],
    cancha: ['', [Validators.required, Validators.maxLength(100)]],
    estado: ['', [Validators.required]],
    golesLocal: [null as number | null],
    golesVisitante: [null as number | null],
    golesJugadoresLocal: this.fb.array([]),
    golesJugadoresVisitante: this.fb.array([])
  });

  equiposDisponiblesLocal = computed(() => {
    const equipoVisitanteId = this.createForm.get('equipoVisitanteId')?.value;
    return this.equipos().filter(equipo => 
      !equipoVisitanteId || equipo.id !== +equipoVisitanteId
    );
  });

  equiposDisponiblesVisitante = computed(() => {
    const equipoLocalId = this.createForm.get('equipoLocalId')?.value;
    return this.equipos().filter(equipo => 
      !equipoLocalId || equipo.id !== +equipoLocalId
    );
  });

  ngOnInit(): void {
    const id = this.torneoId();
    if (id) {
      this.cargarDatos(id);
    } else {
      this.error.set('ID de torneo inválido');
    }
  }

  async cargarDatos(torneoId: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [torneo, equipos] = await Promise.all([
        firstValueFrom(this.torneoService.obtenerTorneo(torneoId)),
        firstValueFrom(this.equipoService.buscarEquiposPorTorneo(torneoId))
      ]);

      this.torneo.set(torneo);
      this.equipos.set(equipos);
      
      // Cargar partidos de la semana actual por defecto
      this.cargarPartidosSemanaActual();
      
      this.loading.set(false);
    } catch (error: any) {
      this.error.set('Error al cargar datos: ' + error.message);
      this.loading.set(false);
    }
  }

  cargarPartidosSemanaActual(): void {
    const hoy = new Date();
    
    // Encontrar el sábado de esta semana
    const sabado = new Date(hoy);
    const dayOfWeek = hoy.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    
    if (dayOfWeek === 0) { // Si es domingo, tomar el sábado anterior (ayer)
      sabado.setDate(hoy.getDate() - 1);
    } else if (dayOfWeek === 6) { // Si es sábado, usar hoy
      // No cambiar fecha
    } else { // Cualquier otro día (lunes a viernes), ir al próximo sábado
      sabado.setDate(hoy.getDate() + (6 - dayOfWeek));
    }
    sabado.setHours(0, 0, 0, 0);
    
    // El lunes es 2 días después del sábado
    const lunes = new Date(sabado);
    lunes.setDate(sabado.getDate() + 2);
    lunes.setHours(0, 0, 0, 0);
    
    // Establecer las fechas en los signals
    this.fechaInicio.set(sabado.toISOString().split('T')[0]);
    this.fechaFin.set(lunes.toISOString().split('T')[0]);
    
    // Cargar enfrentamientos del fin de semana
    // Para incluir todo el lunes, agregar un día más al rango
    const lunesCompleto = new Date(lunes);
    lunesCompleto.setDate(lunes.getDate() + 1);

    this.enfrentamientoService.obtenerEnfrentamientosPorFecha(
      sabado.toISOString(),
      lunesCompleto.toISOString()
    ).subscribe({
      next: (enfrentamientos) => {
        // Filtrar solo los del torneo actual
        const enfrentamientosFiltrados = enfrentamientos.filter(
          e => e.torneoId === this.torneoId()
        );
        this.enfrentamientos.set(enfrentamientosFiltrados);
      },
      error: (error) => {
        // Si falla el filtro, cargar todos los enfrentamientos
        this.cargarTodosLosEnfrentamientos();
      }
    });
  }

  cargarTodosLosEnfrentamientos(): void {
    const torneoId = this.torneoId();
    if (!torneoId) return;
    
    this.enfrentamientoService.obtenerEnfrentamientosPorTorneo(torneoId).subscribe({
      next: (enfrentamientos) => {
        this.enfrentamientos.set(enfrentamientos);
      },
      error: (error) => {
        this.error.set('Error al cargar enfrentamientos: ' + error.message);
      }
    });
  }

  mostrarFormularioCreacion(): void {
    this.showCreateForm.set(true);
    this.createForm.reset();
  }

  ocultarFormularioCreacion(): void {
    this.showCreateForm.set(false);
    this.createForm.reset();
  }

  crearEnfrentamiento(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const torneoId = this.torneoId();
    if (!torneoId) return;

    this.creating.set(true);

    const formValue = this.createForm.value;
    const request: CrearEnfrentamientoRequest = {
      torneoId,
      equipoLocalId: +formValue.equipoLocalId!,
      equipoVisitanteId: +formValue.equipoVisitanteId!,
      fechaHora: formValue.fechaHora!,
      cancha: formValue.cancha!
    };

    this.enfrentamientoService.crearEnfrentamiento(request).subscribe({
      next: (enfrentamiento) => {
        this.enfrentamientos.update(current => [...current, enfrentamiento]);
        this.ocultarFormularioCreacion();
        this.creating.set(false);
      },
      error: (error) => {
        this.error.set('Error al crear enfrentamiento: ' + error.message);
        this.creating.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/torneos']);
  }

  getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength']) return `${fieldName} excede la longitud máxima`;
    }
    return '';
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('es-CO');
  }

  formatDate(date: string): string {
    // Crear fecha local para evitar problemas de zona horaria
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  // Signal para controlar visibilidad de campos de goles
  mostrarCamposGoles = signal(false);

  // Computed properties para organizar enfrentamientos por estado
  enfrentamientosProgramados = computed(() => {
    const programados = this.enfrentamientos().filter(e => e.estado === 'PROGRAMADO');
    return [...programados].sort((a, b) => {
      const dateA = new Date(a.fechaHora);
      const dateB = new Date(b.fechaHora);
      return dateA.getTime() - dateB.getTime();
    });
  });

  enfrentamientosFinalizados = computed(() => {
    const finalizados = this.enfrentamientos().filter(e => e.estado === 'FINALIZADO');
    return [...finalizados].sort((a, b) => {
      const dateA = new Date(a.fechaHora);
      const dateB = new Date(b.fechaHora);
      return dateA.getTime() - dateB.getTime();
    });
  });

  enfrentamientosAplazados = computed(() => {
    const aplazados = this.enfrentamientos().filter(e => e.estado === 'APLAZADO');
    return [...aplazados].sort((a, b) => {
      const dateA = new Date(a.fechaHora);
      const dateB = new Date(b.fechaHora);
      return dateA.getTime() - dateB.getTime();
    });
  });

  // Todos los enfrentamientos ordenados por fecha
  enfrentamientosOrdenados = computed(() => {
    return [...this.enfrentamientos()].sort((a, b) => {
      const dateA = new Date(a.fechaHora);
      const dateB = new Date(b.fechaHora);
      return dateA.getTime() - dateB.getTime();
    });
  });

  // Métodos para filtros de fecha
  filtrarPorFecha(): void {
    if (!this.fechaInicio() || !this.fechaFin()) {
      this.error.set('Por favor selecciona ambas fechas');
      return;
    }

    if (new Date(this.fechaInicio()) > new Date(this.fechaFin())) {
      this.error.set('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    this.filtrandoPorFecha.set(true);
    this.error.set(null);

    // Convertir fechas al formato requerido por la API
    const fechaInicioCompleta = this.fechaInicio() + 'T00:00:00';
    // Para la fecha fin, agregar un día y usar 00:00:00 para incluir todo el día anterior
    const fechaFinDate = new Date(this.fechaFin());
    fechaFinDate.setDate(fechaFinDate.getDate() + 1);
    const fechaFinCompleta = fechaFinDate.toISOString().split('T')[0] + 'T00:00:00';

    this.enfrentamientoService.obtenerEnfrentamientosPorFecha(
      fechaInicioCompleta,
      fechaFinCompleta
    ).subscribe({
      next: (enfrentamientos) => {
        // Filtrar solo los del torneo actual
        const enfrentamientosFiltrados = enfrentamientos.filter(
          e => e.torneoId === this.torneoId()
        );
        this.enfrentamientos.set(enfrentamientosFiltrados);
        this.filtrandoPorFecha.set(false);
      },
      error: (error) => {
        this.error.set('Error al filtrar enfrentamientos: ' + error.message);
        this.filtrandoPorFecha.set(false);
      }
    });
  }

  limpiarFiltros(): void {
    this.fechaInicio.set('');
    this.fechaFin.set('');
    this.cargarTodosLosEnfrentamientos();
  }

  // Método mejorado para configurar filtros rápidos
  establecerFiltroSemana(): void {
    const hoy = new Date();
    
    // Encontrar el sábado de esta semana
    const sabado = new Date(hoy);
    const dayOfWeek = hoy.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    
    if (dayOfWeek === 0) { // Si es domingo, tomar el sábado anterior (ayer)
      sabado.setDate(hoy.getDate() - 1);
    } else if (dayOfWeek === 6) { // Si es sábado, usar hoy
      // No cambiar fecha
    } else { // Cualquier otro día (lunes a viernes), ir al próximo sábado
      sabado.setDate(hoy.getDate() + (6 - dayOfWeek));
    }

    // El lunes es 2 días después del sábado
    const lunes = new Date(sabado);
    lunes.setDate(sabado.getDate() + 2);
    lunes.setHours(0, 0, 0, 0);
    
    this.fechaInicio.set(sabado.toISOString().split('T')[0]);
    this.fechaFin.set(lunes.toISOString().split('T')[0]);
    this.filtrarPorFecha();
  }

  establecerFiltroMes(): void {
    const hoy = new Date();
    // Primer día del mes actual
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);
    
    // Último día del mes actual (mes siguiente día 0)
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    finMes.setHours(0, 0, 0, 0);
    
    this.fechaInicio.set(inicioMes.toISOString().split('T')[0]);
    this.fechaFin.set(finMes.toISOString().split('T')[0]);
    this.filtrarPorFecha();
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PROGRAMADO': return 'bg-blue-100 text-blue-800';
      case 'FINALIZADO': return 'bg-green-100 text-green-800';
      case 'APLAZADO': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Métodos para controlar el acordeón
  toggleSeccionProgramados(): void {
    this.seccionProgramadosAbierta.set(!this.seccionProgramadosAbierta());
  }

  toggleSeccionFinalizados(): void {
    this.seccionFinalizadosAbierta.set(!this.seccionFinalizadosAbierta());
  }

  toggleSeccionAplazados(): void {
    this.seccionAplazadosAbierta.set(!this.seccionAplazadosAbierta());
  }

  // Métodos para edición de enfrentamiento
  mostrarFormularioEdicion(enfrentamiento: EnfrentamientoResponse): void {
    this.editingEnfrentamiento.set(enfrentamiento);
    this.editMode.set(false); // Iniciar en modo vista

    // Convertir la fecha al formato datetime-local
    const fecha = new Date(enfrentamiento.fechaHora);
    const fechaLocal = new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000));
    const fechaFormateada = fechaLocal.toISOString().slice(0, 16);

    const formValues = {
      fechaHora: fechaFormateada,
      cancha: enfrentamiento.cancha,
      estado: enfrentamiento.estado,
      golesLocal: enfrentamiento.golesLocal,
      golesVisitante: enfrentamiento.golesVisitante
    };

    this.editForm.patchValue(formValues);
    this.originalFormValues = { ...formValues };

    // Inicializar en modo vista (deshabilitado)
    this.editForm.disable();

    // Limpiar arrays de goles de jugadores
    this.limpiarGolesJugadores();

    // Configurar visibilidad inicial de campos de goles
    this.mostrarCamposGoles.set(enfrentamiento.estado === 'FINALIZADO');

    // Cargar jugadores de ambos equipos primero
    this.cargarJugadoresDeEquipos(enfrentamiento);

    // Prellenar formulario con goles existentes si los hay y el estado es FINALIZADO
    if (enfrentamiento.estado === 'FINALIZADO' && (enfrentamiento.golesJugadoresLocal?.length || enfrentamiento.golesJugadoresVisitante?.length)) {
      this.prellenarGolesJugadores(enfrentamiento);
    }

    // Suscribirse a cambios de estado
    this.editForm.get('estado')?.valueChanges.subscribe(estado => {
      const wasFinalized = this.mostrarCamposGoles();
      this.mostrarCamposGoles.set(estado === 'FINALIZADO');

      if (estado !== 'FINALIZADO') {
        this.limpiarGolesJugadores();
      } else if (!wasFinalized) {
        // Solo prellenar si estamos cambiando a FINALIZADO y no tenemos goles ya cargados
        this.prellenarGolesJugadores(this.editingEnfrentamiento()!);
      }
    });

    this.showEditForm.set(true);
  }

  ocultarFormularioEdicion(): void {
    this.showEditForm.set(false);
    this.editingEnfrentamiento.set(null);
    this.editMode.set(false);
    this.originalFormValues = null;
    this.editForm.reset();
    // Asegurar que el formulario esté habilitado para el próximo uso
    this.editForm.enable();
  }

  activarModoEdicion(): void {
    this.editMode.set(true);
    // Habilitar todos los controles del formulario
    this.editForm.enable();
  }

  cancelarEdicion(): void {
    // Restaurar valores originales
    if (this.originalFormValues) {
      this.editForm.patchValue(this.originalFormValues);
    }
    this.editMode.set(false);
    // Deshabilitar todos los controles del formulario
    this.editForm.disable();
  }

  actualizarEnfrentamiento(): void {
    // Validaciones dinámicas para goles si el estado es FINALIZADO
    const estadoSeleccionado = this.editForm.get('estado')?.value;
    if (estadoSeleccionado === 'FINALIZADO') {
      const golesLocal = this.editForm.get('golesLocal')?.value;
      const golesVisitante = this.editForm.get('golesVisitante')?.value;

      if (golesLocal === null || golesLocal === undefined || golesLocal < 0) {
        this.editForm.get('golesLocal')?.setErrors({ required: true });
      }
      if (golesVisitante === null || golesVisitante === undefined || golesVisitante < 0) {
        this.editForm.get('golesVisitante')?.setErrors({ required: true });
      }

      // Validar que los goles individuales coincidan con el total
      if (!this.validarGolesCoinciden()) {
        this.editForm.get('golesLocal')?.setErrors({ golesNoCoinciden: true });
        this.editForm.get('golesVisitante')?.setErrors({ golesNoCoinciden: true });
      }
    } else {
      // Limpiar errores de goles si no es FINALIZADO
      this.editForm.get('golesLocal')?.setErrors(null);
      this.editForm.get('golesVisitante')?.setErrors(null);
    }

    if (this.editForm.invalid || !this.editingEnfrentamiento()) {
      this.editForm.markAllAsTouched();
      return;
    }

    const enfrentamiento = this.editingEnfrentamiento()!;
    this.updating.set(true);

    const formValue = this.editForm.value;
    const request: ActualizarEnfrentamientoRequest = {};

    if (formValue.fechaHora) {
      request.fechaHora = formValue.fechaHora;
    }
    if (formValue.cancha) {
      request.cancha = formValue.cancha;
    }
    if (formValue.estado) {
      request.estado = formValue.estado as any;
    }
    if (formValue.golesLocal !== null && formValue.golesLocal !== undefined) {
      request.golesLocal = formValue.golesLocal;
    }
    if (formValue.golesVisitante !== null && formValue.golesVisitante !== undefined) {
      request.golesVisitante = formValue.golesVisitante;
    }

    // Agregar goles por jugador si existen
    if (this.golesJugadoresLocalArray.length > 0) {
      request.golesJugadoresLocal = this.golesJugadoresLocalArray.value as GolesJugadorDto[];
    }
    if (this.golesJugadoresVisitanteArray.length > 0) {
      request.golesJugadoresVisitante = this.golesJugadoresVisitanteArray.value as GolesJugadorDto[];
    }

    this.enfrentamientoService.actualizarEnfrentamiento(enfrentamiento.id, request).subscribe({
      next: (enfrentamientoActualizado) => {
        // Actualizar el enfrentamiento en la lista
        this.enfrentamientos.update(current =>
          current.map(e => e.id === enfrentamiento.id ? enfrentamientoActualizado : e)
        );
        this.ocultarFormularioEdicion();
        this.updating.set(false);
      },
      error: (error) => {
        this.error.set('Error al actualizar enfrentamiento: ' + error.message);
        this.updating.set(false);
      }
    });
  }

  getEditFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['maxlength']) return `${fieldName} excede la longitud máxima`;
      if (field.errors['golesNoCoinciden']) return 'Los goles individuales no coinciden con el total';
    }
    return '';
  }

  // Métodos para manejo de goles por jugador
  get golesJugadoresLocalArray(): FormArray {
    return this.editForm.get('golesJugadoresLocal') as FormArray;
  }

  get golesJugadoresVisitanteArray(): FormArray {
    return this.editForm.get('golesJugadoresVisitante') as FormArray;
  }

  agregarGolJugadorLocal(): void {
    const golJugadorForm = this.fb.group({
      jugadorId: ['', [Validators.required]],
      cantidadGoles: [1, [Validators.required, Validators.min(1)]]
    });
    this.golesJugadoresLocalArray.push(golJugadorForm);
  }

  agregarGolJugadorVisitante(): void {
    const golJugadorForm = this.fb.group({
      jugadorId: ['', [Validators.required]],
      cantidadGoles: [1, [Validators.required, Validators.min(1)]]
    });
    this.golesJugadoresVisitanteArray.push(golJugadorForm);
  }

  eliminarGolJugadorLocal(index: number): void {
    this.golesJugadoresLocalArray.removeAt(index);
  }

  eliminarGolJugadorVisitante(index: number): void {
    this.golesJugadoresVisitanteArray.removeAt(index);
  }

  limpiarGolesJugadores(): void {
    this.golesJugadoresLocalArray.clear();
    this.golesJugadoresVisitanteArray.clear();
  }

  cargarJugadoresDeEquipos(enfrentamiento: EnfrentamientoResponse): void {
    // Buscar los equipos por nombre para obtener sus IDs
    const equipoLocal = this.equipos().find(e => e.nombre === enfrentamiento.equipoLocal);
    const equipoVisitante = this.equipos().find(e => e.nombre === enfrentamiento.equipoVisitante);

    if (equipoLocal) {
      this.jugadorService.buscarJugadoresPorEquipo(equipoLocal.id!).subscribe({
        next: (jugadores) => this.jugadoresLocal.set(jugadores),
        error: (error) => console.error('Error cargando jugadores locales:', error)
      });
    }

    if (equipoVisitante) {
      this.jugadorService.buscarJugadoresPorEquipo(equipoVisitante.id!).subscribe({
        next: (jugadores) => this.jugadoresVisitante.set(jugadores),
        error: (error) => console.error('Error cargando jugadores visitantes:', error)
      });
    }
  }

  calcularSumaGolesLocal(): number {
    return this.golesJugadoresLocalArray.controls.reduce((suma, control) => {
      return suma + (control.get('cantidadGoles')?.value || 0);
    }, 0);
  }

  calcularSumaGolesVisitante(): number {
    return this.golesJugadoresVisitanteArray.controls.reduce((suma, control) => {
      return suma + (control.get('cantidadGoles')?.value || 0);
    }, 0);
  }

  validarGolesCoinciden(): boolean {
    if (!this.mostrarCamposGoles()) return true;

    const golesLocalTotal = this.editForm.get('golesLocal')?.value || 0;
    const golesVisitanteTotal = this.editForm.get('golesVisitante')?.value || 0;
    const sumaGolesLocal = this.calcularSumaGolesLocal();
    const sumaGolesVisitante = this.calcularSumaGolesVisitante();

    return golesLocalTotal === sumaGolesLocal && golesVisitanteTotal === sumaGolesVisitante;
  }

  prellenarGolesJugadores(enfrentamiento: EnfrentamientoResponse): void {
    // Prellenar goles de jugadores locales si existen
    if (enfrentamiento.golesJugadoresLocal?.length) {
      enfrentamiento.golesJugadoresLocal.forEach(gol => {
        this.golesJugadoresLocalArray.push(this.fb.group({
          jugadorId: [gol.jugadorId, [Validators.required]],
          cantidadGoles: [gol.cantidadGoles, [Validators.required, Validators.min(1), Validators.max(10)]]
        }));
      });
    }

    // Prellenar goles de jugadores visitantes si existen
    if (enfrentamiento.golesJugadoresVisitante?.length) {
      enfrentamiento.golesJugadoresVisitante.forEach(gol => {
        this.golesJugadoresVisitanteArray.push(this.fb.group({
          jugadorId: [gol.jugadorId, [Validators.required]],
          cantidadGoles: [gol.cantidadGoles, [Validators.required, Validators.min(1), Validators.max(10)]]
        }));
      });
    }
  }

  // Métodos para eliminación de enfrentamiento
  mostrarConfirmacionEliminar(enfrentamiento: EnfrentamientoResponse): void {
    this.enfrentamientoToDelete.set(enfrentamiento);
    this.showDeleteConfirm.set(true);
  }

  ocultarConfirmacionEliminar(): void {
    this.showDeleteConfirm.set(false);
    this.enfrentamientoToDelete.set(null);
  }

  eliminarEnfrentamiento(): void {
    const enfrentamiento = this.enfrentamientoToDelete();
    if (!enfrentamiento) return;

    this.deleting.set(true);

    this.enfrentamientoService.eliminarEnfrentamiento(enfrentamiento.id).subscribe({
      next: () => {
        // Eliminar el enfrentamiento de la lista
        this.enfrentamientos.update(current =>
          current.filter(e => e.id !== enfrentamiento.id)
        );
        this.ocultarConfirmacionEliminar();
        this.deleting.set(false);
      },
      error: (error) => {
        this.error.set('Error al eliminar enfrentamiento: ' + error.message);
        this.deleting.set(false);
      }
    });
  }
}
