import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Event,
  eventCoverImage,
  eventHostName,
  eventLocationName
} from '../../../../core/models/event.model';
import { Card } from '../../../../shared/components/card/card';
import { formatDate, formatPrice } from '../../../../shared/utils/format.util';

@Component({
  selector: 'app-experience-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card],
  template: `
    <a [routerLink]="['/shop', event().slug]" class="block h-full">
      <app-card
        [imageUrl]="cover()?.url ?? null"
        [imageAlt]="cover()?.alt || event().name"
        [title]="event().name"
        [subtitle]="locationName()"
        [badge]="categoryLabel()"
        [initial]="initial()"
        [variant]="variant()"
      >
        <div class="space-y-1">
          <p class="truncate text-xs text-[#A9B1A6]">{{ hostName() }}</p>

          <div class="flex items-center justify-between gap-3">
            <span class="text-xs text-[#A9B1A6]">{{ dateLabel() }}</span>
            <span class="font-semibold text-[#D6B66E]">{{ priceLabel() }}</span>
          </div>
        </div>
      </app-card>
    </a>
  `
})
export class ExperienceCard {
  event = input.required<Event>();
  variant = input<'default' | 'large'>('default');

  protected readonly cover = computed(() => eventCoverImage(this.event()));
  protected readonly hostName = computed(() => eventHostName(this.event()));
  protected readonly locationName = computed(() => eventLocationName(this.event()));
  protected readonly categoryLabel = computed(
    () => this.event().categories?.[0]?.name ?? null
  );
  protected readonly dateLabel = computed(() => formatDate(this.event().date));
  protected readonly priceLabel = computed(() => formatPrice(this.event().price));
  protected readonly initial = computed(
    () => this.event().name.trim().charAt(0).toUpperCase() || null
  );
}
