import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Event } from '../models/event.model';
import {
  SHOP_PAGE_SIZE,
  ShopEventsResult,
  ShopFilters,
  ShopHomeData,
  ShopMeta
} from '../models/shop.model';

interface ShopEventsResponse extends ApiResponse<Event[]> {
  meta?: ShopMeta;
}

interface ShopEventsOptions {
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}

function extractEvent(data: unknown): Event {
  if (typeof data !== 'object' || data === null || !('_id' in data)) {
    throw new Error('INVALID_RESPONSE');
  }
  return data as Event;
}

function toEventsResult(response: ShopEventsResponse): ShopEventsResult {
  const items = response?.data;

  if (!Array.isArray(items) || !response.meta) {
    throw new Error('INVALID_RESPONSE');
  }

  return { items, meta: response.meta };
}

@Injectable({ providedIn: 'root' })
export class ShopService {
  private readonly api = inject(ApiService);

  getHome(): Observable<ShopHomeData> {
    return this.api.get<ApiResponse<ShopHomeData>>('shop').pipe(
      map((response) => {
        const data = response?.data;
        if (
          !data ||
          !Array.isArray(data.events) ||
          !Array.isArray(data.categories) ||
          !Array.isArray(data.hosts) ||
          !Array.isArray(data.locations)
        ) {
          throw new Error('INVALID_RESPONSE');
        }
        return data;
      })
    );
  }

  getEvents(
    filters: ShopFilters = {},
    options: ShopEventsOptions = {}
  ): Observable<ShopEventsResult> {
    let params = new HttpParams();

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }
    if (filters.category) params = params.set('category', filters.category);
    if (filters.host) params = params.set('host', filters.host);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.minPrice !== undefined) {
      params = params.set('minPrice', String(filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      params = params.set('maxPrice', String(filters.maxPrice));
    }
    if (filters.sort) params = params.set('sort', filters.sort);

    params = params.set('limit', String(options.limit ?? SHOP_PAGE_SIZE));
    params = params.set('offset', String(options.offset ?? 0));

    const response$ = options.signal
      ? this.api.getWithSignal<ShopEventsResponse>(
          'shop/events',
          params,
          options.signal
        )
      : this.api.get<ShopEventsResponse>('shop/events', params);

    return response$.pipe(map(toEventsResult));
  }

  getEventBySlug(slug: string): Observable<Event> {
    return this.api
      .get<ApiResponse<Event>>(`shop/events/slug/${encodeURIComponent(slug)}`)
      .pipe(map((response) => extractEvent(response?.data)));
  }
}
