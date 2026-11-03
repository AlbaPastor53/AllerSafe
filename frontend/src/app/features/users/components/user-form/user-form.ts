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
  User,
  UserFormPayload,
  UserRole,
  UserStatus
} from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div>
        <label class="form-label" for="user-name">Nombre *</label>
        <input
          id="user-name"
          class="form-input"
          formControlName="name"
          maxlength="120"
          placeholder="Nombre completo"
        />
        @if (errorFor('name')) {
          <p class="form-error">{{ errorFor('name') }}</p>
        }
      </div>

      <div>
        <label class="form-label" for="user-email">Email *</label>
        <input
          id="user-email"
          type="email"
          class="form-input"
          formControlName="email"
          maxlength="160"
          placeholder="usuario@allersafe.com"
        />
        @if (errorFor('email')) {
          <p class="form-error">{{ errorFor('email') }}</p>
        }
      </div>

      <div>
        <label class="form-label" for="user-password">
          Contraseña {{ user() ? '(opcional)' : '*' }}
        </label>
        <input
          id="user-password"
          type="password"
          class="form-input"
          formControlName="password"
          placeholder="{{ user() ? 'Dejar vacío para no cambiarla' : 'Mínimo 8 caracteres' }}"
        />
        @if (errorFor('password')) {
          <p class="form-error">{{ errorFor('password') }}</p>
        }
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label" for="user-role">Rol</label>
          <select id="user-role" class="form-input" formControlName="role">
            <option value="Client">Cliente</option>
            <option value="Admin">Administrador</option>
          </select>
        </div>

        <div>
          <label class="form-label" for="user-status">Estado</label>
          <select id="user-status" class="form-input" formControlName="status">
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        @if (showCancel()) {
          <button type="button" class="button-secondary" (click)="cancelled.emit()">
            Cancelar
          </button>
        }
        <button type="submit" class="button-primary">
          {{ user() ? 'Guardar cambios' : 'Crear usuario' }}
        </button>
      </div>
    </form>
  `
})
export class UserForm {
  private readonly fb = inject(FormBuilder);

  readonly user = input<User | null>(null);
  readonly showCancel = input(true);
  readonly formSubmit = output<UserFormPayload>();
  readonly cancelled = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    password: ['', [Validators.minLength(8), Validators.maxLength(120)]],
    role: ['Client' as UserRole, [Validators.required]],
    status: ['active' as UserStatus, [Validators.required]]
  });

  constructor() {
    effect(() => {
      const user = this.user();
      const passwordControl = this.form.controls.password;

      passwordControl.setValidators(
        user
          ? [Validators.minLength(8), Validators.maxLength(120)]
          : [
              Validators.required,
              Validators.minLength(8),
              Validators.maxLength(120)
            ]
      );
      passwordControl.updateValueAndValidity({ emitEvent: false });

      if (!user) return;

      this.form.patchValue({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        status: user.status
      });
    });
  }

  protected errorFor(name: string): string | null {
    const control = this.form.get(name);

    if (!control || !control.touched || control.valid) return null;

    if (control.errors?.['required']) return 'Este campo es obligatorio.';
    if (control.errors?.['email']) return 'Introduce un email válido.';
    if (control.errors?.['minlength']) {
      return name === 'password'
        ? 'La contraseña debe tener al menos 8 caracteres.'
        : 'Introduce más caracteres.';
    }
    if (control.errors?.['maxlength']) return 'Has superado la longitud máxima.';

    return 'Revisa este campo.';
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const payload: UserFormPayload = {
      name: value.name.trim(),
      email: value.email.trim(),
      role: value.role,
      status: value.status
    };

    if (value.password.trim()) {
      payload.password = value.password;
    }

    this.formSubmit.emit(payload);
  }
}
