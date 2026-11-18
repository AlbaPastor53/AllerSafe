import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div
      class="rounded-2xl border px-6 py-16 text-center"
      [ngClass]="
        tone() === 'dark'
          ? 'border-[#4A3827] bg-[#24170F]'
          : 'border-dashed border-gray-300 bg-white'
      "
    >
      <h2
        class="text-lg font-semibold"
        [ngClass]="tone() === 'dark' ? 'text-[#F5F0E6]' : 'text-gray-900'"
      >
        {{ title() }}
      </h2>
      <p
        class="mx-auto mt-1 max-w-md text-sm"
        [ngClass]="tone() === 'dark' ? 'text-[#A99C8E]' : 'text-gray-500'"
      >
        {{ message() }}
      </p>
      <div class="mt-6"><ng-content /></div>
    </div>
  `
})
export class EmptyState {
  title = input('No hay eventos todavía');
  message = input('Crea un evento para empezar a trabajar con la API.');
  tone = input<'light' | 'dark'>('light');
}
