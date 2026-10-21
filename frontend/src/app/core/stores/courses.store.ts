import { Injectable, computed, effect, signal } from '@angular/core';
import { Courses } from '../models/courses.model';

@Injectable({ providedIn: 'root' })
export class CoursesStore {
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _routes = signal<Courses[]>([]);
  private readonly _selectedRoute = signal<Courses | null>(null);
  private readonly _loaded = signal(false);
  private readonly _stale = signal(false);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly routes = this._routes.asReadonly();
  readonly selectedRoute = this._selectedRoute.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly stale = this._stale.asReadonly();

  readonly isEmpty = computed(
    () => !this._loading() && !this._error() && this._routes().length === 0
  );
  readonly count = computed(() => this._routes().length);

  private readonly syncSelected = effect(() => {
    const routes = this._routes();
    const selected = this._selectedRoute();
    if (!selected || routes.length === 0) {
      return;
    }
    const fresh = routes.find((route) => route._id === selected._id);
    if (fresh && fresh !== selected) {
      this._selectedRoute.set(fresh);
    }
  });

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  setError(value: string | null): void {
    this._error.set(value);
  }

  setRoutes(list: Courses[]): void {
    this._routes.set(list);
    this._loaded.set(true);
    this._stale.set(false);
  }

  setSelectedRoute(route: Courses | null): void {
    this._selectedRoute.set(route);
  }

  patchRoute(updated: Courses): void {
    this._routes.update((list) =>
      list.map((route) => (route._id === updated._id ? updated : route))
    );
    if (this._selectedRoute()?._id === updated._id) {
      this._selectedRoute.set(updated);
    }
  }

  markStale(): void {
    this._stale.set(true);
  }

  reset(): void {
    this._loading.set(false);
    this._error.set(null);
    this._routes.set([]);
    this._selectedRoute.set(null);
    this._loaded.set(false);
    this._stale.set(false);
  }
}
