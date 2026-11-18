import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
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
    <main class="auth-shell">
      <div class="auth-container">
        <section class="brand-panel" aria-labelledby="brand-title">
          <div class="brand-identity">
            <img
              src="logo.png"
              alt="AllerSafe"
              width="74"
              height="74"
              class="brand-logo"
            />
            <h1 id="brand-title" class="brand-title">Acceso a AllerSafe</h1>
            <p class="brand-subtitle">
              Domina técnicas profesionales, desde la comodidad de tu hogar
            </p>
          </div>

          <div class="brand-features" aria-label="Ventajas de AllerSafe">
            <div class="feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 7v5l3.5 2"></path>
              </svg>
              <span>Aprende a tu ritmo</span>
            </div>
            <span class="feature-divider" aria-hidden="true"></span>
            <div class="feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m12 3 2.2 5.6L20 11l-5.8 2.4L12 19l-2.2-5.6L4 11l5.8-2.4z"></path>
              </svg>
              <span>Contenido exclusivo</span>
            </div>
            <span class="feature-divider" aria-hidden="true"></span>
            <div class="feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3 5 6v5c0 4.4 2.9 8.3 7 10 4.1-1.7 7-5.6 7-10V6z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <span>Cocina con confianza</span>
            </div>
          </div>
        </section>

        <section class="auth-panel" aria-label="Acceso a tu cuenta">
          <div class="auth-card">
            <div class="tabs" role="tablist" aria-label="Opciones de acceso">
              <button
                id="tab-login"
                type="button"
                role="tab"
                aria-controls="panel-login"
                [attr.aria-selected]="activeTab() === 'login'"
                class="tab"
                [class.active]="activeTab() === 'login'"
                (click)="setTab('login')"
              >
                Iniciar sesión
              </button>
              <button
                id="tab-register"
                type="button"
                role="tab"
                aria-controls="panel-register"
                [attr.aria-selected]="activeTab() === 'register'"
                class="tab"
                [class.active]="activeTab() === 'register'"
                (click)="setTab('register')"
              >
                Registrarse
              </button>
            </div>

            <div class="card-body">
              <div
                id="panel-login"
                role="tabpanel"
                aria-labelledby="tab-login"
                class="form-panel"
                [hidden]="activeTab() !== 'login'"
              >
                <h2 class="panel-title">Bienvenido de nuevo</h2>
                <p class="panel-lead">
                  Accede a tu cuenta para continuar aprendiendo
                </p>

                @if (error()) {
                  <p class="alert alert-error" role="alert">{{ error() }}</p>
                }
                @if (recoveryNotice()) {
                  <p class="alert alert-info" role="status">{{ recoveryNotice() }}</p>
                }

                <form [formGroup]="form" (ngSubmit)="onSubmit()">
                  <div class="field">
                    <label for="email">Correo electrónico</label>
                    <div class="input-wrap">
                      <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="2.5" y="5" width="19" height="14" rx="2"></rect>
                        <path d="m3 7 9 6 9-6"></path>
                      </svg>
                      <input
                        id="email"
                        type="email"
                        class="field-input"
                        formControlName="email"
                        autocomplete="username"
                        placeholder="tu@email.com"
                        [attr.aria-invalid]="showError('email')"
                      />
                    </div>
                    @if (showError('email')) {
                      <p class="field-error">Introduce un email válido.</p>
                    }
                  </div>

                  <div class="field">
                    <label for="password">Contraseña</label>
                    <div class="input-wrap">
                      <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="5" y="10" width="14" height="10" rx="2"></rect>
                        <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
                      </svg>
                      <input
                        id="password"
                        [type]="showPassword() ? 'text' : 'password'"
                        class="field-input has-toggle"
                        formControlName="password"
                        autocomplete="current-password"
                        placeholder="Tu contraseña"
                        [attr.aria-invalid]="showError('password')"
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                        (click)="showPassword.set(!showPassword())"
                      >
                        @if (showPassword()) {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M4 4l16 16"></path>
                            <path d="M9.9 6.3A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.4 3.1"></path>
                            <path d="M6.2 8.2A16 16 0 0 0 2.5 12s3.5 6 9.5 6a9.7 9.7 0 0 0 3.3-.6"></path>
                          </svg>
                        } @else {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
                            <circle cx="12" cy="12" r="2.5"></circle>
                          </svg>
                        }
                      </button>
                    </div>
                    @if (showError('password')) {
                      <p class="field-error">La contraseña es obligatoria.</p>
                    }
                  </div>

                  <div class="form-row">
                    <label class="checkbox">
                      <input
                        #rememberCheckbox
                        type="checkbox"
                        [checked]="remember()"
                        (change)="remember.set(rememberCheckbox.checked)"
                      />
                      <span class="checkbox-box" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m5 12 4.5 4.5L19 7"></path>
                        </svg>
                      </span>
                      <span>Recordarme</span>
                    </label>
                    <button type="button" class="text-link" (click)="onForgotPassword()">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  <button
                    type="submit"
                    class="submit-btn"
                    [disabled]="submitting()"
                  >
                    {{ submitting() ? 'Iniciando sesión...' : 'Iniciar sesión' }}
                  </button>
                </form>

                <p class="card-footer">
                  ¿No tienes una cuenta?
                  <button type="button" class="text-link" (click)="setTab('register')">
                    Regístrate aquí
                  </button>
                </p>
              </div>

              <div
                id="panel-register"
                role="tabpanel"
                aria-labelledby="tab-register"
                class="form-panel"
                [hidden]="activeTab() !== 'register'"
              >
                <h2 class="panel-title">Crea tu cuenta</h2>
                <p class="panel-lead">
                  Tu plaza en la cocina empieza aquí
                </p>

                @if (registerNotice()) {
                  <p class="alert alert-info" role="status">{{ registerNotice() }}</p>
                }

                <form [formGroup]="registerForm" (ngSubmit)="onRegisterSubmit()">
                  <div class="field">
                    <label for="register-name">Nombre</label>
                    <div class="input-wrap">
                      <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="8" r="3.5"></circle>
                        <path d="M5 20a7 7 0 0 1 14 0"></path>
                      </svg>
                      <input
                        id="register-name"
                        type="text"
                        class="field-input"
                        formControlName="name"
                        autocomplete="name"
                        placeholder="Tu nombre"
                        [attr.aria-invalid]="showRegisterError('name')"
                      />
                    </div>
                    @if (showRegisterError('name')) {
                      <p class="field-error">Introduce tu nombre (mínimo 2 caracteres).</p>
                    }
                  </div>

                  <div class="field">
                    <label for="register-email">Correo electrónico</label>
                    <div class="input-wrap">
                      <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="2.5" y="5" width="19" height="14" rx="2"></rect>
                        <path d="m3 7 9 6 9-6"></path>
                      </svg>
                      <input
                        id="register-email"
                        type="email"
                        class="field-input"
                        formControlName="email"
                        autocomplete="username"
                        placeholder="tu@email.com"
                        [attr.aria-invalid]="showRegisterError('email')"
                      />
                    </div>
                    @if (showRegisterError('email')) {
                      <p class="field-error">Introduce un email válido.</p>
                    }
                  </div>

                  <div class="field">
                    <label for="register-password">Contraseña</label>
                    <div class="input-wrap">
                      <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="5" y="10" width="14" height="10" rx="2"></rect>
                        <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
                      </svg>
                      <input
                        id="register-password"
                        [type]="showRegisterPassword() ? 'text' : 'password'"
                        class="field-input has-toggle"
                        formControlName="password"
                        autocomplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        [attr.aria-invalid]="showRegisterError('password')"
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        [attr.aria-label]="showRegisterPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                        (click)="showRegisterPassword.set(!showRegisterPassword())"
                      >
                        @if (showRegisterPassword()) {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M4 4l16 16"></path>
                            <path d="M9.9 6.3A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.4 3.1"></path>
                            <path d="M6.2 8.2A16 16 0 0 0 2.5 12s3.5 6 9.5 6a9.7 9.7 0 0 0 3.3-.6"></path>
                          </svg>
                        } @else {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
                            <circle cx="12" cy="12" r="2.5"></circle>
                          </svg>
                        }
                      </button>
                    </div>
                    @if (showRegisterError('password')) {
                      <p class="field-error">La contraseña debe tener al menos 8 caracteres.</p>
                    }
                  </div>

                  <div class="field">
                    <label for="register-confirm">Confirmar contraseña</label>
                    <div class="input-wrap">
                      <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="5" y="10" width="14" height="10" rx="2"></rect>
                        <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
                      </svg>
                      <input
                        id="register-confirm"
                        [type]="showConfirmPassword() ? 'text' : 'password'"
                        class="field-input has-toggle"
                        formControlName="confirmPassword"
                        autocomplete="new-password"
                        placeholder="Repite tu contraseña"
                        [attr.aria-invalid]="showRegisterError('confirmPassword')"
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        [attr.aria-label]="showConfirmPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                        (click)="showConfirmPassword.set(!showConfirmPassword())"
                      >
                        @if (showConfirmPassword()) {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M4 4l16 16"></path>
                            <path d="M9.9 6.3A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.4 3.1"></path>
                            <path d="M6.2 8.2A16 16 0 0 0 2.5 12s3.5 6 9.5 6a9.7 9.7 0 0 0 3.3-.6"></path>
                          </svg>
                        } @else {
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
                            <circle cx="12" cy="12" r="2.5"></circle>
                          </svg>
                        }
                      </button>
                    </div>
                    @if (showRegisterError('confirmPassword')) {
                      <p class="field-error">Las contraseñas no coinciden.</p>
                    }
                  </div>

                  <button type="submit" class="submit-btn">
                    Crear cuenta
                  </button>
                </form>

                <p class="card-footer">
                  ¿Ya tienes una cuenta?
                  <button type="button" class="text-link" (click)="setTab('login')">
                    Inicia sesión
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
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

  protected readonly activeTab = signal<'login' | 'register'>('login');
  protected readonly showPassword = signal(false);
  protected readonly showRegisterPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly remember = signal(false);
  protected readonly recoveryNotice = signal<string | null>(null);
  protected readonly registerNotice = signal<string | null>(null);

  private readonly passwordsMatch: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmation = control.get('confirmPassword')?.value;
    return password && confirmation && password !== confirmation
      ? { passwordMismatch: true }
      : null;
  };

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected readonly registerForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this.passwordsMatch }
  );

  protected setTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.recoveryNotice.set(null);
    this.registerNotice.set(null);
  }

  protected onForgotPassword(): void {
    this.recoveryNotice.set(
      'La recuperación de contraseña aún no está disponible. Contacta con el administrador de AllerSafe.'
    );
  }

  protected onRegisterSubmit(): void {
    this.registerNotice.set(null);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.registerNotice.set(
      'El registro aún no está disponible. Contacta con el administrador de AllerSafe.'
    );
  }

  protected showError(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  protected showRegisterError(
    controlName: 'name' | 'email' | 'password' | 'confirmPassword'
  ): boolean {
    const control = this.registerForm.controls[controlName];
    if (!(control.dirty || control.touched)) return false;
    if (
      controlName === 'confirmPassword' &&
      this.registerForm.hasError('passwordMismatch')
    ) {
      return true;
    }
    return control.invalid;
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

    return this.auth.isAdmin() ? '/events' : '/departures';
  }
}
