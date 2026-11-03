import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { buildRobohashUrl } from '../../utils/avatar.util';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (isAuthenticated()) {
      <div class="flex items-center gap-3">
        <a
          routerLink="/profile"
          class="flex items-center gap-3 rounded-full transition-opacity hover:opacity-80"
          [attr.aria-label]="'Mi perfil de ' + (user()?.name ?? '')"
        >
          <span
            class="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-sm font-semibold text-gray-950"
          >
            @if (showAvatarImage()) {
              <img
                [src]="avatarSrc()"
                [alt]="user()?.name ?? 'Avatar'"
                class="h-full w-full object-cover"
                (error)="onAvatarError()"
              />
            } @else {
              {{ initials() }}
            }
          </span>
          <span class="hidden max-w-40 truncate text-sm font-medium text-[#F5F0E6] sm:block">
            {{ user()?.name }}
          </span>
        </a>

        <button type="button" class="button-secondary" (click)="logout()">
          Salir
        </button>
      </div>
    } @else {
      <a routerLink="/login" class="button-primary">Iniciar sesión</a>
    }
  `
})
export class UserMenu {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  private readonly customAvatarUrl = computed(
    () => this.profileService.profile()?.avatar_url?.trim() || null
  );

  protected readonly robohashUrl = computed(() =>
    buildRobohashUrl(
      this.user()?.name || this.user()?.email || this.user()?._id || 'allersafe'
    )
  );

  private readonly failedSrc = signal<string | null>(null);

  protected readonly avatarSrc = computed(() => {
    const custom = this.customAvatarUrl();
    if (custom && this.failedSrc() !== custom) return custom;
    return this.robohashUrl();
  });

  protected readonly showAvatarImage = computed(() => {
    const custom = this.customAvatarUrl();
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

  constructor() {
    toObservable(this.user)
      .pipe(
        switchMap((user) => {
          if (!user) {
            this.profileService.clear();
            return of(null);
          }

          return this.profileService.get().pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  protected onAvatarError(): void {
    this.failedSrc.set(this.avatarSrc());
  }
}
