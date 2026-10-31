import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';
import {
  AuthUser,
  LoginCredentials,
  LoginData,
  LoginResponse
} from '../models/auth.model';

const TOKEN_STORAGE_KEY = 'allersafe.auth.token';
const USER_STORAGE_KEY = 'allersafe.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  private readonly _token = signal<string | null>(this.readStoredToken());
  private readonly _user = signal<AuthUser | null>(this.readStoredUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => {
    const token = this._token();
    return token !== null && this._user() !== null && !this.isTokenExpired(token);
  });

  readonly isAdmin = computed(() => this._user()?.role === 'Admin');

  constructor() {
    if (!this.isAuthenticated()) {
      this.clearSession();
    }
  }

  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.api.post<LoginResponse>('auth/login', credentials).pipe(
      map((response) => this.extractLoginData(response)),
      tap(({ token, user }) => this.setSession(token, user)),
      map(({ user }) => user)
    );
  }

  logout(): void {
    this.clearSession();
  }

  private extractLoginData(response: LoginResponse | null | undefined): LoginData {
    const data = response?.data;

    if (!data || typeof data.token !== 'string' || !data.token || !data.user) {
      throw new Error('INVALID_RESPONSE');
    }

    return data;
  }

  private setSession(token: string, user: AuthUser): void {
    this._token.set(token);
    this._user.set(user);

    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Si el almacenamiento no está disponible, la sesión sigue en memoria.
    }
  }

  private clearSession(): void {
    this._token.set(null);
    this._user.set(null);

    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Sin almacenamiento disponible no hay nada que limpiar.
    }
  }

  private readStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private readStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as AuthUser;
      return typeof parsed?._id === 'string' && typeof parsed?.role === 'string'
        ? parsed
        : null;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return true;

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
      const exp = payload['exp'];

      if (typeof exp !== 'number') return true;

      return exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
