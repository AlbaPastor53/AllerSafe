import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Event, EventPayload } from '../models/event.model';
import { EventsService } from '../services/events.service';

@Injectable({ providedIn: 'root' })
export class EventsStore {
  private readonly service = inject(EventsService);

  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _events = signal<Event[]>([]);
  private readonly _selectedEvent = signal<Event | null>(null);
  private readonly _loaded = signal(false);
  private readonly _stale = signal(false);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly events = this._events.asReadonly();
  readonly selectedEvent = this._selectedEvent.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly stale = this._stale.asReadonly();

  readonly isEmpty = computed(
    () => !this._loading() && !this._error() && this._events().length === 0
  );
  readonly count = computed(() => this._events().length);

  private readonly syncSelected = effect(() => {
    const events = this._events();
    const selected = this._selectedEvent();
    if (!selected || events.length === 0) {
      return;
    }
    const fresh = events.find((event) => event._id === selected._id);
    if (fresh && fresh !== selected) {
      this._selectedEvent.set(fresh);
    }
  });

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  async load(force = false): Promise<void> {
    if (this._loaded() && !this._stale() && !force) return;

    this._loading.set(true);
    this._error.set(null);
    try {
      this.setEvents(await firstValueFrom(this.service.list()));
    } catch (error) {
      this._error.set('No se han podido cargar los eventos.');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async getById(id: string): Promise<Event> {
    const event = await firstValueFrom(this.service.getById(id));
    this.setSelectedEvent(event);
    this.patchEvent(event);
    return event;
  }

  async create(payload: EventPayload): Promise<Event> {
    const event = await firstValueFrom(this.service.create(payload));
    this._loaded.set(false);
    this.markStale();
    this._error.set(null);
    return event;
  }

  async update(id: string, payload: Partial<EventPayload>): Promise<Event> {
    const event = await firstValueFrom(this.service.update(id, payload));
    this.patchEvent(event);
    return event;
  }

  async setActive(id: string, active: boolean): Promise<Event> {
    const event = await firstValueFrom(this.service.setActive(id, active));
    this.patchEvent(event);
    return event;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.service.remove(id));
    this._events.update((items) => items.filter((item) => item._id !== id));
    if (this._selectedEvent()?._id === id) this._selectedEvent.set(null);
    this.markStale();
    this._error.set(null);
  }

  setError(value: string | null): void {
    this._error.set(value);
  }

  setEvents(list: Event[]): void {
    this._events.set(list);
    this._loaded.set(true);
    this._stale.set(false);
    this._error.set(null);
  }

  setSelectedEvent(event: Event | null): void {
    this._selectedEvent.set(event);
  }

  patchEvent(updated: Event): void {
    this._events.update((list) =>
      list.map((event) => (event._id === updated._id ? updated : event))
    );
    if (this._selectedEvent()?._id === updated._id) {
      this._selectedEvent.set(updated);
    }
    this._error.set(null);
  }

  markStale(): void {
    this._stale.set(true);
  }

  reset(): void {
    this._loading.set(false);
    this._error.set(null);
    this._events.set([]);
    this._selectedEvent.set(null);
    this._loaded.set(false);
    this._stale.set(false);
  }
}
