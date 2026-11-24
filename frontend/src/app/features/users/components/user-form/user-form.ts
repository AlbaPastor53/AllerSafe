import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Profile, ProfilePayload } from '../../../../core/models/profile.model';
import { User, UserFormPayload, UserRole, UserStatus } from '../../../../core/models/user.model';

function trimmed(value: string): string | undefined {
  const result = value.trim();
  return result || undefined;
}

function toList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const EMPTY_PROFILE = {
  first_name: '',
  last_name: '',
  phone: '',
  birth_date: '',
  address: '',
  city: '',
  postal_code: '',
  avatar_url: '',
  bio: '',
  allergies: '',
  dietary_restrictions: ''
};

@Component({
  selector: 'app-user-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      @if (!profile()) {
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
      }

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

      @if (profile()) {
        <div class="border-t border-[#4A3827] pt-5">
          <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-[#8E7F6F]">
            Datos del perfil
          </h3>

          <div formGroupName="profile" class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="form-label" for="profile-first-name">Nombre</label>
              <input id="profile-first-name" class="form-input" formControlName="first_name" maxlength="80" />
              @if (errorFor('profile.first_name')) {
                <p class="form-error">{{ errorFor('profile.first_name') }}</p>
              }
            </div>
            <div>
              <label class="form-label" for="profile-last-name">Apellidos</label>
              <input id="profile-last-name" class="form-input" formControlName="last_name" maxlength="80" />
              @if (errorFor('profile.last_name')) {
                <p class="form-error">{{ errorFor('profile.last_name') }}</p>
              }
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="form-label" for="profile-phone">Teléfono</label>
              <input id="profile-phone" class="form-input" formControlName="phone" maxlength="30" />
              @if (errorFor('profile.phone')) {
                <p class="form-error">{{ errorFor('profile.phone') }}</p>
              }
            </div>
            <div>
              <label class="form-label" for="profile-birth-date">Fecha de nacimiento</label>
              <input id="profile-birth-date" type="date" class="form-input" formControlName="birth_date" [max]="today" />
              @if (errorFor('profile.birth_date')) {
                <p class="form-error">{{ errorFor('profile.birth_date') }}</p>
              }
            </div>
          </div>

          <div>
            <label class="form-label" for="profile-address">Dirección</label>
            <input id="profile-address" class="form-input" formControlName="address" maxlength="200" />
            @if (errorFor('profile.address')) {
              <p class="form-error">{{ errorFor('profile.address') }}</p>
            }
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="form-label" for="profile-city">Ciudad</label>
              <input id="profile-city" class="form-input" formControlName="city" maxlength="100" />
              @if (errorFor('profile.city')) {
                <p class="form-error">{{ errorFor('profile.city') }}</p>
              }
            </div>
            <div>
              <label class="form-label" for="profile-postal-code">Código postal</label>
              <input id="profile-postal-code" class="form-input" formControlName="postal_code" maxlength="20" />
              @if (errorFor('profile.postal_code')) {
                <p class="form-error">{{ errorFor('profile.postal_code') }}</p>
              }
            </div>
          </div>

          <div>
            <label class="form-label" for="profile-avatar">URL del avatar</label>
            <input id="profile-avatar" class="form-input" formControlName="avatar_url" placeholder="https://... o imagen base64" />
            @if (errorFor('profile.avatar_url')) {
              <p class="form-error">{{ errorFor('profile.avatar_url') }}</p>
            }
          </div>

          <div>
            <label class="form-label" for="profile-bio">Biografía</label>
            <textarea id="profile-bio" class="form-input" formControlName="bio" rows="3" maxlength="1000"></textarea>
            @if (errorFor('profile.bio')) {
              <p class="form-error">{{ errorFor('profile.bio') }}</p>
            }
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="form-label" for="profile-allergies">Alergias (separadas por comas)</label>
              <input id="profile-allergies" class="form-input" formControlName="allergies" placeholder="frutos secos, gluten" />
            </div>
            <div>
              <label class="form-label" for="profile-restrictions">Restricciones (separadas por comas)</label>
              <input id="profile-restrictions" class="form-input" formControlName="dietary_restrictions" placeholder="sin lactosa, vegano" />
            </div>
          </div>
          </div>
        </div>
      }

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
  readonly profile = input<Profile | null>(null);
  readonly showCancel = input(true);
  readonly formSubmit = output<UserFormPayload>();
  readonly cancelled = output<void>();

  protected readonly today = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    password: ['', [Validators.minLength(8), Validators.maxLength(120)]],
    role: ['Client' as UserRole, [Validators.required]],
    status: ['active' as UserStatus, [Validators.required]],
    profile: this.fb.nonNullable.group({
      first_name: ['', [Validators.maxLength(80)]],
      last_name: ['', [Validators.maxLength(80)]],
      phone: ['', [Validators.pattern(/^[+]?[\d\s().-]{6,30}$/)]],
      birth_date: [''],
      address: ['', [Validators.maxLength(200)]],
      city: ['', [Validators.maxLength(100)]],
      postal_code: ['', [Validators.pattern(/^[A-Za-z0-9 -]{3,20}$/)]],
      avatar_url: [''],
      bio: ['', [Validators.maxLength(1000)]],
      allergies: [''],
      dietary_restrictions: ['']
    })
  });

  constructor() {
    effect(() => {
      const user = this.user();
      const profile = this.profile();
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

      if (user) {
        this.form.patchValue({
          name: user.name,
          email: user.email,
          password: '',
          role: user.role,
          status: user.status
        });
      }

      const profileControls = this.form.controls.profile;
      if (profile) {
        profileControls.patchValue({
          first_name: profile.first_name ?? '',
          last_name: profile.last_name ?? '',
          phone: profile.phone ?? '',
          birth_date: profile.birth_date ? profile.birth_date.slice(0, 10) : '',
          address: profile.address ?? '',
          city: profile.city ?? '',
          postal_code: profile.postal_code ?? '',
          avatar_url: profile.avatar_url ?? '',
          bio: profile.bio ?? '',
          allergies: (profile.allergies ?? []).join(', '),
          dietary_restrictions: (profile.dietary_restrictions ?? []).join(', ')
        });
      } else {
        profileControls.reset(EMPTY_PROFILE);
      }
    });
  }

  protected errorFor(name: string): string | null {
    const control = this.form.get(name);
    if (!control || !control.touched || control.valid) return null;

    if (control.errors?.['required']) return 'Este campo es obligatorio.';
    if (control.errors?.['email']) return 'Introduce un email válido.';
    if (control.errors?.['pattern']) return 'Revisa el formato de este campo.';
    if (control.errors?.['max']) return 'La fecha no puede ser futura.';
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
    const p = value.profile;

    const profilePayload: ProfilePayload = {
      address: p.address.trim(),
      city: p.city.trim(),
      bio: p.bio.trim(),
      avatar_url: p.avatar_url.trim(),
      allergies: toList(p.allergies),
      dietary_restrictions: toList(p.dietary_restrictions)
    };

    const firstName = trimmed(p.first_name);
    if (firstName) profilePayload.first_name = firstName;
    const lastName = trimmed(p.last_name);
    if (lastName) profilePayload.last_name = lastName;
    const phone = trimmed(p.phone);
    if (phone) profilePayload.phone = phone;
    const postalCode = trimmed(p.postal_code);
    if (postalCode) profilePayload.postal_code = postalCode;
    const birthDate = trimmed(p.birth_date);
    if (birthDate) profilePayload.birth_date = birthDate;

    // Con el perfil cargado, nombre y apellidos son la única fuente del nombre.
    const composedName = [firstName, lastName]
      .filter((part): part is string => Boolean(part))
      .join(' ');
    const name =
      (this.profile() ? composedName || value.name.trim() : value.name.trim()) ||
      this.user()?.name?.trim() ||
      '';

    const payload: UserFormPayload = {
      name,
      email: value.email.trim(),
      role: value.role,
      status: value.status
    };

    // Si el perfil no se ha cargado, no se envía para no borrar sus datos.
    if (this.profile()) {
      payload.profile = profilePayload;
    }

    const password = trimmed(value.password);
    if (password) payload.password = password;

    this.formSubmit.emit(payload);
  }
}
