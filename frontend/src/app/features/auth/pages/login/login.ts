import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import {
  isHttpError,
  showUnexpectedError
} from '../../../../shared/utils/error.util';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <main class="grid min-h-screen place-items-center px-4 py-10">
      <div class="w-full max-w-md">
        <div class="mb-8 flex flex-col items-center text-center">
          <img
            src="logo.png"
            alt="AllerSafe"
            width="56"
            height="56"
            class="h-14 w-14 rounded-2xl object-cover"
          />
          <h1 class="mt-4 text-2xl font-semibold tracking-tight text-[#F5F0E6]">
            Acceso a AllerSafe
          </h1>
          <p class="mt-2 text-sm text-[#A8B0A5]">
            Inicia sesión para administrar los eventos.
          </p>
        </div>

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="space-y-5 rounded-2xl border border-[#394239] bg-[#202720] p-6 shadow-xl shadow-black/20"
        >
          @if (error()) {
            <p
              role="alert"
              class="rounded-xl border border-[#70404A] bg-[#352329] px-3 py-2 text-sm text-[#F0B7BF]"
            >
              {{ error() }}
            </p>
          }

          <div>
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              type="email"
              class="form-input"
              formControlName="email"
              autocomplete="username"
              placeholder="admin@allersafe.com"
              [attr.aria-invalid]="showError('email')"
            />
            @if (showError('email')) {
              <p class="mt-1 text-sm text-[#F0B7BF]">Introduce un email válido.</p>
            }
          </div>

          <div>
            <label class="form-label" for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              class="form-input"
              formControlName="password"
              autocomplete="current-password"
              placeholder="Tu contraseña"
              [attr.aria-invalid]="showError('password')"
            />
            @if (showError('password')) {
              <p class="mt-1 text-sm text-[#F0B7BF]">
                La contraseña es obligatoria.
              </p>
            }
          </div>

          <button
            type="submit"
            class="button-primary w-full"
            [disabled]="submitting()"
          >
            {{ submitting() ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>
      </div>
    </main>
  `
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected showError(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected async onSubmit(): Promise<void> {
    if (this.submitting()) return;

    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    try {
      await firstValueFrom(this.auth.login(this.form.getRawValue()));
      await this.router.navigateByUrl(this.resolveReturnUrl());
    } catch (error) {
      if (isHttpError(error)) {
        if (error.status === 401) {
          this.error.set('Email o contraseña incorrectos.');
        } else if (error.status === 403) {
          this.error.set(
            error.error?.error?.message ??
              'Tu cuenta no tiene permisos para acceder.'
          );
        }
      } else {
        this.error.set('La respuesta del servidor no es válida. Inténtalo de nuevo.');
        showUnexpectedError(error);
      }
    } finally {
      this.submitting.set(false);
    }
  }

  private resolveReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (
      returnUrl &&
      returnUrl.startsWith('/') &&
      !returnUrl.startsWith('//') &&
      !returnUrl.startsWith('/login')
    ) {
      return returnUrl;
    }

    return '/departures';
  }
}
