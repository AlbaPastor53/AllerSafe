import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterField, Filters } from '../../../../shared/components/filters/filters';
import { Search } from '../../../../shared/components/search/search';
import {
  SHOP_PRICE_MAX,
  SHOP_PRICE_MIN,
  SHOP_PRICE_STEP
} from '../../../../core/models/shop.model';
import {
  PriceRangeSlider,
  ShopPriceRange
} from '../price-range-slider/price-range-slider';

@Component({
  selector: 'app-shop-filters-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Search, Filters, PriceRangeSlider],
  template: `
    <div class="space-y-4 rounded-2xl border border-[#394239] bg-[#1B211D] p-4">
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <app-search
          label="Buscar"
          placeholder="Buscar por nombre..."
          [value]="searchValue()"
          (valueChange)="searchChange.emit($event)"
        />

        @if (showClear()) {
          <button type="button" class="button-secondary" (click)="clear.emit()">
            Limpiar búsqueda y filtros
          </button>
        }
      </div>

      <app-filters
        [fields]="fields()"
        [value]="values()"
        [showClear]="false"
        (valueChange)="filterChange.emit($event)"
      />

      <div class="flex flex-wrap items-end gap-4">
        <app-price-range-slider
          [minValue]="minPrice()"
          [maxValue]="maxPrice()"
          [boundMin]="priceMin()"
          [boundMax]="priceMax()"
          [step]="priceStep()"
          (rangeChange)="onPriceChange($event)"
        />
      </div>
    </div>
  `
})
export class ShopFiltersBar {
  searchValue = input('');
  fields = input<readonly FilterField[]>([]);
  values = input<Record<string, string>>({});
  minPrice = input(SHOP_PRICE_MIN);
  maxPrice = input(SHOP_PRICE_MAX);
  priceMin = input(SHOP_PRICE_MIN);
  priceMax = input(SHOP_PRICE_MAX);
  priceStep = input(SHOP_PRICE_STEP);
  showClear = input(true);

  searchChange = output<string>();
  filterChange = output<Record<string, string>>();
  priceChange = output<ShopPriceRange>();
  clear = output<void>();

  protected onPriceChange(range: ShopPriceRange): void {
    this.priceChange.emit(range);
  }
}
