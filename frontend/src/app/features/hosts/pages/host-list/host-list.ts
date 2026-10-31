import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Host } from '../../../../core/models/host.model';
import { HostsService } from '../../../../core/services/hosts.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-host-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonLoader, EmptyState, ErrorState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-[#F5F0E6]">Anfitriones</h1>
        <p class="mt-1 text-sm text-[#A8B0A5]">{{ hosts().length }} anfitriones registrados</p>
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (hosts().length === 0) {
        <app-empty-state title="No hay anfitriones" message="Todavía no hay anfitriones registrados." />
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (host of hosts(); track host._id) {
            <article class="rounded-2xl border border-[#394239] bg-[#202720] p-5">
              <div class="flex items-start justify-between gap-3">
                <h2 class="font-semibold text-[#F5F0E6]">{{ hostName(host) }}</h2>
                <span class="rounded-full bg-[#29332A] px-2.5 py-1 text-xs text-[#D6B66E]">{{ host.status }}</span>
              </div>
              <p class="mt-2 text-sm text-[#A8B0A5]">{{ host.biography || 'Sin biografía' }}</p>
              <p class="mt-3 text-xs text-gray-500">Slug: {{ host.slug }}</p>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class HostList implements OnInit {
  private readonly service = inject(HostsService);

  protected readonly hosts = signal<Host[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected hostName(host: Host): string {
    return typeof host.user_id === 'string' ? host.slug : host.user_id.name;
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.hosts.set(await firstValueFrom(this.service.list()));
    } catch {
      this.error.set('No se han podido cargar los anfitriones.');
    } finally {
      this.loading.set(false);
    }
  }
}
