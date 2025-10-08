import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TorneoFixtureStateService } from './services/torneo-fixture-state.service';
import { FiltrosFechaComponent } from './components/filtros-fecha/filtros-fecha.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { EnfrentamientoCreateFormComponent } from './components/enfrentamiento-create-form/enfrentamiento-create-form.component';
import { EnfrentamientoEditModalComponent } from './components/enfrentamiento-edit-modal/enfrentamiento-edit-modal.component';
import { EnfrentamientoListComponent } from './components/enfrentamiento-list/enfrentamiento-list.component';
import { PdfFechaModalComponent } from './components/pdf-fecha-modal/pdf-fecha-modal.component';
import { EnfrentamientoResponse, CrearEnfrentamientoRequest, ActualizarEnfrentamientoRequest, Jugador } from '../../../models';
import { PdfExportService } from '../../../services/pdf-export.service';

@Component({
  selector: 'app-torneo-fixture',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FiltrosFechaComponent,
    DeleteConfirmationModalComponent,
    EnfrentamientoCreateFormComponent,
    EnfrentamientoEditModalComponent,
    EnfrentamientoListComponent,
    PdfFechaModalComponent
  ],
  providers: [TorneoFixtureStateService],
  templateUrl: './torneo-fixture.component.html',
  styleUrl: './torneo-fixture.component.css'
})
export class TorneoFixtureComponent implements OnInit {
  private readonly state = inject(TorneoFixtureStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pdfExportService = inject(PdfExportService);

  // UI state
  showCreateForm = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  showPdfFechaModal = signal(false);
  editingEnfrentamiento = signal<EnfrentamientoResponse | null>(null);
  enfrentamientoToDelete = signal<EnfrentamientoResponse | null>(null);
  jugadoresLocal = signal<Jugador[]>([]);
  jugadoresVisitante = signal<Jugador[]>([]);

  // Computed para el mensaje del modal de eliminación
  deleteModalMessage = computed(() => {
    const enfrentamiento = this.enfrentamientoToDelete();
    if (!enfrentamiento) return '';
    return `¿Está seguro de que desea eliminar el partido <span class="font-bold text-slate-900">${enfrentamiento.equipoLocal} vs ${enfrentamiento.equipoVisitante}</span>?`;
  });

  // Exponer state del servicio
  torneo = this.state.torneo;
  equipos = this.state.equipos;
  loading = this.state.loading;
  error = this.state.error;
  creating = this.state.creating;
  updating = this.state.updating;
  deleting = this.state.deleting;

  // Filtros
  fechaInicio = this.state.fechaInicio;
  fechaFin = this.state.fechaFin;
  filtrandoPorFecha = this.state.filtrandoPorFecha;

  // Enfrentamientos organizados
  enfrentamientosProgramados = this.state.enfrentamientosProgramados;
  enfrentamientosFinalizados = this.state.enfrentamientosFinalizados;
  enfrentamientosAplazados = this.state.enfrentamientosAplazados;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const torneoId = id ? +id : null;

    if (torneoId) {
      this.state.cargarDatos(torneoId).then(() => {
        this.state.cargarPartidosSemanaActual(torneoId);
      });
    } else {
      this.state.error.set('ID de torneo inválido');
    }
  }

  // Navegación
  onBack(): void {
    const id = this.torneo()?.id;
    this.router.navigate(['/torneos', id]);
  }

  // Crear enfrentamiento
  mostrarFormularioCreacion(): void {
    this.showCreateForm.set(true);
  }

  ocultarFormularioCreacion(): void {
    this.showCreateForm.set(false);
  }

  async crearEnfrentamiento(request: CrearEnfrentamientoRequest): Promise<void> {
    await this.state.crearEnfrentamiento(request);
    this.ocultarFormularioCreacion();
  }

  // Editar enfrentamiento
  async mostrarFormularioEdicion(enfrentamiento: EnfrentamientoResponse): Promise<void> {
    this.editingEnfrentamiento.set(enfrentamiento);

    // Cargar jugadores de ambos equipos
    await this.state.cargarJugadoresDeEquipos(enfrentamiento);
    this.jugadoresLocal.set(this.state.jugadoresLocal());
    this.jugadoresVisitante.set(this.state.jugadoresVisitante());

    this.showEditModal.set(true);
  }

  ocultarFormularioEdicion(): void {
    this.showEditModal.set(false);
    this.editingEnfrentamiento.set(null);
    this.jugadoresLocal.set([]);
    this.jugadoresVisitante.set([]);
  }

  async actualizarEnfrentamiento(request: ActualizarEnfrentamientoRequest): Promise<void> {
    const enfrentamiento = this.editingEnfrentamiento();
    if (!enfrentamiento) return;

    await this.state.actualizarEnfrentamiento(enfrentamiento.id, request);
    this.ocultarFormularioEdicion();
  }

  // Eliminar enfrentamiento
  mostrarConfirmacionEliminar(enfrentamiento: EnfrentamientoResponse): void {
    this.enfrentamientoToDelete.set(enfrentamiento);
    this.showDeleteConfirm.set(true);
  }

  ocultarConfirmacionEliminar(): void {
    this.showDeleteConfirm.set(false);
    this.enfrentamientoToDelete.set(null);
  }

  async eliminarEnfrentamiento(): Promise<void> {
    const enfrentamiento = this.enfrentamientoToDelete();
    if (!enfrentamiento) return;

    await this.state.eliminarEnfrentamiento(enfrentamiento.id);
    this.ocultarConfirmacionEliminar();
  }

  // Filtros de fecha
  onFechaInicioChange(fecha: string): void {
    this.state.fechaInicio.set(fecha);
  }

  onFechaFinChange(fecha: string): void {
    this.state.fechaFin.set(fecha);
  }

  filtrarPorFecha(): void {
    const torneoId = this.torneo()?.id;
    if (torneoId) {
      this.state.filtrarPorFecha(torneoId);
    }
  }

  limpiarFiltros(): void {
    const torneoId = this.torneo()?.id;
    if (torneoId) {
      this.state.limpiarFiltros(torneoId);
    }
  }

  establecerFiltroSemana(): void {
    this.state.establecerFiltroSemana();
  }

  establecerFiltroMes(): void {
    this.state.establecerFiltroMes();
  }

  mostrarModalFechaPDF(): void {
    this.showPdfFechaModal.set(true);
  }

  ocultarModalFechaPDF(): void {
    this.showPdfFechaModal.set(false);
  }

  exportarFixturePDF(fechaProgramar: string): void {
    const enfrentamientos = this.state.enfrentamientosOrdenados();
    const torneoId = this.torneo()?.id;
    const nombreTorneo = this.torneo()?.nombre;

    if (torneoId) {
      this.pdfExportService.exportarFixture(
        enfrentamientos,
        torneoId,
        nombreTorneo,
        fechaProgramar
      );
      this.ocultarModalFechaPDF();
    }
  }
}