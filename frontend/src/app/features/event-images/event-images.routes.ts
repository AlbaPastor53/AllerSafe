import { Routes } from '@angular/router';

export const EVENT_IMAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/event-image-list/event-image-list').then((m) => m.EventImageList)
  }
];
