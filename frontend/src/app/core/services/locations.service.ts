import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Location, LocationPayload } from '../models/location.model';

function extractList<T>(response: ApiResponse<T[]> | null | undefined): T[] {
  const data = response?.data;
  if (!Array.isArray(data)) throw new Error('INVALID_RESPONSE');
  return data;
}

function extractData<T>(response: ApiResponse<T> | null | undefined): T {
  const data = response?.data;
  if (data === undefined || data === null) throw new Error('INVALID_RESPONSE');
  return data;
}

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private readonly api = inject(ApiService);

  list(): Observable<Location[]> {
    return this.api
      .get<ApiResponse<Location[]>>('locations')
      .pipe(map((response) => extractList(response)));
  }

  create(payload: LocationPayload): Observable<Location> {
    return this.api
      .post<ApiResponse<Location>>('locations', payload)
      .pipe(map((response) => extractData(response)));
  }

  update(id: string, payload: Partial<LocationPayload>): Observable<Location> {
    return this.api
      .patch<ApiResponse<Location>>(`locations/${encodeURIComponent(id)}`, payload)
      .pipe(map((response) => extractData(response)));
  }

  setActive(id: string, active: boolean): Observable<Location> {
    return this.api
      .patch<ApiResponse<Location>>(`locations/${encodeURIComponent(id)}/status`, {
        status: active ? 'active' : 'inactive'
      })
      .pipe(map((response) => extractData(response)));
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`locations/${encodeURIComponent(id)}`);
  }
}
