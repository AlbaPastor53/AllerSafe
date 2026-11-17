import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { PageMeta, Paginated } from '../models/api.model';
import {
  EventFilters,
  Event,
  EventPayload,
  EventSearchFilters
} from '../models/event.model';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

function isEvent(data: unknown): data is Event {
  return typeof data === 'object' && data !== null && '_id' in data;
}

function extractData<T>(response: ApiResponse<T> | null | undefined, valid: (data: T) => boolean): T {
  const data = response?.data;
  if (data === undefined || data === null || !valid(data)) throw new Error('INVALID_RESPONSE');
  return data;
}

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly api = inject(ApiService);

  list(filters: EventFilters = {}): Observable<Event[]> {
    let params = new HttpParams();
    if (filters.includeDeleted) params = params.set('includeDeleted', 'true');
    return this.api
      .get<ApiResponse<Event[]>>('events', params)
      .pipe(map((r) => extractData(r, Array.isArray)));
  }

  search(filters: EventSearchFilters = {}): Observable<Paginated<Event>> {
    let params = new HttpParams();

    const appendAll = (key: string, values?: readonly string[]): void => {
      for (const value of values ?? []) {
        if (value) params = params.append(key, value);
      }
    };

    if (filters.search?.trim()) params = params.set('search', filters.search.trim());
    appendAll('category', filters.category);
    appendAll('host', filters.host);
    appendAll('location', filters.location);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.isActive !== undefined) {
      params = params.set('is_active', String(filters.isActive));
    }
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));
    if (filters.sort) params = params.set('sort', filters.sort);

    return this.api
      .get<ApiResponse<Event[]> & { meta?: PageMeta }>('events', params)
      .pipe(
        map((response) => ({
          items: extractData(response, Array.isArray),
          meta: response.meta
        }))
      );
  }

  getById(id: string): Observable<Event> {
    return this.api
      .get<ApiResponse<Event>>(`events/${encodeURIComponent(id)}`)
      .pipe(map((r) => extractData(r, isEvent)));
  }

  getBySlug(slug: string): Observable<Event> {
    return this.api
      .get<ApiResponse<Event>>(`events/slug/${encodeURIComponent(slug)}`)
      .pipe(map((r) => extractData(r, isEvent)));
  }

  create(payload: EventPayload): Observable<Event> {
    return this.api
      .post<ApiResponse<Event>>('events', payload)
      .pipe(map((r) => extractData(r, isEvent)));
  }

  update(id: string, payload: Partial<EventPayload>): Observable<Event> {
    return this.api
      .patch<ApiResponse<Event>>(`events/${encodeURIComponent(id)}`, payload)
      .pipe(map((r) => extractData(r, isEvent)));
  }

  setActive(id: string, active: boolean): Observable<Event> {
    return this.update(id, { is_active: active });
  }

  /** El backend responde 204 No Content en el borrado lógico. */
  remove(id: string): Observable<void> {
    return this.api.delete<void>(`events/${encodeURIComponent(id)}`);
  }
}
