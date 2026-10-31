import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-40 border-b border-[#394239] bg-[#151A17]/95 backdrop-blur">
      <nav
        class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Navegación principal"
      >
        <a routerLink="/routes" class="flex items-center gap-2 text-lg font-semibold text-[#F5F0E6]">
          <img
            src="logo.png"
            alt="AllerSafe"
            width="32"
            height="32"
            class="h-8 w-8 rounded-lg object-cover"
          />
          <span class="hidden sm:inline">AllerSafe</span>
        </a>

        <div class="hidden items-center gap-2 sm:flex">
          <a
            routerLink="/routes"
            routerLinkActive="text-brand"
            [routerLinkActiveOptions]="{ exact: true }"
            class="rounded-full px-4 py-2 text-sm font-medium text-[#C2C9BF] transition-colors hover:bg-[#273128] hover:text-[#D6B66E]"
          >
            Eventos
          </a>

          @if (isAdmin()) {
            <a routerLink="/routes/create" class="button-primary">+ Nuevo evento</a>
          }

          <div class="ml-2 flex items-center gap-3 border-l border-[#394239] pl-3">
            <div class="text-right">
              <p class="max-w-44 truncate text-sm font-medium text-[#F5F0E6]">
                {{ user()?.name }}
              </p>
              <p class="text-xs text-[#A8B0A5]">{{ user()?.role }}</p>
            </div>
            <button
              type="button"
              class="button-secondary"
              (click)="logout()"
            >
              Salir
            </button>
          </div>
        </div>

        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-lg border border-[#414940] text-[#F5F0E6] transition-colors hover:bg-[#273128] sm:hidden"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="mobile-menu"
          [attr.aria-label]="
            menuOpen() ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
          "
        >
          @if (menuOpen()) {
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          } @else {
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
          }
        </button>
      </nav>

      @if (menuOpen()) {
        <div id="mobile-menu" class="space-y-1 border-t border-[#394239] px-4 py-3 sm:hidden">
          <a
            routerLink="/routes"
            routerLinkActive="bg-[#273128] text-brand"
            [routerLinkActiveOptions]="{ exact: true }"
            class="block rounded-lg px-3 py-2 text-sm font-medium text-[#C2C9BF] transition-colors hover:bg-[#273128]"
            (click)="menuOpen.set(false)"
          >
            Eventos
          </a>

          @if (isAdmin()) {
            <a
              routerLink="/routes/create"
              routerLinkActive="bg-[#273128] text-brand"
              class="block rounded-lg px-3 py-2 text-sm font-medium text-[#C2C9BF] transition-colors hover:bg-[#273128]"
              (click)="menuOpen.set(false)"
            >
              + Nuevo evento
            </a>
          }

          <div class="mt-2 flex items-center justify-between gap-3 border-t border-[#394239] pt-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-[#F5F0E6]">
                {{ user()?.name }}
              </p>
              <p class="text-xs text-[#A8B0A5]">{{ user()?.email }}</p>
            </div>
            <button type="button" class="button-secondary" (click)="logout()">
              Salir
            </button>
          </div>
        </div>
      }
    </header>
  `
})
export class Navbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);
  protected readonly user = this.auth.user;
  protected readonly isAdmin = this.auth.isAdmin;

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
