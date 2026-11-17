import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  options: readonly FilterOption[];
}

@Component({
  selector: 'app-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-[#394239] bg-[#1B211D] p-4">
      <div class="flex flex-wrap items-end gap-4">
        @for (field of fields(); track field.key) {
          <div class="min-w-40 flex-1">
            <label class="form-label" [for]="'filter-' + field.key">
              {{ field.label }}
            </label>

            <select
              [id]="'filter-' + field.key"
              class="form-input"
              (change)="onChange(field.key, $event)"
            >
              <option value="" [selected]="!value()[field.key]">
                {{ emptyLabel() }}
              </option>
              @for (option of field.options; track option.value) {
                <option
                  [value]="option.value"
                  [selected]="value()[field.key] === option.value"
                >
                  {{ option.label }}
                </option>
              }
            </select>
          </div>
        }

        @if (showClear()) {
          <button type="button" class="button-secondary" (click)="clear.emit()">
            Limpiar filtros
          </button>
        }
      </div>
    </div>
  `
})
export class Filters {
  fields = input<readonly FilterField[]>([]);
  value = input<Record<string, string>>({});
  emptyLabel = input('Todas');
  showClear = input(true);

  valueChange = output<Record<string, string>>();
  clear = output<void>();

  protected onChange(key: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.valueChange.emit({ ...this.value(), [key]: value });
  }
}
