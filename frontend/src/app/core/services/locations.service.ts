import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Location } from '../models/location.model';

function extractList<T>(response: ApiResponse<T[]> | null | undefined): T[] {
  const data = response?.data;
  if (!Array.isArray(data)) throw new Error('INVALID_RESPONSE');
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
}
