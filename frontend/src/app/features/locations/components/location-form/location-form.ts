import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogStatus } from '../../../../core/models/category.model';
import {
  Location,
  LocationPayload
} from '../../../../core/models/location.model';

@Component({
  selector: 'app-location-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div>
        <label class="form-label" for="location-name">Nombre *</label>
        <input
          id="location-name"
          class="form-input"
          formControlName="name"
          maxlength="120"
          placeholder="Ej.: Centro AllerSafe"
        />
        @if (errorFor('name')) {
          <p class="form-error">{{ errorFor('name') }}</p>
        }
      </div>

      <div>
        <label class="form-label" for="location-address">Dirección *</label>
        <input
          id="location-address"
          class="form-input"
          formControlName="address"
          maxlength="255"
          placeholder="Calle, número, ciudad"
        />
        @if (errorFor('address')) {
          <p class="form-error">{{ errorFor('address') }}</p>
        }
      </div>

      <div>
        <label class="form-label" for="location-slug">Slug (opcional)</label>
        <input
          id="location-slug"
          class="form-input"
          formControlName="slug"
          placeholder="Se genera automáticamente"
        />
      </div>

      <div>
        <label class="form-label" for="location-status">Estado</label>
        <select id="location-status" class="form-input" formControlName="status">
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="button-secondary" (click)="cancelled.emit()">
          Cancelar
        </button>
        <button type="submit" class="button-primary">
          {{ location() ? 'Guardar cambios' : 'Crear ubicación' }}
        </button>
      </div>
    </form>
  `
})
export class LocationForm {
  private readonly fb = inject(FormBuilder);

  readonly location = input<Location | null>(null);
  readonly formSubmit = output<LocationPayload>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    address: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    slug: [''],
    status: ['active' as CatalogStatus, [Validators.required]]
  });

  constructor() {
    effect(() => {
      const location = this.location();

      if (!location) return;

      this.form.patchValue({
        name: location.name,
        address: location.address,
        slug: location.slug,
        status: location.status
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
      address: value.address.trim(),
      slug: value.slug.trim() || undefined,
      status,
      is_active: status === 'active'
    });
  }
}
