import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading.active()) {
      <div class="fixed inset-x-0 top-0 z-50 h-1 bg-brand/20">
        <div class="h-full w-full animate-pulse bg-brand"></div>
      </div>
    }
  `
})
export class Loader {
  protected readonly loading = inject(LoadingService);
}
