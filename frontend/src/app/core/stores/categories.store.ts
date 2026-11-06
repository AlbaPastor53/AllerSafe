import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category, CategoryPayload } from '../models/category.model';
import { CategoriesService } from '../services/categories.service';

@Injectable({ providedIn: 'root' })
export class CategoriesStore {
  private readonly service = inject(CategoriesService);

  private readonly _categories = signal<Category[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _loaded = signal(false);

  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly count = computed(() => this._categories().length);

  async load(force = false): Promise<void> {
    if (this._loaded() && !force) return;

    this._loading.set(true);
    this._error.set(null);
    try {
      this._categories.set(await firstValueFrom(this.service.list()));
      this._loaded.set(true);
    } catch (error) {
      this._error.set('No se han podido cargar las categorías.');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async create(payload: CategoryPayload): Promise<Category> {
    const category = await firstValueFrom(this.service.create(payload));
    const wasLoaded = this._loaded();
    this._categories.update((items) => [category, ...items]);
    this._loaded.set(wasLoaded);
    this._error.set(null);
    return category;
  }

  async update(id: string, payload: Partial<CategoryPayload>): Promise<Category> {
    const category = await firstValueFrom(this.service.update(id, payload));
    this.patch(category);
    return category;
  }

  async setActive(id: string, active: boolean): Promise<Category> {
    const category = await firstValueFrom(this.service.setActive(id, active));
    this.patch(category);
    return category;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.service.remove(id));
    this._categories.update((items) => items.filter((item) => item._id !== id));
    this._error.set(null);
  }

  patch(category: Category): void {
    this._categories.update((items) =>
      items.map((item) => (item._id === category._id ? category : item))
    );
    this._error.set(null);
  }

  reset(): void {
    this._categories.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._loaded.set(false);
  }
}
