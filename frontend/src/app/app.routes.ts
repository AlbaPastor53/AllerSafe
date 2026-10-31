import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.Login)
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
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
