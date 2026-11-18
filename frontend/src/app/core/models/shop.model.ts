import { signal } from '@angular/core';
import { Category } from './category.model';
import { Event, EventSort } from './event.model';
import { Host } from './host.model';
import { Location } from './location.model';

export interface ShopFilters {
  search?: string;
  category?: string;
  host?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: EventSort;
}

export type ShopFilterKey =
  | 'search'
  | 'category'
  | 'host'
  | 'location'
  | 'price'
  | 'sort';

export interface ShopActiveFilter {
  key: ShopFilterKey;
  label: string;
  value: string;
}

export interface ShopMeta {
  limit: number;
  offset: number;
  total: number;
  count: number;
  hasMore: boolean;
  nextOffset: number | null;
  prevOffset: number | null;
  page: number;
  totalPages: number;
}

export interface ShopHomeData {
  events: Event[];
  categories: Category[];
  hosts: Host[];
  locations: Location[];
}

export interface ShopEventsResult {
  items: Event[];
  meta: ShopMeta;
}

export interface ShopSortOption {
  value: EventSort;
  label: string;
}

export const SHOP_PAGE_SIZE = 4;
export const SHOP_OVERVIEW_LIMIT = 8;
export const SHOP_PRICE_MIN = 0;
export const SHOP_PRICE_MAX = 60;
export const SHOP_PRICE_STEP = 5;
export const DEFAULT_SHOP_SORT: EventSort = 'date_asc';

export const SHOP_SORT_OPTIONS: readonly ShopSortOption[] = [
  { value: 'date_asc', label: 'Fecha: próximas primero' },
  { value: 'date_desc', label: 'Fecha: más lejanas primero' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre: A-Z' },
  { value: 'name_desc', label: 'Nombre: Z-A' }
];

/**
 * Revisión del catálogo público. Administración la incrementa cuando cambia
 * un dato que la tienda muestra; la tienda la lee y recarga su caché al entrar.
 */
export const shopCatalogRevision = signal(0);

export function invalidateShopCatalog(): void {
  shopCatalogRevision.update((value) => value + 1);
}
