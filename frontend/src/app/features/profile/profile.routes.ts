import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/profile-detail/profile-detail').then((m) => m.ProfileDetail)
  }
];
