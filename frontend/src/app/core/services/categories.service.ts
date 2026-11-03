import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Category, CategoryPayload } from '../models/category.model';

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
export class CategoriesService {
  private readonly api = inject(ApiService);

  list(): Observable<Category[]> {
    return this.api
      .get<ApiResponse<Category[]>>('categories')
      .pipe(map((response) => extractList(response)));
  }

  create(payload: CategoryPayload): Observable<Category> {
    return this.api
      .post<ApiResponse<Category>>('categories', payload)
      .pipe(map((response) => extractData(response)));
  }

  update(id: string, payload: Partial<CategoryPayload>): Observable<Category> {
    return this.api
      .patch<ApiResponse<Category>>(`categories/${encodeURIComponent(id)}`, payload)
      .pipe(map((response) => extractData(response)));
  }

  setActive(id: string, active: boolean): Observable<Category> {
    return this.api
      .patch<ApiResponse<Category>>(`categories/${encodeURIComponent(id)}/status`, {
        status: active ? 'active' : 'inactive'
      })
      .pipe(map((response) => extractData(response)));
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`categories/${encodeURIComponent(id)}`);
  }
}
