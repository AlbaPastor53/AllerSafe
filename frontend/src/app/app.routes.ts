import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
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
      { path: '', redirectTo: 'departures', pathMatch: 'full' },
      {
        path: 'events',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./features/events/events.routes').then((m) => m.EVENTS_ROUTES)
      },
      {
        path: 'departures',
        loadChildren: () =>
          import('./features/departures/departures.routes').then((m) => m.DEPARTURES_ROUTES)
      },
      {
        path: 'categories',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES)
      },
      {
        path: 'locations',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./features/locations/locations.routes').then((m) => m.LOCATIONS_ROUTES)
      },
      {
        path: 'hosts',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./features/hosts/hosts.routes').then((m) => m.HOSTS_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES)
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'departures' }
];
