import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, RouterLink, RouterLinkActive],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        (click)="close.emit()"
        aria-hidden="true"
      ></div>
    }

    <aside
      id="app-sidebar"
      [ngClass]="open() ? 'translate-x-0' : '-translate-x-full'"
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#394239] bg-[#151A17] transition-transform duration-200 ease-out lg:translate-x-0"
      aria-label="Navegación principal"
    >
      <div class="flex h-16 shrink-0 items-center gap-2 border-b border-[#394239] px-4">
        <a
          routerLink="/departures"
          class="flex items-center gap-2 text-lg font-semibold text-[#F5F0E6]"
          (click)="close.emit()"
        >
          <img
            src="logo.png"
            alt="AllerSafe"
            width="32"
            height="32"
            class="h-8 w-8 rounded-lg object-cover"
          />
          <span>AllerSafe</span>
        </a>

        <button
          type="button"
          class="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-[#414940] text-[#F5F0E6] transition-colors hover:bg-[#273128] lg:hidden"
          (click)="close.emit()"
          aria-label="Cerrar menú de navegación"
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
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <a
          routerLink="/departures"
          routerLinkActive="bg-[#273128] text-brand"
          [routerLinkActiveOptions]="{ exact: true }"
          class="block rounded-lg px-3 py-2 text-sm font-medium text-[#C2C9BF] transition-colors hover:bg-[#273128] hover:text-[#D6B66E]"
          (click)="close.emit()"
        >
          Clases
        </a>

        @if (isAdmin()) {
          <div class="pt-3">
            <p class="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[#899188]">
              Administración
            </p>

            @for (link of adminLinks; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-[#273128] text-brand"
                class="block rounded-lg px-3 py-2 text-sm font-medium text-[#C2C9BF] transition-colors hover:bg-[#273128] hover:text-[#D6B66E]"
                (click)="close.emit()"
              >
                {{ link.label }}
              </a>
            }
          </div>
        }

        <a
          routerLink="/profile"
          routerLinkActive="bg-[#273128] text-brand"
          class="block rounded-lg px-3 py-2 text-sm font-medium text-[#C2C9BF] transition-colors hover:bg-[#273128] hover:text-[#D6B66E]"
          (click)="close.emit()"
        >
          Perfil
        </a>
      </nav>

      @if (isAdmin()) {
        <div class="shrink-0 border-t border-[#394239] p-3">
          <a
            routerLink="/events/create"
            routerLinkActive="text-brand"
            class="button-primary w-full"
            (click)="close.emit()"
          >
            + Nuevo evento
          </a>
        </div>
      }
    </aside>
  `
})
export class Sidebar {
  private readonly auth = inject(AuthService);

  readonly open = input(false);
  readonly close = output<void>();

  protected readonly isAdmin = this.auth.isAdmin;

  protected readonly adminLinks = [
    { path: '/events', label: 'Eventos' },
    { path: '/categories', label: 'Categorías' },
    { path: '/locations', label: 'Ubicaciones' },
    { path: '/hosts', label: 'Anfitriones' },
    { path: '/users', label: 'Usuarios' }
  ];
}
