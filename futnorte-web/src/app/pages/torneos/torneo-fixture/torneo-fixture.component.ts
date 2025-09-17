import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EnfrentamientoService } from '../../../services/enfrentamiento.service';
import { EquipoService } from '../../../services/equipo.service';
import { TorneoService } from '../../../services/torneo.service';
import { EnfrentamientoResponse, CrearEnfrentamientoRequest, Equipo, Torneo } from '../../../models';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  torneo = signal<Torneo | null>(null);
  equipos = signal<Equipo[]>([]);
  enfrentamientos = signal<EnfrentamientoResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showCreateForm = signal(false);
  creating = signal(false);

  // Filtros de fecha
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  filtrandoPorFecha = signal(false);
  mostrarFiltros = signal(false);
  
  // Control de acordeón
  seccionProgramadosAbierta = signal(true);
  seccionFinalizadosAbierta = signal(true);
  seccionCanceladosAbierta = signal(false);

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

  enfrentamientosCancelados = computed(() => {
    const cancelados = this.enfrentamientos().filter(e => e.estado === 'CANCELADO');
    return [...cancelados].sort((a, b) => {
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
      case 'CANCELADO': return 'bg-red-100 text-red-800';
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

  toggleSeccionCancelados(): void {
    this.seccionCanceladosAbierta.set(!this.seccionCanceladosAbierta());
  }
}
