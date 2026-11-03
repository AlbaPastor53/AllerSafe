import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
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

  private readonly _profile = signal<Profile | null>(null);
  readonly profile = this._profile.asReadonly();

  get(): Observable<Profile> {
    return this.api
      .get<ApiResponse<Profile>>('profile')
      .pipe(
        map((response) => extractData(response)),
        tap((profile) => this._profile.set(profile))
      );
  }

  update(payload: ProfilePayload): Observable<Profile> {
    return this.api
      .patch<ApiResponse<Profile>>('profile', payload)
      .pipe(
        map((response) => extractData(response)),
        tap((profile) => this._profile.set(profile))
      );
  }

  clear(): void {
    this._profile.set(null);
  }
}
