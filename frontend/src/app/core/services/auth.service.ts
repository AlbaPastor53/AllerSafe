import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Observable,
  catchError,
  firstValueFrom,
  map,
  of,
  tap,
  throwError
} from 'rxjs';
import { ApiService } from './api.service';
import {
  AuthMeResponse,
  AuthUser,
  LoginCredentials,
  LoginData,
  LoginResponse
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  private readonly _user = signal<AuthUser | null>(null);
  private initialized = false;
  private initialization: Promise<void> | null = null;

  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => this._user() !== null);

  readonly isAdmin = computed(() => this._user()?.role === 'Admin');

  constructor() {
    try {
      localStorage.removeItem('allersafe.auth.token');
      localStorage.removeItem('allersafe.auth.user');
    } catch (error) {
      console.warn(
        'No se pudo limpiar la sesión anterior del almacenamiento local.',
        error
      );
    }
  }

  initialize(): Promise<void> {
    if (this.initialized) return Promise.resolve();
    if (this.initialization) return this.initialization;

    this.initialization = firstValueFrom(
      this.api.get<AuthMeResponse>('auth/me').pipe(
        map((response) => {
          if (!response?.data?.user) {
            throw new Error('INVALID_RESPONSE');
          }
          this._user.set(response.data.user);
        }),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this._user.set(null);
            return of(undefined);
          }
          return throwError(() => error);
        })
      )
    )
      .then(() => {
        this.initialized = true;
      })
      .catch((error: unknown) => {
        this.initialization = null;
        throw error;
      });

    return this.initialization;
  }

  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.api.post<LoginResponse>('auth/login', credentials).pipe(
      map((response) => this.extractLoginData(response)),
      tap(({ user }) => this.setSession(user)),
      map(({ user }) => user)
    );
  }

  logout(): Observable<void> {
    return this.api.post<void>('auth/logout', {}).pipe(
      tap(() => this.clearSession()),
      catchError((error: unknown) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  private extractLoginData(response: LoginResponse | null | undefined): LoginData {
    const data = response?.data;

    if (!data?.user) {
      throw new Error('INVALID_RESPONSE');
    }

    return data;
  }

  clearSession(): void {
    this._user.set(null);
    this.initialized = true;
  }

  private setSession(user: AuthUser): void {
    this._user.set(user);
    this.initialized = true;
  }
}
