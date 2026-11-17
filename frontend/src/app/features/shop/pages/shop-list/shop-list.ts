import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { hostDisplayName } from '../../../../core/models/host.model';
import {
  DEFAULT_SHOP_SORT,
  SHOP_PAGE_SIZE,
  SHOP_PRICE_MAX,
  SHOP_PRICE_MIN,
  SHOP_PRICE_STEP,
  ShopFilterKey,
  ShopFilters
} from '../../../../core/models/shop.model';
import { ShopStore } from '../../../../core/stores/shop.store';
import { FilterField } from '../../../../shared/components/filters/filters';
import { List } from '../../../../shared/components/list/list';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { ActiveFilters } from '../../components/active-filters/active-filters';
import { ExperienceCard } from '../../components/experience-card/experience-card';
import { ShopFiltersBar } from '../../components/shop-filters-bar/shop-filters-bar';
import { ShopPriceRange } from '../../components/price-range-slider/price-range-slider';

/**
 * Lista de experiencias.
 *
 * Flujo sencillo con la URL como única fuente de verdad:
 *
 *   1. El usuario cambia búsqueda, filtros, precio o página → updateUrl()
 *      escribe los parámetros en la URL (sin recargar la página).
 *   2. La suscripción del constructor detecta el cambio de URL (por nosotros
 *      o por los botones back/forward del navegador) y aplica los filtros
 *      al store, que carga la lista.
 *
 * No hay doble sincronización: la interfaz solo escribe la URL y la
 * suscripción es la única que lee.
 */
