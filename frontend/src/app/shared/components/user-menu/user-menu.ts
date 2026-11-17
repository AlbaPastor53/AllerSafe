import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthUser } from '../../../core/models/auth.model';

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

        <button type="button" class="button-secondary" (click)="logout.emit()">
          Salir
        </button>
      </div>
    } @else {
      <a routerLink="/login" class="button-primary">Iniciar sesión</a>
    }
  `
})
export class UserMenu {
  readonly user = input<AuthUser | null>(null);
  readonly isAuthenticated = input(false);
  readonly avatarUrl = input<string | null>(null);
  readonly profileName = input<string | null>(null);
  readonly logout = output<void>();

  private readonly displayName = computed(
    () => this.profileName()?.trim() || this.user()?.name?.trim() || ''
  );

  private readonly failedSrc = signal<string | null>(null);

  protected readonly avatarSrc = computed(() => {
    const custom = this.avatarUrl();
    if (custom && this.failedSrc() !== custom) return custom;
    return '';
  });

  protected readonly showAvatarImage = computed(() => this.avatarSrc() !== '');

  protected readonly initials = computed(() => {
    const name = this.displayName();
    if (!name) return '?';

    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? parts[1]?.[0] ?? '' : '';

    return (first + second).toUpperCase() || '?';
  });

  protected onAvatarError(): void {
    this.failedSrc.set(this.avatarSrc());
  }
}
