import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Profile, ProfilePayload } from '../../../../core/models/profile.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { buildRobohashUrl } from '../../../../shared/utils/avatar.util';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SkeletonLoader, ErrorState],
  template: `
    <section class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6 flex items-center gap-4">
        <span
          class="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-lg font-semibold text-gray-950"
        >
          @if (showAvatarImage()) {
            <img
              [src]="avatarSrc()"
              alt="Avatar"
              class="h-full w-full object-cover"
              (error)="onAvatarError()"
            />
          } @else {
            {{ initials() }}
          }
        </span>

        <div class="min-w-0">
          <h1 class="text-2xl font-semibold text-[#F5F0E6]">Mi perfil</h1>
          <p class="mt-1 truncate text-sm text-[#A8B0A5]">
            {{ user()?.name }} · {{ user()?.email }}
          </p>
        </div>
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else {
        <form
          [formGroup]="form"
          (ngSubmit)="save()"
          class="space-y-6 rounded-2xl border border-[#394239] bg-[#202720] p-6"
        >
          @if (saved()) {
            <p
              role="status"
              class="rounded-xl border border-[#3F5C43] bg-[#243026] px-3 py-2 text-sm text-[#BFE3C2]"
            >
              Perfil guardado correctamente.
            </p>
          }

          @if (saveError()) {
            <p
              role="alert"
              class="rounded-xl border border-[#70404A] bg-[#352329] px-3 py-2 text-sm text-[#F0B7BF]"
            >
              {{ saveError() }}
            </p>
          }

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="form-label" for="first_name">Nombre</label>
              <input
                id="first_name"
                class="form-input"
                formControlName="first_name"
                maxlength="80"
                placeholder="Nombre"
              />
              @if (errorFor('first_name')) {
                <p class="mt-1 text-sm text-[#F0B7BF]">{{ errorFor('first_name') }}</p>
              }
            </div>

            <div>
              <label class="form-label" for="last_name">Apellidos</label>
              <input
                id="last_name"
                class="form-input"
                formControlName="last_name"
                maxlength="80"
                placeholder="Apellidos"
              />
              @if (errorFor('last_name')) {
                <p class="mt-1 text-sm text-[#F0B7BF]">{{ errorFor('last_name') }}</p>
              }
            </div>

            <div>
              <label class="form-label" for="phone">Teléfono</label>
              <input
                id="phone"
                type="tel"
                class="form-input"
                formControlName="phone"
                placeholder="+34 600 000 000"
              />
              @if (errorFor('phone')) {
                <p class="mt-1 text-sm text-[#F0B7BF]">{{ errorFor('phone') }}</p>
              }
            </div>

            <div>
              <label class="form-label" for="birth_date">Fecha de nacimiento</label>
              <input
                id="birth_date"
                type="date"
                class="form-input"
                formControlName="birth_date"
                [attr.max]="today"
              />
            </div>

            <div>
              <label class="form-label" for="address">Dirección</label>
              <input
                id="address"
                class="form-input"
                formControlName="address"
                maxlength="200"
                placeholder="Calle, número, piso"
              />
              @if (errorFor('address')) {
                <p class="mt-1 text-sm text-[#F0B7BF]">{{ errorFor('address') }}</p>
              }
            </div>

            <div>
              <label class="form-label" for="city">Ciudad</label>
              <input
                id="city"
                class="form-input"
                formControlName="city"
                maxlength="100"
                placeholder="Ciudad"
              />
              @if (errorFor('city')) {
                <p class="mt-1 text-sm text-[#F0B7BF]">{{ errorFor('city') }}</p>
              }
            </div>

            <div>
              <label class="form-label" for="postal_code">Código postal</label>
              <input
                id="postal_code"
                class="form-input"
                formControlName="postal_code"
                placeholder="08001"
              />
              @if (errorFor('postal_code')) {
                <p class="mt-1 text-sm text-[#F0B7BF]">{{ errorFor('postal_code') }}</p>
              }
            </div>

            <div>
              <label class="form-label" for="avatar_url">URL del avatar</label>
              <input
                id="avatar_url"
                type="url"
                class="form-input"
                formControlName="avatar_url"
                maxlength="500"
                placeholder="https://..."
                (input)="onAvatarInput($event)"
              />
              @if (errorFor('avatar_url')) {
                <p class="mt-1 text-sm text-[#F0B7BF]">{{ errorFor('avatar_url') }}</p>
              }
            </div>
          </div>

          <div>
            <label class="form-label" for="bio">Biografía</label>
            <textarea
              id="bio"
              rows="4"
              class="form-input"
              formControlName="bio"
              maxlength="1000"
              placeholder="Cuéntanos algo sobre ti..."
            ></textarea>
            @if (errorFor('bio')) {
              <p class="mt-1 text-sm text-[#F0B7BF]">{{ errorFor('bio') }}</p>
            }
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="form-label" for="allergies">Alergias</label>
              <input
                id="allergies"
                class="form-input"
                formControlName="allergies"
                placeholder="Frutos secos, lactosa..."
              />
              <p class="mt-1 text-xs text-[#899188]">Sepáralas con comas.</p>
            </div>

            <div>
              <label class="form-label" for="dietary_restrictions">
                Restricciones alimentarias
              </label>
              <input
                id="dietary_restrictions"
                class="form-input"
                formControlName="dietary_restrictions"
                placeholder="Sin gluten, vegano..."
              />
              <p class="mt-1 text-xs text-[#899188]">Sepáralas con comas.</p>
            </div>
          </div>

          <div class="flex justify-end">
            <button type="submit" class="button-primary" [disabled]="saving()">
              {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      }
    </section>
  `
})
export class ProfileDetail implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProfileService);
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly today = new Date().toISOString().slice(0, 10);

  private readonly customAvatarPreview = signal<string | null>(null);
  private readonly failedSrc = signal<string | null>(null);

  protected readonly robohashUrl = computed(() =>
    buildRobohashUrl(
      this.user()?.name || this.user()?.email || this.user()?._id || 'allersafe'
    )
  );

  protected readonly avatarSrc = computed(() => {
    const custom = this.customAvatarPreview();
    if (custom && this.failedSrc() !== custom) return custom;
    return this.robohashUrl();
  });

  protected readonly showAvatarImage = computed(() => {
    const custom = this.customAvatarPreview();
    if (custom && this.failedSrc() !== custom) return true;
    return this.failedSrc() !== this.robohashUrl();
  });

  protected readonly initials = computed(() => {
    const name = this.user()?.name?.trim() ?? '';
    if (!name) return '?';

    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? parts[1]?.[0] ?? '' : '';

    return (first + second).toUpperCase() || '?';
  });

  protected readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.maxLength(80)]],
    last_name: ['', [Validators.maxLength(80)]],
    phone: ['', [Validators.pattern(/^[+]?[\d\s().-]{6,30}$/)]],
    birth_date: [''],
    address: ['', [Validators.maxLength(200)]],
    city: ['', [Validators.maxLength(100)]],
    postal_code: ['', [Validators.pattern(/^[A-Za-z0-9 -]{3,20}$/)]],
    avatar_url: ['', [Validators.pattern(/^https?:\/\/.+/i), Validators.maxLength(500)]],
    bio: ['', [Validators.maxLength(1000)]],
    allergies: [''],
    dietary_restrictions: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.saved.set(false);
    this.saveError.set(null);

    try {
      const profile = await firstValueFrom(this.service.get());
      this.patchForm(profile);
    } catch {
      this.error.set('No se ha podido cargar el perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    if (this.saving()) return;

    this.form.markAllAsTouched();
    this.saved.set(false);
    this.saveError.set(null);

    if (this.form.invalid) return;

    this.saving.set(true);

    try {
      const profile = await firstValueFrom(this.service.update(this.buildPayload()));
      this.patchForm(profile);
      this.saved.set(true);
    } catch {
      this.saveError.set(
        'No se ha podido guardar el perfil. Revisa los datos e inténtalo de nuevo.'
      );
    } finally {
      this.saving.set(false);
    }
  }

  protected onAvatarInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.customAvatarPreview.set(value || null);
  }

  protected onAvatarError(): void {
    this.failedSrc.set(this.avatarSrc());
  }

  protected errorFor(name: string): string | null {
    const control = this.form.get(name);

    if (!control || !control.touched || control.valid) {
      return null;
    }

    if (control.errors?.['maxlength']) {
      return 'Has superado la longitud máxima.';
    }

    if (control.errors?.['pattern']) {
      if (name === 'phone') return 'El formato del teléfono no es válido.';
      if (name === 'postal_code') return 'El formato del código postal no es válido.';
      if (name === 'avatar_url') return 'Introduce una URL válida (http o https).';
      return 'El formato no es válido.';
    }

    return 'Revisa este campo.';
  }

  private patchForm(profile: Profile): void {
    this.form.patchValue({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      phone: profile.phone ?? '',
      birth_date: profile.birth_date
        ? String(profile.birth_date).slice(0, 10)
        : '',
      address: profile.address ?? '',
      city: profile.city ?? '',
      postal_code: profile.postal_code ?? '',
      avatar_url: profile.avatar_url ?? '',
      bio: profile.bio ?? '',
      allergies: (profile.allergies ?? []).join(', '),
      dietary_restrictions: (profile.dietary_restrictions ?? []).join(', ')
    });

    this.customAvatarPreview.set(profile.avatar_url?.trim() || null);
  }

  private buildPayload(): ProfilePayload {
    const value = this.form.getRawValue();

    return {
      first_name: value.first_name.trim() || undefined,
      last_name: value.last_name.trim() || undefined,
      phone: value.phone.trim() || undefined,
      birth_date: value.birth_date || undefined,
      address: value.address.trim(),
      city: value.city.trim(),
      postal_code: value.postal_code.trim() || undefined,
      avatar_url: value.avatar_url.trim() || undefined,
      bio: value.bio.trim(),
      allergies: this.toList(value.allergies),
      dietary_restrictions: this.toList(value.dietary_restrictions)
    };
  }

  private toList(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}
