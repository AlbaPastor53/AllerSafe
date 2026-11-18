import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category } from '../models/category.model';
import { Event, EventSort } from '../models/event.model';
import { Host, hostDisplayName } from '../models/host.model';
import { Location } from '../models/location.model';
import {
  DEFAULT_SHOP_SORT,
  SHOP_PAGE_SIZE,
  SHOP_PRICE_MAX,
  SHOP_PRICE_MIN,
  SHOP_SORT_OPTIONS,
  ShopActiveFilter,
  ShopFilters,
  ShopHomeData,
  ShopMeta,
  shopCatalogRevision
} from '../models/shop.model';
import { ShopService } from '../services/shop.service';

/**
 * Estado de la tienda pública.
 *
 * La página de la lista escribe los filtros en la URL y este store se
 * limita a recibirlos con applyFilters() y a cargar los datos:
 *
 *   - loadHome(): carruseles y opciones de la tienda en una sola petición
 *     (loadOptions() es un alias para las páginas que solo necesitan filtros).
 *   - applyFilters() / reload(): lista de experiencias.
 */
@Injectable({ providedIn: 'root' })
export class ShopStore {
  private readonly service = inject(ShopService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _filters = signal<ShopFilters>({});
  private readonly _page = signal(1);

  // Revisión del catálogo con la que se cargó cada bloque de datos.
  private _homeRevision = -1;
  private _listRevision = -1;

  private readonly _categories = signal<Category[]>([]);
  private readonly _hosts = signal<Host[]>([]);
  private readonly _locations = signal<Location[]>([]);

  private readonly _homeEvents = signal<Event[]>([]);
  private readonly _homeLoading = signal(false);
  private readonly _homeError = signal<string | null>(null);
  private readonly _homeLoaded = signal(false);

  private readonly _events = signal<Event[]>([]);
  private readonly _meta = signal<ShopMeta | null>(null);
  private readonly _listLoading = signal(false);
  private readonly _listError = signal<string | null>(null);

  private activeController: AbortController | null = null;
  private requestId = 0;

  readonly filters = this._filters.asReadonly();
  readonly page = this._page.asReadonly();

  readonly categories = this._categories.asReadonly();
  readonly hosts = this._hosts.asReadonly();
  readonly locations = this._locations.asReadonly();
  // Alias conservados por si algún consumidor los usa: comparten el estado
  // de carga de la única petición que alimenta carruseles y filtros.
  readonly optionsLoading = this._homeLoading.asReadonly();
  readonly optionsError = this._homeError.asReadonly();

  readonly homeEvents = this._homeEvents.asReadonly();
  readonly homeLoading = this._homeLoading.asReadonly();
  readonly homeError = this._homeError.asReadonly();

  readonly events = this._events.asReadonly();
  readonly meta = this._meta.asReadonly();
  readonly listLoading = this._listLoading.asReadonly();
  readonly listError = this._listError.asReadonly();

  readonly total = computed(() => this._meta()?.total ?? 0);
  readonly totalPages = computed(() => this._meta()?.totalPages ?? 0);

  readonly searchValue = computed(() => this._filters().search ?? '');

  readonly filterValues = computed<Record<string, string>>(() => ({
    category: this._filters().category ?? '',
    host: this._filters().host ?? '',
    location: this._filters().location ?? ''
  }));

  readonly priceRange = computed(() => ({
    min: this._filters().minPrice ?? SHOP_PRICE_MIN,
    max: this._filters().maxPrice ?? SHOP_PRICE_MAX
  }));

  /** Filtros activos, con su nombre legible, para los chips de la interfaz. */
  readonly activeFilters = computed<ShopActiveFilter[]>(() => {
    const filters = this._filters();
    const active: ShopActiveFilter[] = [];

    if (filters.search?.trim()) {
      active.push({
        key: 'search',
        label: 'Búsqueda',
        value: filters.search.trim()
      });
    }

    if (filters.category) {
      active.push({
        key: 'category',
        label: 'Categoría',
        value: this.categoryName(filters.category)
      });
    }

    if (filters.host) {
      active.push({
        key: 'host',
        label: 'Anfitrión',
        value: this.hostName(filters.host)
      });
    }

    if (filters.location) {
      active.push({
        key: 'location',
        label: 'Ubicación',
        value: this.locationName(filters.location)
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      active.push({
        key: 'price',
        label: 'Precio',
        value: `${filters.minPrice ?? SHOP_PRICE_MIN} € – ${
          filters.maxPrice ?? SHOP_PRICE_MAX
        } €`
      });
    }

    if (filters.sort && filters.sort !== DEFAULT_SHOP_SORT) {
      active.push({
        key: 'sort',
        label: 'Orden',
        value: this.sortLabel(filters.sort)
      });
    }

    return active;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.activeController?.abort();
    });
  }

  /** Carga los eventos destacados y las opciones de los carruseles. */
  async loadHome(force = false): Promise<void> {
    const revision = shopCatalogRevision();
    if (this._homeLoaded() && !force && this._homeRevision === revision) return;

    this._homeLoading.set(true);
    this._homeError.set(null);

    try {
      const data = await firstValueFrom(this.service.getHome());
      this.applyHomeData(data, revision);
    } catch {
      this._homeError.set('No se han podido cargar las experiencias.');
    } finally {
      this._homeLoading.set(false);
    }
  }

  /** Carga las opciones de los filtros (categorías, anfitriones, ubicaciones). */
  async loadOptions(force = false): Promise<void> {
    await this.loadHome(force);
  }

  reloadHome(): void {
    void this.loadHome(true);
  }

  reloadOptions(): void {
    this.reloadHome();
  }

  /**
   * Sustituye los filtros activos y recarga la lista.
   * Si los filtros no cambian, no hace nada (salvo que force sea true).
   */
  applyFilters(filters: ShopFilters, page = 1, force = false): void {
    const nextPage = this.normalizePage(page);
    const revisionChanged = this._listRevision !== shopCatalogRevision();

    if (
      !force &&
      !revisionChanged &&
      this.sameFilters(filters, this._filters()) &&
      nextPage === this._page()
    ) {
      return;
    }

    this._filters.set(filters);
    this._page.set(nextPage);
    this.load();
  }

  /** Vuelve a lanzar la última consulta (por ejemplo, tras un error). */
  reload(): void {
    this.load();
  }

  private applyHomeData(data: ShopHomeData, revision: number): void {
    this._homeEvents.set(data.events);
    this._categories.set(data.categories);
    this._hosts.set(data.hosts);
    this._locations.set(data.locations);
    this._homeRevision = revision;
    this._homeLoaded.set(true);
    this._homeError.set(null);
  }

  private categoryName(id: string): string {
    return this._categories().find((category) => category._id === id)?.name ?? id;
  }

  private hostName(id: string): string {
    const host = this._hosts().find((item) => item._id === id);
    return host ? hostDisplayName(host) : id;
  }

  private locationName(id: string): string {
    return this._locations().find((location) => location._id === id)?.name ?? id;
  }

  private sortLabel(sort: EventSort): string {
    return (
      SHOP_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? sort
    );
  }

  private sameFilters(a: ShopFilters, b: ShopFilters): boolean {
    return (
      (a.search ?? '') === (b.search ?? '') &&
      (a.category ?? '') === (b.category ?? '') &&
      (a.host ?? '') === (b.host ?? '') &&
      (a.location ?? '') === (b.location ?? '') &&
      a.minPrice === b.minPrice &&
      a.maxPrice === b.maxPrice &&
      (a.sort ?? DEFAULT_SHOP_SORT) === (b.sort ?? DEFAULT_SHOP_SORT)
    );
  }

  private normalizePage(page: number): number {
    return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  }

  /** Pide la lista con los filtros actuales, cancelando la petición previa. */
  private load(): void {
    this.activeController?.abort();

    const controller = new AbortController();
    this.activeController = controller;
    const requestId = ++this.requestId;

    const filters = this._filters();
    const page = this._page();
    const revision = shopCatalogRevision();

    this._listLoading.set(true);
    this._listError.set(null);

    this.service
      .getEvents(filters, {
        limit: SHOP_PAGE_SIZE,
        offset: (page - 1) * SHOP_PAGE_SIZE,
        signal: controller.signal
      })
      .subscribe({
        next: (result) => {
          if (requestId !== this.requestId || controller.signal.aborted) {
            return;
          }

          this._events.set(result.items);
          this._meta.set(result.meta);
          this._listRevision = revision;
          this._listLoading.set(false);

          if (this.activeController === controller) {
            this.activeController = null;
          }
        },
        error: () => {
          if (requestId !== this.requestId || controller.signal.aborted) {
            return;
          }

          this._listError.set('No se han podido cargar las experiencias.');
          this._events.set([]);
          this._meta.set(null);
          this._listLoading.set(false);

          if (this.activeController === controller) {
            this.activeController = null;
          }
        }
      });
  }
}
