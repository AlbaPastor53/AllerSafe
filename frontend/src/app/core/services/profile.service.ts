import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Profile, ProfilePayload } from '../models/profile.model';

function extractData<T>(response: ApiResponse<T> | null | undefined): T {
  const data = response?.data;
  if (data === undefined || data === null) throw new Error('INVALID_RESPONSE');
  return data;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  get(): Observable<Profile> {
    return this.api
      .get<ApiResponse<Profile>>('profile')
      .pipe(map((response) => extractData(response)));
  }

  update(payload: ProfilePayload): Observable<Profile> {
    return this.api
      .patch<ApiResponse<Profile>>('profile', payload)
      .pipe(map((response) => extractData(response)));
  }
}
