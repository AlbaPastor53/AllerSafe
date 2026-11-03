import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-6"
        role="presentation"
        (click)="closed.emit()"
      >
        <div
          class="my-6 w-full max-w-2xl rounded-2xl border border-[#394239] bg-[#1B211D] shadow-2xl shadow-black/40"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between gap-3 border-b border-[#394239] px-5 py-3">
            <h2 class="text-base font-semibold text-[#F5F0E6]">{{ title() }}</h2>

            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-lg border border-[#414940] text-[#F5F0E6] transition-colors hover:bg-[#273128]"
              aria-label="Cerrar"
              (click)="closed.emit()"
            >
              <svg
                class="h-4 w-4"
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

          <div class="p-5">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `
})
export class Modal {
  readonly open = input(false);
  readonly title = input('');
  readonly closed = output<void>();
}
