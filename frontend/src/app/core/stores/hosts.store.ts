import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Host, HostPayload } from '../models/host.model';
import { HostsService } from '../services/hosts.service';

@Injectable({ providedIn: 'root' })
export class HostsStore {
  private readonly service = inject(HostsService);

  private readonly _hosts = signal<Host[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _loaded = signal(false);

  readonly hosts = this._hosts.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly count = computed(() => this._hosts().length);

  async load(force = false): Promise<void> {
    if (this._loaded() && !force) return;

    this._loading.set(true);
    this._error.set(null);
    try {
      this._hosts.set(await firstValueFrom(this.service.list()));
      this._loaded.set(true);
    } catch (error) {
      this._error.set('No se han podido cargar los anfitriones.');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async create(payload: HostPayload): Promise<Host> {
    const host = await firstValueFrom(this.service.create(payload));
    const wasLoaded = this._loaded();
    this._hosts.update((items) => [host, ...items]);
    this._loaded.set(wasLoaded);
    this._error.set(null);
    return host;
  }

  async update(id: string, payload: Partial<HostPayload>): Promise<Host> {
    const host = await firstValueFrom(this.service.update(id, payload));
    this.patch(host);
    return host;
  }

  async setActive(id: string, active: boolean): Promise<Host> {
    const host = await firstValueFrom(this.service.setActive(id, active));
    this.patch(host);
    return host;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.service.remove(id));
    this._hosts.update((items) => items.filter((item) => item._id !== id));
    this._error.set(null);
  }

  patch(host: Host): void {
    this._hosts.update((items) =>
      items.map((item) => (item._id === host._id ? host : item))
    );
    this._error.set(null);
  }

  reset(): void {
    this._hosts.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._loaded.set(false);
  }
}
