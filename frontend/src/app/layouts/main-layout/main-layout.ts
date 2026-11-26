import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { CartStore } from '../../core/stores/cart.store';
import { buildProfileName } from '../../shared/utils/avatar.util';
import { Loader } from '../../shared/components/loader/loader';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { UserMenu } from '../../shared/components/user-menu/user-menu';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, Sidebar, UserMenu, Loader],
  template: `
    <div class="min-h-screen bg-[#17130F] text-[#F5F0E6]">
      <app-sidebar
        [open]="menuOpen()"
        [isAuthenticated]="isAuthenticated()"
        (close)="menuOpen.set(false)"
      />

      <div class="flex min-h-screen flex-col lg:pl-64">
        <header class="sticky top-0 z-30 border-b border-[#4A3827] bg-[#17130F]/95 backdrop-blur">
          <div class="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-lg border border-[#5A4530] text-[#F5F0E6] transition-colors hover:bg-[#3A291D] lg:hidden"
              (click)="menuOpen.set(true)"
              aria-controls="app-sidebar"
              aria-label="Abrir menú de navegación"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>

            <div class="ml-auto flex items-center gap-3">
              <app-user-menu
                [user]="user()"
                [isAuthenticated]="isAuthenticated()"
                [avatarUrl]="avatarUrl()"
                [profileName]="profileName()"
                (logout)="logout()"
              />

              @if (isAuthenticated()) {
                <a
                  routerLink="/cart"
                  class="flex items-center gap-2 rounded-lg border border-[#5A4530] px-3 py-2 text-sm font-medium text-[#D9CDBD] transition-colors hover:bg-[#3A291D] hover:text-[#E0BD78]"
                  aria-label="Ver carrito"
                >
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="9" cy="20" r="1" />
                    <circle cx="18" cy="20" r="1" />
                    <path d="M2 3h2l2.4 11.2a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.6L21 7H6" />
                  </svg>
                  <span class="hidden sm:inline">Carrito</span>
                  <span
                    class="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-semibold text-gray-950"
                  >
                    {{ cart.totalProducts() }}
                  </span>
                </a>
              }
            </div>
          </div>
        </header>

        <main class="flex-1">
          <router-outlet />
        </main>
      </div>

      <app-loader />
    </div>
  `
})
export class MainLayout {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  protected readonly cart = inject(CartStore);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);
  protected readonly user = this.auth.user;
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  protected readonly avatarUrl = computed(
    () => this.profileService.profile()?.avatar_url?.trim() || null
  );

  protected readonly profileName = computed(() =>
    buildProfileName(this.profileService.profile())
  );

  constructor() {
    toObservable(this.user)
      .pipe(
        switchMap((user) => {
          if (!user) {
            this.profileService.clear();
            this.cart.clear();
            return of(null);
          }

          void this.cart.load();
          return this.profileService.get().pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed()
      )
      .subscribe();

    void this.auth.initialize().catch(() => undefined);
  }

  protected logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login'])
    });
  }
}
