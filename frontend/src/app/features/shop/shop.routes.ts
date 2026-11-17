import { Routes } from '@angular/router';

export const SHOP_ROUTES: Routes = [
  {
    path: 'shop',
    loadComponent: () => import('./pages/shop/shop').then((m) => m.Shop)
  },
  {
    path: 'shop-list',
    loadComponent: () =>
      import('./pages/shop-list/shop-list').then((m) => m.ShopList)
  },
  {
    path: 'shop/:slug',
    loadComponent: () =>
      import('./pages/shop-detail/shop-detail').then((m) => m.ShopDetail)
  }
];
