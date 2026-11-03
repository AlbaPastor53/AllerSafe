import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Host, HostPayload } from '../models/host.model';

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
export class HostsService {
  private readonly api = inject(ApiService);

  list(): Observable<Host[]> {
    return this.api
      .get<ApiResponse<Host[]>>('hosts')
      .pipe(map((response) => extractList(response)));
  }

  create(payload: HostPayload): Observable<Host> {
    return this.api
      .post<ApiResponse<Host>>('hosts', payload)
      .pipe(map((response) => extractData(response)));
  }

  update(id: string, payload: Partial<HostPayload>): Observable<Host> {
    return this.api
      .patch<ApiResponse<Host>>(`hosts/${encodeURIComponent(id)}`, payload)
      .pipe(map((response) => extractData(response)));
  }

  setActive(id: string, active: boolean): Observable<Host> {
    return this.api
      .patch<ApiResponse<Host>>(`hosts/${encodeURIComponent(id)}/status`, {
        status: active ? 'active' : 'inactive'
      })
      .pipe(map((response) => extractData(response)));
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`hosts/${encodeURIComponent(id)}`);
  }
}
