import { Component, input, output, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { EnfrentamientoResponse, Jugador, GolesJugadorResponse, ActualizarEnfrentamientoRequest } from '../../../../../models';
import { GoleadoresFormComponent } from '../goleadores-form/goleadores-form.component';

@Component({
  selector: 'app-enfrentamiento-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GoleadoresFormComponent],
  templateUrl: './enfrentamiento-edit-modal.component.html',
  styleUrl: './enfrentamiento-edit-modal.component.css'
})
export class EnfrentamientoEditModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  // Inputs
  enfrentamiento = input.required<EnfrentamientoResponse>();
  jugadoresLocal = input.required<Jugador[]>();
  jugadoresVisitante = input.required<Jugador[]>();
  updating = input<boolean>(false);

  // Outputs
  updateSubmit = output<ActualizarEnfrentamientoRequest>();
  cancel = output<void>();

  // State
  editMode = signal(false);
  mostrarCamposGoles = signal(false);
  mostrarCanchaPersonalizada = signal(false);

  // Canchas predefinidas
  readonly canchasPredefinidas = [
    'Campo Santander',
    'Porvenir',
    'Tablazo',
    'Cuchillas',
    'Quebrada Arriba',
    'Santa Barbara',
    'Otra...'
  ];

  // Form
  editForm = this.fb.nonNullable.group({
    fechaHora: ['', [Validators.required]],
    canchaSeleccionada: ['', [Validators.required]],
    canchaPersonalizada: [''],
    estado: ['', [Validators.required]],
    golesLocal: [0, [Validators.required, Validators.min(0)]],
    golesVisitante: [0, [Validators.required, Validators.min(0)]],
    golesJugadoresLocal: this.fb.array([]),
    golesJugadoresVisitante: this.fb.array([])
  });

  // Computed
  golesLocalArray = computed(() => this.editForm.controls.golesJugadoresLocal);
  golesVisitanteArray = computed(() => this.editForm.controls.golesJugadoresVisitante);
  golesExistentesLocal = computed(() => this.enfrentamiento().golesJugadoresLocal || []);
  golesExistentesVisitante = computed(() => this.enfrentamiento().golesJugadoresVisitante || []);

  ngOnInit(): void {
    this.cargarDatosEnFormulario();

    // Mostrar campos de goles si el estado es FINALIZADO
    if (this.enfrentamiento().estado === 'FINALIZADO') {
      this.mostrarCamposGoles.set(true);
      this.prellenarGolesJugadores();
    }

    // Suscribirse a cambios en la cancha seleccionada
    this.editForm.get('canchaSeleccionada')?.valueChanges.subscribe((valor) => {
      this.onCanchaSeleccionadaChange(valor);
    });
  }

  cargarDatosEnFormulario(): void {
    const enfrentamiento = this.enfrentamiento();
    const canchaActual = enfrentamiento.cancha;

    // Verificar si la cancha actual está en las predefinidas
    const esCanchaPredefinida = this.canchasPredefinidas.includes(canchaActual);

    this.editForm.patchValue({
      fechaHora: enfrentamiento.fechaHora,
      canchaSeleccionada: esCanchaPredefinida ? canchaActual : 'Otra...',
      canchaPersonalizada: esCanchaPredefinida ? '' : canchaActual,
      estado: enfrentamiento.estado,
      golesLocal: enfrentamiento.golesLocal || 0,
      golesVisitante: enfrentamiento.golesVisitante || 0
    });

    // Si no es predefinida, mostrar el campo personalizado
    if (!esCanchaPredefinida) {
      this.mostrarCanchaPersonalizada.set(true);
      this.editForm.get('canchaPersonalizada')?.setValidators([Validators.required, Validators.maxLength(100)]);
      this.editForm.get('canchaPersonalizada')?.updateValueAndValidity();
    }
  }

  onCanchaSeleccionadaChange(valor: string): void {
    if (valor === 'Otra...') {
      this.mostrarCanchaPersonalizada.set(true);
      this.editForm.get('canchaPersonalizada')?.setValidators([Validators.required, Validators.maxLength(100)]);
    } else {
      this.mostrarCanchaPersonalizada.set(false);
      this.editForm.get('canchaPersonalizada')?.clearValidators();
      this.editForm.get('canchaPersonalizada')?.setValue('');
    }
    this.editForm.get('canchaPersonalizada')?.updateValueAndValidity();
  }

  prellenarGolesJugadores(): void {
    const enfrentamiento = this.enfrentamiento();

    // Limpiar arrays existentes
    this.golesLocalArray().clear();
    this.golesVisitanteArray().clear();

    // Prellenar goles locales
    if (enfrentamiento.golesJugadoresLocal?.length) {
      enfrentamiento.golesJugadoresLocal.forEach(gol => {
        (this.golesLocalArray() as FormArray).push(this.fb.group({
          jugadorId: [gol.jugadorId, [Validators.required]],
          cantidadGoles: [gol.cantidadGoles, [Validators.required, Validators.min(1), Validators.max(10)]]
        }));
      });
    }

    // Prellenar goles visitantes
    if (enfrentamiento.golesJugadoresVisitante?.length) {
      enfrentamiento.golesJugadoresVisitante.forEach(gol => {
        (this.golesVisitanteArray() as FormArray).push(this.fb.group({
          jugadorId: [gol.jugadorId, [Validators.required]],
          cantidadGoles: [gol.cantidadGoles, [Validators.required, Validators.min(1), Validators.max(10)]]
        }));
      });
    }
  }

  toggleEditMode(): void {
    this.editMode.update(current => !current);
  }

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value;

    if (nuevoEstado === 'FINALIZADO') {
      this.mostrarCamposGoles.set(true);
    } else {
      this.mostrarCamposGoles.set(false);
      this.golesLocalArray().clear();
      this.golesVisitanteArray().clear();
      this.editForm.patchValue({
        golesLocal: 0,
        golesVisitante: 0
      });
    }
  }

  agregarGolLocal(): void {
    (this.golesLocalArray() as FormArray).push(this.fb.group({
      jugadorId: ['', [Validators.required]],
      cantidadGoles: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
    }));
  }

  agregarGolVisitante(): void {
    (this.golesVisitanteArray() as FormArray).push(this.fb.group({
      jugadorId: ['', [Validators.required]],
      cantidadGoles: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
    }));
  }

  eliminarGolLocal(index: number): void {
    this.golesLocalArray().removeAt(index);
  }

  eliminarGolVisitante(index: number): void {
    this.golesVisitanteArray().removeAt(index);
  }

  calcularSumaGolesLocal(): number {
    return this.golesLocalArray().controls.reduce((suma, control) => {
      return suma + (control.get('cantidadGoles')?.value || 0);
    }, 0);
  }

  calcularSumaGolesVisitante(): number {
    return this.golesVisitanteArray().controls.reduce((suma, control) => {
      return suma + (control.get('cantidadGoles')?.value || 0);
    }, 0);
  }

  validarGoles(): boolean {
    const estado = this.editForm.value.estado;
    if (estado !== 'FINALIZADO') {
      return true;
    }

    const golesLocalTotal = this.editForm.value.golesLocal || 0;
    const golesVisitanteTotal = this.editForm.value.golesVisitante || 0;
    const sumaGolesLocal = this.calcularSumaGolesLocal();
    const sumaGolesVisitante = this.calcularSumaGolesVisitante();

    return golesLocalTotal === sumaGolesLocal && golesVisitanteTotal === sumaGolesVisitante;
  }

  onSubmit(): void {
    if (this.updating()) {
      return; // Prevenir múltiples submits
    }

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    if (!this.validarGoles()) {
      alert('La suma de los goles individuales debe coincidir con el total de goles del equipo');
      return;
    }

    const formValue = this.editForm.getRawValue();

    // Determinar qué valor de cancha usar
    const cancha = formValue.canchaSeleccionada === 'Otra...'
      ? formValue.canchaPersonalizada
      : formValue.canchaSeleccionada;

    const request: ActualizarEnfrentamientoRequest = {
      fechaHora: formValue.fechaHora,
      cancha: cancha,
      estado: formValue.estado as 'PROGRAMADO' | 'FINALIZADO' | 'APLAZADO',
      golesLocal: formValue.estado === 'FINALIZADO' ? formValue.golesLocal : undefined,
      golesVisitante: formValue.estado === 'FINALIZADO' ? formValue.golesVisitante : undefined,
      golesJugadoresLocal: formValue.estado === 'FINALIZADO'
        ? formValue.golesJugadoresLocal.map((gol: any) => ({
            jugadorId: Number(gol.jugadorId),
            cantidadGoles: Number(gol.cantidadGoles)
          }))
        : undefined,
      golesJugadoresVisitante: formValue.estado === 'FINALIZADO'
        ? formValue.golesJugadoresVisitante.map((gol: any) => ({
            jugadorId: Number(gol.jugadorId),
            cantidadGoles: Number(gol.cantidadGoles)
          }))
        : undefined
    };

    this.updateSubmit.emit(request);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('es-CO');
  }
}