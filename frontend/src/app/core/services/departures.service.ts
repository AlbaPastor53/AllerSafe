import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Departure, DepartureFilters } from '../models/departure.model';

function extractList<T>(response: ApiResponse<T[]> | null | undefined): T[] {
  const data = response?.data;
  if (!Array.isArray(data)) throw new Error('INVALID_RESPONSE');
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
}
