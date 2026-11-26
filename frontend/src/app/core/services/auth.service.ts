import { Injectable, inject } from '@angular/core';
import {
  Observable,
  Subscription,
  catchError,
  map,
  switchMap,
  takeWhile,
  tap,
  throwError,
  timer
} from 'rxjs';
import { ApiService } from './api.service';
import { AuthStore } from '../stores/auth.store';
import { CategoriesStore } from '../stores/categories.store';
import { DeparturesStore } from '../stores/departures.store';
import { EventImagesStore } from '../stores/event-images.store';
import { EventsStore } from '../stores/events.store';
import { HostsStore } from '../stores/hosts.store';
import { LocationsStore } from '../stores/locations.store';
import { UsersStore } from '../stores/users.store';
import {
  AuthUser,
  LoginCredentials,
  LoginData,
  LoginResponse
} from '../models/auth.model';

// El access dura 1 h; se renueva 10 min antes para no perder la ventana.
const ADMIN_RENEW_INTERVAL_MS = 50 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly authStore = inject(AuthStore);
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly departuresStore = inject(DeparturesStore);
  private readonly eventImagesStore = inject(EventImagesStore);
  private readonly eventsStore = inject(EventsStore);
  private readonly hostsStore = inject(HostsStore);
  private readonly locationsStore = inject(LocationsStore);
  private readonly usersStore = inject(UsersStore);
  private renewSubscription?: Subscription;
  private renewalUserId?: string;

  readonly user = this.authStore.user;

  readonly isAuthenticated = this.authStore.isAuthenticated;

  readonly isAdmin = this.authStore.isAdmin;

  initialize(): Promise<void> {
    return this.authStore.ready;
  }

  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.api.post<LoginResponse>('auth/login', credentials).pipe(
      map((response) => this.extractLoginData(response)),
      tap(({ user }) => this.setSession(user)),
      map(({ user }) => user)
    );
  }

  refresh(): Observable<AuthUser> {
    return this.api.post<LoginResponse>('auth/refresh', {}).pipe(
      map((response) => this.extractLoginData(response).user),
      tap((user) => this.setSession(user))
    );
  }

  // El admin no tiene refresh token: /auth/renew solo rota la cookie del access.
  renew(): Observable<void> {
    return this.api.post<void>('auth/renew', {});
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
    this.renewSubscription?.unsubscribe();
    this.renewSubscription = undefined;
    this.renewalUserId = undefined;
    this.authStore.clear();
    this.categoriesStore.reset();
    this.departuresStore.reset();
    this.eventImagesStore.reset();
    this.eventsStore.reset();
    this.hostsStore.reset();
    this.locationsStore.reset();
    this.usersStore.reset();
  }

  private setSession(user: AuthUser): void {
    this.authStore.setUser(user);
    this.syncRenewalTimer();
  }

  // El Admin no tiene refresh token: se le renueva el access antes de que caduque.
  // `me()` se llama en cada navegación, así que el temporizador no se reinicia
  // mientras siga siendo la misma sesión.
  syncRenewalTimer(): void {
    const user = this.authStore.user();

    if (this.renewSubscription && this.renewalUserId === user?._id) {
      return;
    }

    this.renewSubscription?.unsubscribe();
    this.renewSubscription = undefined;
    this.renewalUserId = undefined;

    if (!user || user.role !== 'Admin') {
      return;
    }

    this.renewalUserId = user._id;
    this.renewSubscription = timer(ADMIN_RENEW_INTERVAL_MS, ADMIN_RENEW_INTERVAL_MS)
      .pipe(
        takeWhile(
          () => this.authStore.isAuthenticated() && this.authStore.isAdmin()
        ),
        switchMap(() => this.renew())
      )
      // El interceptor gestiona cualquier 401 de /auth/renew (sesión -> /login).
      .subscribe({ error: () => undefined });
  }
}
