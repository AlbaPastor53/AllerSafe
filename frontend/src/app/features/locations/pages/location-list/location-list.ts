import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Location } from '../../../../core/models/location.model';
import { LocationsService } from '../../../../core/services/locations.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-location-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonLoader, EmptyState, ErrorState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-[#F5F0E6]">Ubicaciones</h1>
        <p class="mt-1 text-sm text-[#A8B0A5]">{{ locations().length }} ubicaciones registradas</p>
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (locations().length === 0) {
        <app-empty-state title="No hay ubicaciones" message="Todavía no hay ubicaciones registradas." />
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (location of locations(); track location._id) {
            <article class="rounded-2xl border border-[#394239] bg-[#202720] p-5">
              <div class="flex items-start justify-between gap-3">
                <h2 class="font-semibold text-[#F5F0E6]">{{ location.name }}</h2>
                <span class="rounded-full bg-[#29332A] px-2.5 py-1 text-xs text-[#D6B66E]">{{ location.status }}</span>
              </div>
              <p class="mt-2 text-sm text-[#A8B0A5]">{{ location.address }}</p>
              <p class="mt-3 text-xs text-gray-500">Slug: {{ location.slug }}</p>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class LocationList implements OnInit {
  private readonly service = inject(LocationsService);

  protected readonly locations = signal<Location[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.locations.set(await firstValueFrom(this.service.list()));
    } catch {
      this.error.set('No se han podido cargar las ubicaciones.');
    } finally {
      this.loading.set(false);
    }
  }
}
