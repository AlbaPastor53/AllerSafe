import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    @if (totalPages() > 1) {
      <nav
        class="flex flex-wrap items-center justify-center gap-2"
        aria-label="Paginación de experiencias"
      >
        <button
          type="button"
          class="button-secondary"
          [disabled]="page() <= 1"
          (click)="go(page() - 1)"
        >
          Anterior
        </button>

        @for (item of pages(); track $index) {
          @if (item === 0) {
            <span class="px-2 text-[#8E7F6F]">…</span>
          } @else {
            <button
              type="button"
              class="grid h-10 min-w-10 place-items-center rounded-xl border px-2 text-sm font-medium transition-colors"
              [ngClass]="
                item === page()
                  ? 'border-brand bg-brand text-gray-950'
                  : 'border-[#5A4530] bg-[#24170F] text-[#F5F0E6] hover:bg-[#3A291D]'
              "
              [attr.aria-current]="item === page() ? 'page' : null"
              (click)="go(item)"
            >
              {{ item }}
            </button>
          }
        }

        <button
          type="button"
          class="button-secondary"
          [disabled]="page() >= totalPages()"
          (click)="go(page() + 1)"
        >
          Siguiente
        </button>
      </nav>
    }
  `
})
export class Pagination {
  page = input(1);
  totalPages = input(0);

  pageChange = output<number>();

  protected readonly pages = computed<number[]>(() => {
    const total = this.totalPages();
    const current = this.page();

    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const result: number[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) result.push(0);

    for (let page = start; page <= end; page += 1) {
      result.push(page);
    }

    if (end < total - 1) result.push(0);

    result.push(total);
    return result;
  });

  protected go(target: number): void {
    const clamped = Math.min(Math.max(1, target), this.totalPages());
    if (clamped !== this.page()) {
      this.pageChange.emit(clamped);
    }
  }
}
