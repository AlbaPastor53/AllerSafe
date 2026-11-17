import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div
      class="rounded-2xl border px-6 py-12 text-center"
      [ngClass]="
        tone() === 'dark'
          ? 'border-[#70404A] bg-[#352329]'
          : 'border-red-200 bg-red-50'
      "
    >
      <h2
        class="text-lg font-semibold"
        [ngClass]="tone() === 'dark' ? 'text-[#F0B7BF]' : 'text-red-800'"
      >
        {{ title() }}
      </h2>
      <p
        class="mx-auto mt-1 max-w-md text-sm"
        [ngClass]="tone() === 'dark' ? 'text-[#E3A6AF]' : 'text-red-600'"
      >
        {{ message() }}
      </p>
      <button type="button" class="button-danger mt-6" (click)="retry.emit()">
        Reintentar
      </button>
    </div>
  `
})
export class ErrorState {
  title = input('No se han podido cargar los datos');
  message = input('Inténtalo de nuevo en unos segundos.');
  tone = input<'light' | 'dark'>('light');
  retry = output<void>();
}
