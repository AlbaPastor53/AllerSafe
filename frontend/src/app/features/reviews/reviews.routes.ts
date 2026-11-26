import { Routes } from '@angular/router';

export const REVIEWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/review-dashboard/review-dashboard').then(
        (m) => m.ReviewDashboard
      )
  }
];
