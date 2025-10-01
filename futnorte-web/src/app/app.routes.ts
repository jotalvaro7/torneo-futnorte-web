import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/torneos',
    pathMatch: 'full'
  },
  // Rutas de Torneos
  {
    path: 'torneos',
    loadComponent: () => import('./pages/torneos/torneo-list/torneo-list.component').then(c => c.TorneoListComponent)
  },
  {
    path: 'torneos/nuevo',
    loadComponent: () => import('./pages/torneos/torneo-form/torneo-form.component').then(c => c.TorneoFormComponent)
  },
  {
    path: 'torneos/:id',
    loadComponent: () => import('./pages/torneos/torneo-detail/torneo-detail.component').then(c => c.TorneoDetailComponent)
  },
  {
    path: 'torneos/:id/editar',
    loadComponent: () => import('./pages/torneos/torneo-form/torneo-form.component').then(c => c.TorneoFormComponent)
  },
  {
    path: 'torneos/:id/equipos',
    loadComponent: () => import('./pages/torneos/torneo-equipos/torneo-equipos.component').then(c => c.TorneoEquiposComponent)
  },
  {
    path: 'torneos/:id/fixture',
    loadComponent: () => import('./pages/torneos/torneo-fixture/torneo-fixture.component').then(c => c.TorneoFixtureComponent)
  },
  {
    path: 'torneos/:id/goleadores',
    loadComponent: () => import('./pages/torneos/goleadores-list/goleadores-list.component').then(c => c.GoleadoresListComponent)
  },
  {
    path: 'torneos/:id/posiciones',
    loadComponent: () => import('./pages/torneos/tabla-posiciones/tabla-posiciones.component').then(c => c.TablaPosicionesComponent)
  },
  // Rutas de Equipos
  {
    path: 'equipos/nuevo',
    loadComponent: () => import('./pages/equipos/equipo-form/equipo-form.component').then(c => c.EquipoFormComponent)
  },
  {
    path: 'equipos/:id',
    loadComponent: () => import('./pages/equipos/equipo-detail/equipo-detail.component').then(c => c.EquipoDetailComponent)
  },
  {
    path: 'equipos/:id/editar',
    loadComponent: () => import('./pages/equipos/equipo-form/equipo-form.component').then(c => c.EquipoFormComponent)
  },
  // Rutas de Jugadores
  {
    path: 'jugadores/buscar',
    loadComponent: () => import('./pages/jugadores/jugador-search/jugador-search.component').then(c => c.JugadorSearchComponent)
  },
  {
    path: 'equipos/:equipoId/jugadores/nuevo',
    loadComponent: () => import('./pages/jugadores/jugador-form/jugador-form.component').then(c => c.JugadorFormComponent)
  },
  {
    path: 'equipos/:equipoId/jugadores/:jugadorId/editar',
    loadComponent: () => import('./pages/jugadores/jugador-form/jugador-form.component').then(c => c.JugadorFormComponent)
  }
];
