import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
 UpdateUserPayload,
  User,
  UserPayload,
  UserStatus
} from '../models/user.model';
import { UsersService } from '../services/users.service';

@Injectable({ providedIn: 'root' })
export class UsersStore {
  private readonly service = inject(UsersService);

  private readonly _users = signal<User[]>([]);
  private readonly _selectedUser = signal<User | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _loaded = signal(false);

  readonly users = this._users.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly count = computed(() => this._users().length);

  async load(force = false): Promise<void> {
    if (this._loaded() && !force) return;

    this._loading.set(true);
    this._error.set(null);
    try {
      this._users.set(await firstValueFrom(this.service.list()));
      this._loaded.set(true);
    } catch (error) {
      this._error.set('No se han podido cargar los usuarios.');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async getById(id: string): Promise<User> {
    const user = await firstValueFrom(this.service.getById(id));
    this._selectedUser.set(user);
    this.patch(user);
    return user;
  }

  clearSelection(): void {
    this._selectedUser.set(null);
  }

  async create(payload: UserPayload): Promise<User> {
    const user = await firstValueFrom(this.service.create(payload));
    const wasLoaded = this._loaded();
    this._users.update((items) => [user, ...items]);
    this._loaded.set(wasLoaded);
    this._error.set(null);
    return user;
  }

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const user = await firstValueFrom(this.service.update(id, payload));
    this.patch(user);
    return user;
  }

  async setStatus(id: string, status: UserStatus): Promise<User> {
    const user = await firstValueFrom(this.service.setStatus(id, status));
    this.patch(user);
    return user;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.service.remove(id));
    this._users.update((items) => items.filter((item) => item._id !== id));
    if (this._selectedUser()?._id === id) this._selectedUser.set(null);
    this._error.set(null);
  }

  patch(user: User): void {
    this._users.update((items) => {
      const exists = items.some((item) => item._id === user._id);
      return exists
        ? items.map((item) => (item._id === user._id ? user : item))
        : items;
    });
    if (this._selectedUser()?._id === user._id) this._selectedUser.set(user);
    this._error.set(null);
  }

  reset(): void {
    this._users.set([]);
    this._selectedUser.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._loaded.set(false);
  }
}
