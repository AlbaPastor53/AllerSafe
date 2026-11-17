import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { hostDisplayName } from '../../../../core/models/host.model';
import { ShopStore } from '../../../../core/stores/shop.store';
import { EventCarousel } from '../../components/event-carousel/event-carousel';
import {
  FilterCarousel,
  FilterCarouselItem
} from '../../components/filter-carousel/filter-carousel';

@Component({
  selector: 'app-shop',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EventCarousel, FilterCarousel],
  template: `
    <section class="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
      <app-event-carousel
        [events]="store.homeEvents()"
        [loading]="store.homeLoading()"
        [error]="store.homeError()"
        (retry)="reloadHome()"
      />

      <div class="space-y-4">
        <header class="space-y-3">
          <p class="text-sm font-semibold uppercase tracking-wider text-brand">
            Tienda
          </p>

          <h1 class="text-3xl font-semibold sm:text-4xl">
            Descubre experiencias
          </h1>

          <p class="max-w-2xl text-sm leading-relaxed text-[#A9B1A6]">
            Explora las próximas clases y talleres. Elige una categoría,
            ubicación o anfitrión para ver los resultados.
          </p>
        </header>

        <div
          class="flex flex-wrap items-center justify-between gap-3 text-sm text-[#A9B1A6]"
        >
          <span>
            @if (store.homeLoading()) {
              Cargando experiencias…
            } @else {
              {{ store.homeEvents().length }} experiencias
            }
          </span>

          <a
            routerLink="/shop-list"
            class="font-medium text-brand transition-colors hover:text-[#D6B66E]"
          >
            Ver todas las experiencias
          </a>
        </div>
      </div>

      <app-filter-carousel
        title="Categorías"
        subtitle="Explora las experiencias según su temática."
        [items]="categoryItems()"
        [loading]="store.homeLoading()"
        [error]="store.homeError()"
        emptyTitle="Sin categorías disponibles"
        emptyMessage="Todavía no hay categorías activas."
        (select)="goToList('category', $event)"
        (retry)="reloadHome()"
      />

      <app-filter-carousel
        title="Ubicaciones"
        subtitle="Encuentra experiencias cerca de ti."
        [items]="locationItems()"
        [loading]="store.homeLoading()"
        [error]="store.homeError()"
        emptyTitle="Sin ubicaciones disponibles"
        emptyMessage="Todavía no hay ubicaciones activas."
        (select)="goToList('location', $event)"
        (retry)="reloadHome()"
      />

      <app-filter-carousel
        title="Anfitriones"
        subtitle="Conoce a quienes imparten las experiencias."
        [items]="hostItems()"
        [loading]="store.homeLoading()"
        [error]="store.homeError()"
        emptyTitle="Sin anfitriones disponibles"
        emptyMessage="Todavía no hay anfitriones activos."
        (select)="goToList('host', $event)"
        (retry)="reloadHome()"
      />
    </section>
  `
})
export class Shop implements OnInit {
  private readonly router = inject(Router);

  protected readonly store = inject(ShopStore);

  protected readonly categoryItems = computed<FilterCarouselItem[]>(() =>
    this.store.categories().map((category) => ({
      id: category._id,
      title: category.name,
      subtitle: category.description ?? null,
      initial: this.initialOf(category.name)
    }))
  );

  protected readonly hostItems = computed<FilterCarouselItem[]>(() =>
    this.store.hosts().map((host) => {
      const name = hostDisplayName(host);
      return {
        id: host._id,
        title: name,
        subtitle: host.biography || null,
        initial: this.initialOf(name)
      };
    })
  );

  protected readonly locationItems = computed<FilterCarouselItem[]>(() =>
    this.store.locations().map((location) => ({
      id: location._id,
      title: location.name,
      subtitle: location.address,
      initial: this.initialOf(location.name)
    }))
  );

  ngOnInit(): void {
    void this.store.loadHome();
  }

  protected goToList(
    key?: 'category' | 'host' | 'location',
    id?: string
  ): void {
    this.navigateToList(key && id ? { [key]: id } : {});
  }

  protected reloadHome(): void {
    this.store.reloadHome();
  }

  protected initialOf(value: string): string {
    return value.trim().charAt(0).toUpperCase() || '·';
  }

  private navigateToList(queryParams: Record<string, string>): void {
    void this.router.navigate(['/shop-list'], { queryParams });
  }
}
