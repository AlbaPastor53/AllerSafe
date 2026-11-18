import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <article
      class="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#4A3827] bg-[#24170F] transition-colors hover:border-brand/60"
    >
      <div
        class="relative overflow-hidden bg-[#3A291D]"
        [ngClass]="variant() === 'large' ? 'h-64 sm:h-80' : 'h-40'"
      >
        @if (imageUrl(); as url) {
          <img
            [src]="url"
            [alt]="imageAlt()"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        } @else {
          <div class="grid h-full place-items-center text-4xl font-semibold text-[#E0BD78]">
            {{ initial() || '·' }}
          </div>
        }

        @if (badge(); as badgeLabel) {
          <span
            class="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-[#17130F]/85 px-2.5 py-1 text-xs font-medium text-[#E0BD78]"
          >
            {{ badgeLabel }}
          </span>
        }
      </div>

      <div
        class="flex flex-1 flex-col gap-2"
        [ngClass]="variant() === 'large' ? 'p-6' : 'p-4'"
      >
        <h3
          class="line-clamp-2 font-semibold text-[#F5F0E6]"
          [ngClass]="variant() === 'large' ? 'text-xl sm:text-2xl' : 'text-base'"
        >
          {{ title() }}
        </h3>

        @if (subtitle(); as description) {
          <p class="line-clamp-2 text-sm text-[#A99C8E]">{{ description }}</p>
        }

        <div class="mt-auto pt-2 text-sm">
          <ng-content />
        </div>
      </div>
    </article>
  `
})
export class Card {
  imageUrl = input<string | null>(null);
  imageAlt = input('');
  title = input('');
  subtitle = input<string | null>(null);
  badge = input<string | null>(null);
  initial = input<string | null>(null);
  variant = input<'default' | 'large'>('default');
}
