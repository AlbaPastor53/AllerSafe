import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EventImage } from '../models/event-image.model';
import { EventImagesService } from '../services/event-images.service';

@Injectable({ providedIn: 'root' })
export class EventImagesStore {
  private readonly service = inject(EventImagesService);

  private readonly _images = signal<EventImage[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _loaded = signal(false);

  readonly images = this._images.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly count = computed(() => this._images().length);

  async load(force = false): Promise<void> {
    if (this._loaded() && !force) return;

    this._loading.set(true);
    this._error.set(null);
    try {
      this._images.set(await firstValueFrom(this.service.list()));
      this._loaded.set(true);
    } catch (error) {
      this._error.set('No se han podido cargar las imágenes.');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  reset(): void {
    this._images.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._loaded.set(false);
  }
}
