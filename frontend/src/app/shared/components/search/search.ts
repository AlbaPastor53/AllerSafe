import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';

let nextSearchId = 0;

@Component({
  selector: 'app-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div>
      @if (label()) {
        <label class="form-label" [for]="inputId">{{ label() }}</label>
      }

      <div class="relative">
        <svg
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E7F6F]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>

        <input
          [id]="inputId"
          type="search"
          class="form-input pl-9"
          [placeholder]="placeholder()"
          [attr.aria-label]="label() || placeholder()"
          [formControl]="control"
        />
      </div>
    </div>
  `
})
export class Search {
  value = input('');
  label = input('');
  placeholder = input('Buscar...');

  valueChange = output<string>();

  protected readonly inputId = `catalog-search-${nextSearchId++}`;
  protected readonly control = new FormControl('', { nonNullable: true });

  constructor() {
    this.control.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => this.valueChange.emit(value));

    effect(() => {
      const external = this.value();
      if (external !== this.control.value) {
        this.control.setValue(external, { emitEvent: false });
      }
    });
  }
}