@Component({
  selector: 'app-shop-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ShopFiltersBar,
    ActiveFilters,
    List,
    Pagination,
    ExperienceCard
  ],
  template: `
    <section class="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header class="space-y-1">
        <p class="text-sm font-semibold uppercase tracking-wider text-brand">
          Tienda
        </p>

        <h1 class="text-3xl font-semibold sm:text-4xl">Experiencias</h1>

        <p class="max-w-2xl text-sm leading-relaxed text-[#A9B1A6]">
          Resultados paginados de cuatro en cuatro. Combina la búsqueda, los
          filtros y el rango de precio; el estado se conserva en la URL.
        </p>
      </header>

      <app-shop-filters-bar
        [searchValue]="store.searchValue()"
        [fields]="filterFields()"
        [values]="store.filterValues()"
        [minPrice]="store.priceRange().min"
        [maxPrice]="store.priceRange().max"
        [priceMin]="SHOP_PRICE_MIN"
        [priceMax]="SHOP_PRICE_MAX"
        [priceStep]="SHOP_PRICE_STEP"
        (searchChange)="onSearch($event)"
        (filterChange)="onFilter($event)"
        (priceChange)="onPrice($event)"
        (clear)="clearAll()"
      />

      <app-active-filters
        [filters]="store.activeFilters()"
        (remove)="removeFilter($event)"
        (clear)="clearAll()"
      />

      <div
        class="flex flex-wrap items-center justify-between gap-3 text-sm text-[#A9B1A6]"
      >
        <span>
          @if (store.listLoading()) {
            Cargando experiencias…
          } @else {
            {{ store.total() }} experiencias
          }
        </span>

        <a
          routerLink="/shop"
          class="font-medium text-brand transition-colors hover:text-[#D6B66E]"
        >
          Volver a la tienda
        </a>
      </div>

      <app-list
        [items]="store.events()"
        [loading]="store.listLoading()"
        [error]="store.listError()"
        emptyTitle="No hay experiencias con estos filtros"
        emptyMessage="Prueba a cambiar la búsqueda o a limpiar los filtros."
        [skeletonCount]="SHOP_PAGE_SIZE"
        layoutClass="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        (retry)="reload()"
      >
        @for (event of store.events(); track event._id) {
          <app-experience-card [event]="event" />
        }
      </app-list>

      <app-pagination
        [page]="store.page()"
        [totalPages]="store.totalPages()"
        (pageChange)="goToPage($event)"
      />
    </section>
  `
})
export class ShopList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly store = inject(ShopStore);

  protected readonly SHOP_PAGE_SIZE = SHOP_PAGE_SIZE;
  protected readonly SHOP_PRICE_MIN = SHOP_PRICE_MIN;
  protected readonly SHOP_PRICE_MAX = SHOP_PRICE_MAX;
  protected readonly SHOP_PRICE_STEP = SHOP_PRICE_STEP;

  protected readonly filterFields = computed<FilterField[]>(() => [
    {
      key: 'category',
      label: 'Categoría',
      options: this.store
        .categories()
        .map((category) => ({ value: category._id, label: category.name }))
    },
    {
      key: 'host',
      label: 'Anfitrión',
      options: this.store
        .hosts()
        .map((host) => ({ value: host._id, label: hostDisplayName(host) }))
    },
    {
      key: 'location',
      label: 'Ubicación',
      options: this.store
        .locations()
        .map((location) => ({ value: location._id, label: location.name }))
    }
  ]);

  constructor() {
    // Único punto de lectura: cuando cambia la URL se aplican sus filtros.
    // El debounce evita lanzar una petición por cada tecla de la búsqueda.
    this.route.queryParamMap
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((params) => this.applyParams(params));
  }

  ngOnInit(): void {
    // Primera carga inmediata con los parámetros que traiga la URL
    // (por ejemplo, al llegar desde la tienda con ?category=ID).
    this.applyParams(this.route.snapshot.queryParamMap, true);
    void this.store.loadOptions();
  }

  // ---- Eventos de la interfaz: solo escriben la URL ----

  protected onSearch(value: string): void {
    this.updateUrl({ search: value.trim() || undefined });
  }

  protected onFilter(values: Record<string, string>): void {
    this.updateUrl({
      category: values['category'] || undefined,
      host: values['host'] || undefined,
      location: values['location'] || undefined
    });
  }

  protected onPrice(range: ShopPriceRange): void {
    this.updateUrl({
      minPrice: range.min > SHOP_PRICE_MIN ? range.min : undefined,
      maxPrice: range.max < SHOP_PRICE_MAX ? range.max : undefined
    });
  }

  protected removeFilter(key: ShopFilterKey): void {
    switch (key) {
      case 'search':
        this.updateUrl({ search: undefined });
        break;
      case 'category':
        this.updateUrl({ category: undefined });
        break;
      case 'host':
        this.updateUrl({ host: undefined });
        break;
      case 'location':
        this.updateUrl({ location: undefined });
        break;
      case 'price':
        this.updateUrl({ minPrice: undefined, maxPrice: undefined });
        break;
    }
  }

  protected clearAll(): void {
    // Navegar sin query params limpia la URL y, con ella, los filtros.
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  protected goToPage(page: number): void {
    this.updateUrl({}, page);
  }

  protected reload(): void {
    this.store.reload();
  }

  // ---- Helpers privados ----

  /** Aplica al store los filtros que lleva la URL. */
  private applyParams(params: ParamMap, force = false): void {
    const { filters, page } = readUrlState(params);
    this.store.applyFilters(filters, page, force);
  }

  /**
   * Escribe en la URL los filtros actuales más los cambios indicados.
   * Parte de la URL (no del store) para no perder cambios anteriores
   * que todavía no se hayan aplicado. Cambiar un filtro reinicia la página.
   */
  private updateUrl(changes: Partial<ShopFilters>, page = 1): void {
    const { filters } = readUrlState(this.route.snapshot.queryParamMap);
    const next: ShopFilters = { ...filters, ...changes };
    const queryParams: Record<string, string | number> = {};

    if (next.search) queryParams['search'] = next.search;
    if (next.category) queryParams['category'] = next.category;
    if (next.host) queryParams['host'] = next.host;
    if (next.location) queryParams['location'] = next.location;
    if (next.minPrice !== undefined) queryParams['minPrice'] = next.minPrice;
    if (next.maxPrice !== undefined) queryParams['maxPrice'] = next.maxPrice;
    if (page > 1) queryParams['page'] = page;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }
}

/**
 * Lee los filtros y la página de los parámetros de la URL.
 * Los valores ausentes o no válidos se tratan como "sin filtro".
 */
function readUrlState(params: ParamMap): {
  filters: ShopFilters;
  page: number;
} {
  return {
    filters: {
      search: params.get('search')?.trim() || undefined,
      category: params.get('category') || undefined,
      host: params.get('host') || undefined,
      location: params.get('location') || undefined,
      minPrice: readPositiveNumber(params.get('minPrice')) ?? undefined,
      maxPrice: readPositiveNumber(params.get('maxPrice')) ?? undefined,
      // La URL no guarda el orden; siempre se pide el orden por defecto.
      sort: DEFAULT_SHOP_SORT
    },
    page: readPositiveNumber(params.get('page')) ?? 1
  };
}

/** Convierte un parámetro en número positivo; null si no es válido. */
function readPositiveNumber(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
