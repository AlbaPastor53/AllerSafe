import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EventImage } from '../../../../core/models/event-image.model';
import { EventImagesService } from '../../../../core/services/event-images.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-event-image-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonLoader, EmptyState, ErrorState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-[#F5F0E6]">Imágenes de eventos</h1>
        <p class="mt-1 text-sm text-[#A8B0A5]">{{ images().length }} imágenes registradas</p>
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (images().length === 0) {
        <app-empty-state title="No hay imágenes" message="Todavía no hay imágenes de eventos." />
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (image of images(); track image._id) {
            <figure class="overflow-hidden rounded-2xl border border-[#394239] bg-[#202720]">
              <img [src]="image.url" [alt]="image.alt || 'Imagen de evento'" class="h-44 w-full object-cover" />
              <figcaption class="p-4">
                <p class="text-sm font-medium text-[#F5F0E6]">{{ image.alt || 'Sin texto alternativo' }}</p>
                <p class="mt-1 text-xs text-gray-500">Posición: {{ image.position }}</p>
              </figcaption>
            </figure>
          }
        </div>
      }
    </section>
  `
})
export class EventImageList implements OnInit {
  private readonly service = inject(EventImagesService);

  protected readonly images = signal<EventImage[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.images.set(await firstValueFrom(this.service.list()));
    } catch {
      this.error.set('No se han podido cargar las imágenes.');
    } finally {
      this.loading.set(false);
    }
  }
}
