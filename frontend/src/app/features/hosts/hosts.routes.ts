import { Routes } from '@angular/router';

export const HOSTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/host-list/host-list').then((m) => m.HostList)
  }
];
