import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  ShopActiveFilter,
  ShopFilterKey
} from '../../../../core/models/shop.model';

@Component({
  selector: 'app-active-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (filters().length > 0) {
      <div class="flex flex-wrap items-center gap-2">
        <span
          class="text-xs font-semibold uppercase tracking-wider text-[#899188]"
        >
          Filtros activos
        </span>

        @for (filter of filters(); track filter.key) {
          <span
            class="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-medium text-[#D6B66E]"
          >
            <span>{{ filter.label }}: {{ filter.value }}</span>

            <button
              type="button"
              class="grid h-5 w-5 place-items-center rounded-full text-[#D6B66E] transition-colors hover:bg-brand/20"
              [attr.aria-label]="'Quitar filtro ' + filter.label"
              (click)="remove.emit(filter.key)"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </span>
        }

        <button
          type="button"
          class="text-xs font-medium text-brand transition-colors hover:text-[#D6B66E]"
          (click)="clear.emit()"
        >
          Limpiar todo
        </button>
      </div>
    }
  `
})
export class ActiveFilters {
  filters = input<readonly ShopActiveFilter[]>([]);

  remove = output<ShopFilterKey>();
  clear = output<void>();
}
