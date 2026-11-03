import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CatalogStatus,
  Category,
  CategoryPayload
} from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div>
        <label class="form-label" for="category-name">Nombre *</label>
        <input
          id="category-name"
          class="form-input"
          formControlName="name"
          maxlength="80"
          placeholder="Ej.: Alergias"
        />
        @if (errorFor('name')) {
          <p class="form-error">{{ errorFor('name') }}</p>
        }
      </div>

      <div>
        <label class="form-label" for="category-slug">Slug (opcional)</label>
        <input
          id="category-slug"
          class="form-input"
          formControlName="slug"
          placeholder="Se genera automáticamente"
        />
      </div>

      <div>
        <label class="form-label" for="category-description">Descripción</label>
        <textarea
          id="category-description"
          rows="3"
          class="form-input"
          formControlName="description"
          maxlength="500"
          placeholder="Descripción breve de la categoría"
        ></textarea>
        @if (errorFor('description')) {
          <p class="form-error">{{ errorFor('description') }}</p>
        }
      </div>

      <div>
        <label class="form-label" for="category-status">Estado</label>
        <select id="category-status" class="form-input" formControlName="status">
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="button-secondary" (click)="cancelled.emit()">
          Cancelar
        </button>
        <button type="submit" class="button-primary">
          {{ category() ? 'Guardar cambios' : 'Crear categoría' }}
        </button>
      </div>
    </form>
  `
})
export class CategoryForm {
  private readonly fb = inject(FormBuilder);

  readonly category = input<Category | null>(null);
  readonly formSubmit = output<CategoryPayload>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    slug: [''],
    description: ['', [Validators.maxLength(500)]],
    status: ['active' as CatalogStatus, [Validators.required]]
  });

  constructor() {
    effect(() => {
      const category = this.category();

      if (!category) return;

      this.form.patchValue({
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        status: category.status
      });
    });
  }

  protected errorFor(name: string): string | null {
    const control = this.form.get(name);

    if (!control || !control.touched || control.valid) return null;

    if (control.errors?.['required']) return 'Este campo es obligatorio.';
    if (control.errors?.['minlength']) return 'Introduce al menos 2 caracteres.';
    if (control.errors?.['maxlength']) return 'Has superado la longitud máxima.';

    return 'Revisa este campo.';
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const status = value.status;

    this.formSubmit.emit({
      name: value.name.trim(),
      slug: value.slug.trim() || undefined,
      description: value.description.trim() || undefined,
      status,
      is_active: status === 'active'
    });
  }
}
