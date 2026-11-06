import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Location, LocationPayload } from '../models/location.model';
import { LocationsService } from '../services/locations.service';

@Injectable({ providedIn: 'root' })
export class LocationsStore {
  private readonly service = inject(LocationsService);

  private readonly _locations = signal<Location[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _loaded = signal(false);

  readonly locations = this._locations.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly count = computed(() => this._locations().length);

  async load(force = false): Promise<void> {
    if (this._loaded() && !force) return;

    this._loading.set(true);
    this._error.set(null);
    try {
      this._locations.set(await firstValueFrom(this.service.list()));
      this._loaded.set(true);
    } catch (error) {
      this._error.set('No se han podido cargar las ubicaciones.');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async create(payload: LocationPayload): Promise<Location> {
    const location = await firstValueFrom(this.service.create(payload));
    const wasLoaded = this._loaded();
    this._locations.update((items) => [location, ...items]);
    this._loaded.set(wasLoaded);
    this._error.set(null);
    return location;
  }

  async update(id: string, payload: Partial<LocationPayload>): Promise<Location> {
    const location = await firstValueFrom(this.service.update(id, payload));
    this.patch(location);
    return location;
  }

  async setActive(id: string, active: boolean): Promise<Location> {
    const location = await firstValueFrom(this.service.setActive(id, active));
    this.patch(location);
    return location;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.service.remove(id));
    this._locations.update((items) => items.filter((item) => item._id !== id));
    this._error.set(null);
  }

  patch(location: Location): void {
    this._locations.update((items) =>
      items.map((item) => (item._id === location._id ? location : item))
    );
    this._error.set(null);
  }

  reset(): void {
    this._locations.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._loaded.set(false);
  }
}
