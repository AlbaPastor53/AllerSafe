import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxSkeletonLoaderModule],
  template: `
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      @for (item of items(); track item) {
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <ngx-skeleton-loader
            appearance=""
            [theme]="{ height: '160px', 'border-radius': '12px' }"
          />
          <div class="mt-4 space-y-3">
            <ngx-skeleton-loader appearance="line" [theme]="{ width: '75%' }" />
            <ngx-skeleton-loader appearance="line" [theme]="{ width: '50%' }" />
          </div>
        </div>
      }
    </div>
  `
})
export class SkeletonLoader {
  count = input(8);

  readonly items = computed(() =>
    Array.from({ length: this.count() }, (_, index) => index)
  );
}
