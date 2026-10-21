import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'routes', pathMatch: 'full' },
      {
        path: 'routes',
        loadChildren: () =>
          import('./features/routes/routes.routes').then((m) => m.ROUTES_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'routes' }
];
