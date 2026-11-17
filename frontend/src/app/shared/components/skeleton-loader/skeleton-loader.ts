import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxSkeletonLoaderModule, NgClass],
  template: `
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      @for (item of items(); track item) {
        <div
          class="rounded-2xl border p-4"
          [ngClass]="
            tone() === 'dark'
              ? 'border-[#394239] bg-[#1B211D]'
              : 'border-gray-200 bg-white'
          "
        >
          <ngx-skeleton-loader
            appearance=""
            [theme]="
              tone() === 'dark'
                ? { height: '160px', 'border-radius': '12px', 'background-color': '#273128' }
                : { height: '160px', 'border-radius': '12px' }
            "
          />
          <div class="mt-4 space-y-3">
            <ngx-skeleton-loader
              appearance="line"
              [theme]="
                tone() === 'dark'
                  ? { width: '75%', 'background-color': '#273128' }
                  : { width: '75%' }
              "
            />
            <ngx-skeleton-loader
              appearance="line"
              [theme]="
                tone() === 'dark'
                  ? { width: '50%', 'background-color': '#273128' }
                  : { width: '50%' }
              "
            />
          </div>
        </div>
      }
    </div>
  `
})
export class SkeletonLoader {
  count = input(8);
  tone = input<'light' | 'dark'>('light');

  readonly items = computed(() =>
    Array.from({ length: this.count() }, (_, index) => index)
  );
}
