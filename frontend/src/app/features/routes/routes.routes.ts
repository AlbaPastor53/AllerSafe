import { Routes } from '@angular/router';

export const ROUTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/route-list/route-list').then((m) => m.RouteList)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/route-create/route-create').then((m) => m.RouteCreate)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/route-edit/route-edit').then((m) => m.RouteEdit)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/route-detail/route-detail').then((m) => m.RouteDetail)
  }
];
