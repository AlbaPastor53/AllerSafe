import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from '../../shared/components/loader/loader';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { UserMenu } from '../../shared/components/user-menu/user-menu';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Sidebar, UserMenu, Loader],
  template: `
    <div class="min-h-screen bg-[#151A17] text-[#F5F0E6]">
      <app-sidebar [open]="menuOpen()" (close)="menuOpen.set(false)" />

      <div class="flex min-h-screen flex-col lg:pl-64">
        <header class="sticky top-0 z-30 border-b border-[#394239] bg-[#151A17]/95 backdrop-blur">
          <div class="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-lg border border-[#414940] text-[#F5F0E6] transition-colors hover:bg-[#273128] lg:hidden"
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

            <div class="ml-auto">
              <app-user-menu />
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
  protected readonly menuOpen = signal(false);
}
