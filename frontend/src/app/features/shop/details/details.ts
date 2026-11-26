import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CartItem } from '../../../core/models/cart.model';
import {
  Departure,
  departureEventName
} from '../../../core/models/departure.model';
import { EventImage } from '../../../core/models/event-image.model';
import { Event, eventCoverImage } from '../../../core/models/event.model';
import {
  formatDate,
  formatPrice,
  formatTime
} from '../../../shared/utils/format.util';

@Component({
  selector: 'app-cart-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length === 0) {
      <p class="py-8 text-center text-sm text-[#A99C8E]">
        Tu carrito está vacío. Reserva una salida desde la tienda.
      </p>
    } @else {
      <ul class="divide-y divide-[#4A3827]">
        @for (item of items(); track item._id) {
          <li
            class="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-center gap-4">
              <div class="relative h-16 w-16 shrink-0">
                <div
                  class="h-full w-full overflow-hidden rounded-xl border border-[#4A3827] bg-[#3A291D]"
                >
                  @if (cover(item.departure); as image) {
                    <img
                      [src]="image.url"
                      [alt]="image.alt || departureEventName(item.departure)"
                      loading="lazy"
                      class="h-full w-full object-cover"
                    />
                  } @else {
                    <div
                      class="grid h-full place-items-center text-2xl font-semibold text-[#E0BD78]"
                    >
                      {{ initial(item.departure) }}
                    </div>
                  }
                </div>

                <span
                  class="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-brand px-1 text-xs font-semibold text-gray-950"
                >
                  {{ item.quantity }}
                </span>
              </div>

              <div class="min-w-0">
                <p class="truncate font-medium text-[#F5F0E6]">
                  {{ departureEventName(item.departure) }}
                </p>
                <p class="mt-1 text-sm text-[#A99C8E]">
                  {{ formatDate(item.departure.start_datetime) }} ·
                  {{ formatTime(item.departure.start_datetime) }} ·
                  {{ item.capacity }} plazas
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 sm:justify-end">
              <span class="text-sm text-[#A99C8E]">
                {{ formatPrice(item.departure.price) }} / plaza
              </span>
              <span class="font-semibold text-[#E0BD78]">
                {{ formatPrice(item.quantity * item.departure.price) }}
              </span>
            </div>
          </li>
        }
      </ul>
    }
  `
})
export class Details {
  readonly items = input<CartItem[]>([]);

  protected readonly departureEventName = departureEventName;
  protected readonly formatDate = formatDate;
  protected readonly formatTime = formatTime;
  protected readonly formatPrice = formatPrice;

  protected cover(departure: Departure): EventImage | null {
    const event = departure.event;
    return typeof event === 'string' ? null : eventCoverImage(event as Event);
  }

  protected initial(departure: Departure): string {
    return departureEventName(departure).trim().charAt(0).toUpperCase() || '·';
  }
}
