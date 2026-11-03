import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Profile } from '../models/profile.model';
import {
  UpdateUserPayload,
  User,
  UserPayload,
  UserStatus
} from '../models/user.model';

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
export class UsersService {
  private readonly api = inject(ApiService);

  list(): Observable<User[]> {
    return this.api
      .get<ApiResponse<User[]>>('users')
      .pipe(map((response) => extractList(response)));
  }

  getById(id: string): Observable<User> {
    return this.api
      .get<ApiResponse<User>>(`users/${encodeURIComponent(id)}`)
      .pipe(map((response) => extractData(response)));
  }

  getProfile(id: string): Observable<Profile> {
    return this.api
      .get<ApiResponse<Profile>>(`users/${encodeURIComponent(id)}/profile`)
      .pipe(map((response) => extractData(response)));
  }

  create(payload: UserPayload): Observable<User> {
    return this.api
      .post<ApiResponse<User>>('users', payload)
      .pipe(map((response) => extractData(response)));
  }

  update(id: string, payload: UpdateUserPayload): Observable<User> {
    return this.api
      .patch<ApiResponse<User>>(`users/${encodeURIComponent(id)}`, payload)
      .pipe(map((response) => extractData(response)));
  }

  setStatus(id: string, status: UserStatus): Observable<User> {
    return this.api
      .patch<ApiResponse<User>>(`users/${encodeURIComponent(id)}/status`, { status })
      .pipe(map((response) => extractData(response)));
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`users/${encodeURIComponent(id)}`);
  }
}
