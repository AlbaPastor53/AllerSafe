import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
      <p class="mx-auto mt-1 max-w-md text-sm text-gray-500">{{ message() }}</p>
      <div class="mt-6"><ng-content /></div>
    </div>
  `
})
export class EmptyState {
  title = input('No hay eventos todavía');
  message = input('Crea un evento para empezar a trabajar con la API.');
}
