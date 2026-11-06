import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DeparturesService } from '../services/departures.service';
import {
  Departure,
  DepartureFilters,
  DeparturePayload,
  DepartureStatus
} from '../models/departure.model';

@Injectable({ providedIn: 'root' })
export class DeparturesStore {
  private readonly service = inject(DeparturesService);

  private readonly _departures = signal<Departure[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _loaded = signal(false);

  readonly departures = this._departures.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly count = computed(() => this._departures().length);

  async load(filters: DepartureFilters = {}, force = false): Promise<void> {
    if (this._loaded() && !force) return;

    this._loading.set(true);
    this._error.set(null);
    try {
      this._departures.set(await firstValueFrom(this.service.list(filters)));
      this._loaded.set(true);
    } catch (error) {
      this._error.set('No se han podido cargar las salidas.');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async create(payload: DeparturePayload): Promise<Departure> {
    const departure = await firstValueFrom(this.service.create(payload));
    const wasLoaded = this._loaded();
    this._departures.update((items) => [departure, ...items]);
    this._loaded.set(wasLoaded);
    this._error.set(null);
    return departure;
  }

  async update(id: string, payload: Partial<DeparturePayload>): Promise<Departure> {
    const departure = await firstValueFrom(this.service.update(id, payload));
    this.patch(departure);
    return departure;
  }

  async setStatus(id: string, status: DepartureStatus): Promise<Departure> {
    const departure = await firstValueFrom(this.service.setStatus(id, status));
    this.patch(departure);
    return departure;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.service.remove(id));
    this._departures.update((items) => items.filter((item) => item._id !== id));
    this._error.set(null);
  }

  patch(departure: Departure): void {
    this._departures.update((items) =>
      items.map((item) => (item._id === departure._id ? departure : item))
    );
    this._error.set(null);
  }

  reset(): void {
    this._departures.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._loaded.set(false);
  }
}
