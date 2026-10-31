import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Departure } from '../../../../core/models/departure.model';
import { DeparturesService } from '../../../../core/services/departures.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { formatDate, formatPrice } from '../../../../shared/utils/format.util';

@Component({
  selector: 'app-departure-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonLoader, EmptyState, ErrorState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-[#F5F0E6]">Salidas</h1>
        <p class="mt-1 text-sm text-[#A8B0A5]">{{ departures().length }} salidas programadas</p>
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (departures().length === 0) {
        <app-empty-state title="No hay salidas" message="Todavía no hay salidas programadas." />
      } @else {
        <div class="divide-y divide-[#394239] overflow-hidden rounded-2xl border border-[#394239] bg-[#202720]">
          @for (departure of departures(); track departure._id) {
            <article class="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="font-semibold text-[#F5F0E6]">{{ eventName(departure) }}</h2>
                  <span class="rounded-full bg-[#29332A] px-2.5 py-1 text-xs text-[#D6B66E]">{{ departure.status }}</span>
                </div>
                <p class="mt-1 text-sm text-[#A8B0A5]">
                  {{ formatDate(departure.start_datetime) }} - {{ formatDate(departure.end_datetime) }}
                </p>
              </div>
              <div class="text-sm text-[#F5F0E6] sm:text-right">
                <p>{{ formatPrice(departure.price) }}</p>
                <p class="text-xs text-gray-500">{{ departure.booked_participants }} / {{ departure.capacity }} plazas</p>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class DepartureList implements OnInit {
  private readonly service = inject(DeparturesService);

  protected readonly departures = signal<Departure[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formatDate = formatDate;
  protected readonly formatPrice = formatPrice;

  ngOnInit(): void {
    this.load();
  }

  protected eventName(departure: Departure): string {
    return typeof departure.event === 'string' ? departure.event : departure.event.name;
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.departures.set(await firstValueFrom(this.service.list()));
    } catch {
      this.error.set('No se han podido cargar las salidas.');
    } finally {
      this.loading.set(false);
    }
  }
}
