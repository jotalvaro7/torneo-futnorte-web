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
  }
];
