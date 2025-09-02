import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/torneos',
    pathMatch: 'full'
  },
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
  }
];
