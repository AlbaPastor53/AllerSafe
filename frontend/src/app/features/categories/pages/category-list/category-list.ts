import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category, CategoryPayload } from '../../../../core/models/category.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoriesService } from '../../../../core/services/categories.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { Modal } from '../../../../shared/components/modal/modal';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { CategoryForm } from '../../components/category-form/category-form';

@Component({
  selector: 'app-category-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonLoader, EmptyState, ErrorState, Modal, CategoryForm],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-[#F5F0E6]">Categorías</h1>
          <p class="mt-1 text-sm text-[#A8B0A5]">
            {{ categories().length }} categorías registradas
          </p>
        </div>

        @if (isAdmin()) {
          <button type="button" class="button-primary" (click)="openCreate()">
            + Nueva categoría
          </button>
        }
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (categories().length === 0) {
        <app-empty-state title="No hay categorías" message="Todavía no hay categorías registradas." />
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (category of categories(); track category._id) {
            <article class="rounded-2xl border border-[#394239] bg-[#202720] p-5">
              <div class="flex items-start justify-between gap-3">
                <h2 class="font-semibold text-[#F5F0E6]">{{ category.name }}</h2>
                <span class="rounded-full bg-[#2B3226] px-2.5 py-1 text-xs text-[#D6B66E]">
                  {{ category.status === 'active' ? 'Activa' : 'Inactiva' }}
                </span>
              </div>

              <p class="mt-2 text-sm text-[#A8B0A5]">
                {{ category.description || 'Sin descripción' }}
              </p>

              <div class="mt-3 flex flex-wrap gap-2 text-xs">
                <span class="rounded-full bg-[#29332A] px-2.5 py-1 text-[#A8B0A5]">
                  Slug: {{ category.slug }}
                </span>
                <span [class]="statusClass(category)">
                  {{ category.is_active ? 'Activa' : 'Inactiva' }}
                </span>
              </div>

              @if (isAdmin()) {
                <div class="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="button-secondary"
                    [disabled]="pendingId() === category._id"
                    (click)="openEdit(category)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="button-secondary"
                    [disabled]="pendingId() === category._id"
                    (click)="toggle(category)"
                  >
                    {{ category.is_active ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              }
            </article>
          }
        </div>
      }

      <app-modal
        [open]="showForm()"
        [title]="editing() ? 'Editar categoría' : 'Nueva categoría'"
        (closed)="closeForm()"
      >
        @if (showForm()) {
          <app-category-form
            [category]="editing()"
            (formSubmit)="save($event)"
            (cancelled)="closeForm()"
          />
        }
      </app-modal>
    </section>
  `
})
export class CategoryList implements OnInit {
  private readonly service = inject(CategoriesService);
  private readonly auth = inject(AuthService);

  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pendingId = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly editing = signal<Category | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected statusClass(category: Category): string {
    return category.is_active
      ? 'rounded-full bg-[#233527] px-2.5 py-1 text-[#BFE3C2]'
      : 'rounded-full bg-[#3A2024] px-2.5 py-1 text-[#F0B7BF]';
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(category: Category): void {
    this.editing.set(category);
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  protected async save(payload: CategoryPayload): Promise<void> {
    const current = this.editing();

    try {
      if (current) {
        await firstValueFrom(this.service.update(current._id, payload));
      } else {
        await firstValueFrom(this.service.create(payload));
      }

      this.closeForm();
      await this.load();
    } catch {
      // El interceptor global muestra el error de la API.
    }
  }

  protected async toggle(category: Category): Promise<void> {
    if (this.pendingId()) return;

    this.pendingId.set(category._id);

    try {
      const updated = await firstValueFrom(
        this.service.setActive(category._id, !category.is_active)
      );

      this.categories.update((list) =>
        list.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch {
      // El interceptor global muestra el error de la API.
    } finally {
      this.pendingId.set(null);
    }
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.categories.set(await firstValueFrom(this.service.list()));
    } catch {
      this.error.set('No se han podido cargar las categorías.');
    } finally {
      this.loading.set(false);
    }
  }
}
