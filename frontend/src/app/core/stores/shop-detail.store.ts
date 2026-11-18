import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  catchError,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';
import { Departure } from '../models/departure.model';
import { Event } from '../models/event.model';
import { shopCatalogRevision } from '../models/shop.model';
import { DeparturesService } from '../services/departures.service';
import { ShopService } from '../services/shop.service';

interface ShopDetailResult {
  event: Event;
  departures: Departure[];
}

interface ShopDetailQuery {
  slug: string;
  revision: number;
}

@Injectable({ providedIn: 'root' })
export class ShopDetailStore {
  private readonly shopService = inject(ShopService);
  private readonly departuresService = inject(DeparturesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly query = new Subject<ShopDetailQuery>();

  private readonly _event = signal<Event | null>(null);
  private readonly _departures = signal<Departure[]>([]);
  private readonly _selectedDeparture = signal<Departure | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _notFound = signal(false);

  readonly event = this._event.asReadonly();
  readonly departures = this._departures.asReadonly();
  readonly selectedDeparture = this._selectedDeparture.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly notFound = this._notFound.asReadonly();
  readonly hasDepartures = computed(() => this._departures().length > 0);

  constructor() {
    this.query
      .pipe(
        distinctUntilChanged(
          (a, b) => a.slug === b.slug && a.revision === b.revision
        ),
        tap(() => {
          this._loading.set(true);
          this._error.set(null);
          this._notFound.set(false);
          this._event.set(null);
          this._departures.set([]);
          this._selectedDeparture.set(null);
        }),
        switchMap(({ slug }) =>
          this.shopService.getEventBySlug(slug).pipe(
            switchMap((event) =>
              this.departuresService.list({ event: event._id }).pipe(
                map((departures) => ({ event, departures })),
                catchError(() => of({ event, departures: [] }))
              )
            ),
            catchError((error: unknown) => {
              const status = (error as { status?: number } | null)?.status;
              this._notFound.set(status === 404);
              this._error.set(
                status === 404 ? null : 'No se ha podido cargar la experiencia.'
              );
              return of(null);
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result: ShopDetailResult | null) => {
        if (result) {
          this._event.set(result.event);
          this._departures.set(result.departures);
        }

        this._loading.set(false);
      });
  }

  load(slug: string): void {
    const trimmed = slug.trim();
    if (!trimmed) {
      this.clear();
      return;
    }

    this.query.next({ slug: trimmed, revision: shopCatalogRevision() });
  }

  selectDeparture(departure: Departure | null): void {
    this._selectedDeparture.set(departure);
  }

  clear(): void {
    this._event.set(null);
    this._departures.set([]);
    this._selectedDeparture.set(null);
    this._loading.set(false);
    this._error.set(null);
    this._notFound.set(false);
  }
}
