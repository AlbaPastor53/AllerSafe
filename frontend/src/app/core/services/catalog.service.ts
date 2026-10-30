import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Host, Category, Location } from '../models/courses.model';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

function extractList<T>(response: ApiResponse<T[]> | null | undefined): T[] {
  const data = response?.data;
  if (!Array.isArray(data)) throw new Error('INVALID_RESPONSE');
  return data;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly api = inject(ApiService);

  listHosts(): Observable<Host[]> {
    return this.api
      .get<ApiResponse<Host[]>>('hosts')
      .pipe(map((r) => extractList(r)));
  }

  listCategories(): Observable<Category[]> {
    return this.api
      .get<ApiResponse<Category[]>>('categories')
      .pipe(map((r) => extractList(r)));
  }

  listLocations(): Observable<Location[]> {
    return this.api
      .get<ApiResponse<Location[]>>('locations')
      .pipe(map((r) => extractList(r)));
  }
}
