import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Carousel } from '../../../../shared/components/carousel/carousel';
import { Card } from '../../../../shared/components/card/card';

export interface FilterCarouselItem {
  id: string;
  title: string;
  subtitle?: string | null;
  initial?: string | null;
}

@Component({
  selector: 'app-filter-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Carousel, Card],
  template: `
    <app-carousel
      [title]="title()"
      [subtitle]="subtitle()"
      [loading]="loading()"
      [error]="error()"
      [itemCount]="items().length"
      [emptyTitle]="emptyTitle()"
      [emptyMessage]="emptyMessage()"
      (retry)="retry.emit()"
    >
      @for (item of items(); track item.id) {
        <button
          type="button"
          class="block w-56 shrink-0 snap-start text-left"
          (click)="select.emit(item.id)"
        >
          <app-card
            [title]="item.title"
            [subtitle]="item.subtitle ?? null"
            [initial]="item.initial ?? null"
          />
        </button>
      }
    </app-carousel>
  `
})
export class FilterCarousel {
  title = input('');
  subtitle = input<string | null>(null);
  items = input<readonly FilterCarouselItem[]>([]);
  loading = input(false);
  error = input<string | null>(null);
  emptyTitle = input('Sin resultados');
  emptyMessage = input('Todavía no hay elementos disponibles.');

  select = output<string>();
  retry = output<void>();
}
