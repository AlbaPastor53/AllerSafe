import { Injectable, computed, signal } from '@angular/core';
import { AuthUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _user = signal<AuthUser | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');

  // app.ts guarda aquí la promesa de `auth/me` para que los guards la esperen.
  ready: Promise<void> = Promise.resolve();

  setUser(user: AuthUser | null): void {
    this._user.set(user);
  }

  clear(): void {
    this._user.set(null);
  }
}
