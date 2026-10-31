import { Injectable, computed, effect, signal } from '@angular/core';
import { Event } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventsStore {
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

  setError(value: string | null): void {
    this._error.set(value);
  }

  setEvents(list: Event[]): void {
    this._events.set(list);
    this._loaded.set(true);
    this._stale.set(false);
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
