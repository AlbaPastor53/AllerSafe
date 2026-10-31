import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { EventImage } from '../models/event-image.model';

function extractList<T>(response: ApiResponse<T[]> | null | undefined): T[] {
  const data = response?.data;
  if (!Array.isArray(data)) throw new Error('INVALID_RESPONSE');
  return data;
}

@Injectable({ providedIn: 'root' })
export class EventImagesService {
  private readonly api = inject(ApiService);

  list(eventId?: string): Observable<EventImage[]> {
    let params = new HttpParams();
    if (eventId) params = params.set('event', eventId);

    return this.api
      .get<ApiResponse<EventImage[]>>('event-images', params)
      .pipe(map((response) => extractList(response)));
  }
}
