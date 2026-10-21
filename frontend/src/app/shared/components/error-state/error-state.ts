import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <h2 class="text-lg font-semibold text-red-800">{{ title() }}</h2>
      <p class="mx-auto mt-1 max-w-md text-sm text-red-600">{{ message() }}</p>
      <button type="button" class="button-danger mt-6" (click)="retry.emit()">Reintentar</button>
    </div>
  `
})
export class ErrorState {
  title = input('No se han podido cargar los datos');
  message = input('Inténtalo de nuevo en unos segundos.');
  retry = output<void>();
}
