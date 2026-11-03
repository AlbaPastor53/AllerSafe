import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import {
  Departure,
  DepartureFilters,
  DeparturePayload,
  DepartureStatus
} from '../models/departure.model';

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
export class DeparturesService {
  private readonly api = inject(ApiService);

  list(filters: DepartureFilters = {}): Observable<Departure[]> {
    let params = new HttpParams();
    if (filters.event) params = params.set('event', filters.event);
    if (filters.includeDeleted) params = params.set('includeDeleted', 'true');

    return this.api
      .get<ApiResponse<Departure[]>>('departures', params)
      .pipe(map((response) => extractList(response)));
  }

  getById(id: string): Observable<Departure> {
    return this.api
      .get<ApiResponse<Departure>>(`departures/${encodeURIComponent(id)}`)
      .pipe(map((response) => extractData(response)));
  }

  create(payload: DeparturePayload): Observable<Departure> {
    return this.api
      .post<ApiResponse<Departure>>('departures', payload)
      .pipe(map((response) => extractData(response)));
  }

  update(id: string, payload: Partial<DeparturePayload>): Observable<Departure> {
    return this.api
      .patch<ApiResponse<Departure>>(`departures/${encodeURIComponent(id)}`, payload)
      .pipe(map((response) => extractData(response)));
  }

  setStatus(id: string, status: DepartureStatus): Observable<Departure> {
    return this.api
      .patch<ApiResponse<Departure>>(`departures/${encodeURIComponent(id)}/status`, {
        status
      })
      .pipe(map((response) => extractData(response)));
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`departures/${encodeURIComponent(id)}`);
  }
}
