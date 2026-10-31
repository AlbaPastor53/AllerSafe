import { Routes } from '@angular/router';

export const DEPARTURES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/departure-list/departure-list').then((m) => m.DepartureList)
  }
];
