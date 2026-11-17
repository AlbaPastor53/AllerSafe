import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import {
  SHOP_PRICE_MAX,
  SHOP_PRICE_MIN,
  SHOP_PRICE_STEP
} from '../../../../core/models/shop.model';

export interface ShopPriceRange {
  min: number;
  max: number;
}

@Component({
  selector: 'app-price-range-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-56 flex-1' },
  template: `
    <div class="min-w-56 flex-1">
      <div class="flex items-center justify-between gap-3">
        <span class="form-label mb-0">Precio</span>
        <span class="text-xs font-medium text-[#D6B66E]">
          {{ currentMin() }} € – {{ currentMax() }} €
        </span>
      </div>

      <div class="relative mt-4 h-5">
        <div
          class="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#273128]"
        ></div>
        <div
          class="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
          [style.left.%]="leftPercent()"
          [style.right.%]="rightPercent()"
        ></div>

        <input
          type="range"
          class="price-range-input"
          [min]="boundMin()"
          [max]="boundMax()"
          [step]="step()"
          [value]="currentMin()"
          aria-label="Precio mínimo"
          (input)="onMin($event)"
          (change)="commit()"
        />

        <input
          type="range"
          class="price-range-input"
          [min]="boundMin()"
          [max]="boundMax()"
          [step]="step()"
          [value]="currentMax()"
          aria-label="Precio máximo"
          (input)="onMax($event)"
          (change)="commit()"
        />
      </div>
    </div>
  `
})
export class PriceRangeSlider {
  minValue = input(SHOP_PRICE_MIN);
  maxValue = input(SHOP_PRICE_MAX);
  boundMin = input(SHOP_PRICE_MIN);
  boundMax = input(SHOP_PRICE_MAX);
  step = input(SHOP_PRICE_STEP);

  rangeChange = output<ShopPriceRange>();

  protected readonly currentMin = signal(SHOP_PRICE_MIN);
  protected readonly currentMax = signal(SHOP_PRICE_MAX);

  protected readonly leftPercent = computed(() => {
    const span = this.boundMax() - this.boundMin();
    if (span <= 0) return 0;
    return ((this.currentMin() - this.boundMin()) / span) * 100;
  });

  protected readonly rightPercent = computed(() => {
    const span = this.boundMax() - this.boundMin();
    if (span <= 0) return 100;
    return 100 - ((this.currentMax() - this.boundMin()) / span) * 100;
  });

  constructor() {
    effect(
      () => {
        this.currentMin.set(this.minValue());
        this.currentMax.set(this.maxValue());
      },
      { allowSignalWrites: true }
    );
  }

  protected onMin(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.currentMin.set(Math.min(value, this.currentMax()));
  }

  protected onMax(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.currentMax.set(Math.max(value, this.currentMin()));
  }

  protected commit(): void {
    this.rangeChange.emit({
      min: this.currentMin(),
      max: this.currentMax()
    });
  }
}
