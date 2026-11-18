import { ParamMap } from '@angular/router';
import { DEFAULT_SHOP_SORT, ShopFilters } from '../../../core/models/shop.model';

/**
 * Traducción entre la URL y los filtros de la tienda.
 *
 * La URL es la única fuente de verdad: la lista lee los filtros con
 * readUrlState() y escribe los cambios con toShopQueryParams(). Ambos usan
 * este archivo para que lectura y escritura no se puedan desincronizar.
 */

/** Lee los filtros y la página de los parámetros de la URL. */
export function readUrlState(params: ParamMap): {
  filters: ShopFilters;
  page: number;
} {
  return {
    filters: {
      search: params.get('search')?.trim() || undefined,
      category: params.get('category') || undefined,
      host: params.get('host') || undefined,
      location: params.get('location') || undefined,
      minPrice: readPositiveNumber(params.get('minPrice')) ?? undefined,
      maxPrice: readPositiveNumber(params.get('maxPrice')) ?? undefined,
      // La URL no guarda el orden; siempre se pide el orden por defecto.
      sort: DEFAULT_SHOP_SORT
    },
    page: readPositiveNumber(params.get('page')) ?? 1
  };
}

/** Convierte filtros y página en los query params de la URL de la lista. */
export function toShopQueryParams(
  filters: ShopFilters,
  page = 1
): Record<string, string | number> {
  const queryParams: Record<string, string | number> = {};

  if (filters.search) queryParams['search'] = filters.search;
  if (filters.category) queryParams['category'] = filters.category;
  if (filters.host) queryParams['host'] = filters.host;
  if (filters.location) queryParams['location'] = filters.location;
  if (filters.minPrice !== undefined) queryParams['minPrice'] = filters.minPrice;
  if (filters.maxPrice !== undefined) queryParams['maxPrice'] = filters.maxPrice;
  // El orden no se guarda en la URL: siempre se usa el orden por defecto.
  if (page > 1) queryParams['page'] = page;

  return queryParams;
}

/** Convierte un parámetro en número positivo; null si no es válido. */
function readPositiveNumber(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
