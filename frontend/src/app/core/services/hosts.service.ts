import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Host } from '../models/host.model';

function extractList<T>(response: ApiResponse<T[]> | null | undefined): T[] {
  const data = response?.data;
  if (!Array.isArray(data)) throw new Error('INVALID_RESPONSE');
  return data;
}

@Injectable({ providedIn: 'root' })
export class HostsService {
  private readonly api = inject(ApiService);

  list(): Observable<Host[]> {
    return this.api
      .get<ApiResponse<Host[]>>('hosts')
      .pipe(map((response) => extractList(response)));
  }
}
