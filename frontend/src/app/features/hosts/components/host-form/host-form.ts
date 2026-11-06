import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Host, HostPayload, HostStatus } from '../../../../core/models/host.model';
import { User } from '../../../../core/models/user.model';
import { UsersStore } from '../../../../core/stores/users.store';

@Component({
  selector: 'app-host-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      @if (loadError()) {
        <p class="rounded-xl border border-[#70404A] bg-[#352329] px-3 py-2 text-sm text-[#F0B7BF]">
          {{ loadError() }}
        </p>
      }

      <div>
        <label class="form-label" for="host-user">Usuario *</label>
        <select id="host-user" class="form-input" formControlName="user_id">
          <option value="">Selecciona un usuario</option>

          @for (user of users(); track user._id) {
            <option
              [value]="user._id"
              [disabled]="!isUserAvailable(user)"
            >
              {{ user.name }} — {{ user.email }}
              {{ isUserAvailable(user) ? '' : ' (ya tiene anfitrión)' }}
            </option>
          }
        </select>
        @if (errorFor('user_id')) {
          <p class="form-error">{{ errorFor('user_id') }}</p>
        }
      </div>

      <div>
        <label class="form-label" for="host-biography">Biografía</label>
        <textarea
          id="host-biography"
          rows="3"
          class="form-input"
          formControlName="biography"
          maxlength="1000"
          placeholder="Experiencia, especialidades..."
        ></textarea>
        @if (errorFor('biography')) {
          <p class="form-error">{{ errorFor('biography') }}</p>
        }
      </div>

      <div>
        <label class="form-label" for="host-slug">Slug (opcional)</label>
        <input
          id="host-slug"
          class="form-input"
          formControlName="slug"
          placeholder="Se genera automáticamente"
        />
      </div>

      <div>
        <label class="form-label" for="host-status">Estado</label>
        <select id="host-status" class="form-input" formControlName="status">
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="suspended">Suspendido</option>
        </select>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="button-secondary" (click)="cancelled.emit()">
          Cancelar
        </button>
        <button type="submit" class="button-primary">
          {{ host() ? 'Guardar cambios' : 'Crear anfitrión' }}
        </button>
      </div>
    </form>
  `
})
export class HostForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersStore = inject(UsersStore);

  readonly host = input<Host | null>(null);
  readonly formSubmit = output<HostPayload>();
  readonly cancelled = output<void>();

  protected readonly users = this.usersStore.users;
  protected readonly loadError = signal<string | null>(null);

  protected readonly currentUserId = computed(() => {
    const host = this.host();
    if (!host) return null;

    return typeof host.user_id === 'string' ? host.user_id : host.user_id._id;
  });

  protected readonly form = this.fb.nonNullable.group({
    user_id: ['', [Validators.required]],
    biography: ['', [Validators.maxLength(1000)]],
    slug: [''],
    status: ['active' as HostStatus, [Validators.required]]
  });

  constructor() {
    effect(() => {
      const host = this.host();

      if (!host) return;

      this.form.patchValue({
        user_id: this.currentUserId() ?? '',
        biography: host.biography ?? '',
        slug: host.slug,
        status: host.status
      });
    });
  }

  ngOnInit(): void {
    void this.loadUsers();
  }

  protected isUserAvailable(user: User): boolean {
    return !user.host_id || user._id === this.currentUserId();
  }

  protected errorFor(name: string): string | null {
    const control = this.form.get(name);

    if (!control || !control.touched || control.valid) return null;

    if (control.errors?.['required']) return 'Este campo es obligatorio.';
    if (control.errors?.['maxlength']) return 'Has superado la longitud máxima.';

    return 'Revisa este campo.';
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const status = value.status;

    this.formSubmit.emit({
      user_id: value.user_id,
      biography: value.biography.trim() || undefined,
      slug: value.slug.trim() || undefined,
      status,
      is_active: status === 'active'
    });
  }

  private async loadUsers(): Promise<void> {
    try {
      await this.usersStore.load(true);
    } catch {
      this.loadError.set('No se han podido cargar los usuarios disponibles.');
    }
  }
}
