import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav
        class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Navegación principal"
      >
        <a routerLink="/routes" class="flex items-center gap-2 text-lg font-semibold text-gray-900">
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
            class="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Eventos
          </a>
          <a routerLink="/routes/create" class="button-primary">+ Nuevo evento</a>
        </div>

        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 text-gray-700 transition-colors hover:bg-gray-100 sm:hidden"
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
        <div id="mobile-menu" class="space-y-1 border-t border-gray-100 px-4 py-3 sm:hidden">
          <a
            routerLink="/routes"
            routerLinkActive="bg-gray-100 text-brand"
            [routerLinkActiveOptions]="{ exact: true }"
            class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            (click)="menuOpen.set(false)"
          >
            Eventos
          </a>
          <a
            routerLink="/routes/create"
            routerLinkActive="bg-gray-100 text-brand"
            class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            (click)="menuOpen.set(false)"
          >
            + Nuevo evento
          </a>
        </div>
      }
    </header>
  `
})
export class Navbar {
  protected readonly menuOpen = signal(false);
}
