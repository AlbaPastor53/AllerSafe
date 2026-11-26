import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatPrice } from '../../../shared/utils/format.util';

@Component({
  selector: 'app-cart-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wider text-brand">
            Carrito
          </p>
          <h1 class="mt-2 text-3xl font-semibold">Tus reservas</h1>
        </div>

        <a routerLink="/shop" class="button-secondary">Seguir explorando</a>
      </div>

      <div class="rounded-2xl border border-[#4A3827] bg-[#24170F] p-6">
        <div
          class="mb-6 flex items-center gap-4 rounded-xl border border-brand/40 bg-brand/10 px-4 py-3"
        >
          <span
            class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-gray-950"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3v3Z" />
              <path d="M9 6v12" stroke-dasharray="2 2" />
            </svg>
          </span>

          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wider text-[#A99C8E]"
            >
              Salidas reservadas
            </p>
            <p class="text-2xl font-semibold text-[#E0BD78]">
              {{ departureCount() }}
            </p>
          </div>
        </div>

        <ng-content />

        <div
          class="mt-6 flex flex-wrap justify-between gap-3 border-t border-[#4A3827] pt-4 text-sm"
        >
          <span class="text-[#A99C8E]">Productos: {{ totalProducts() }}</span>
          <span class="font-semibold text-[#E0BD78]">
            Total: {{ formatPrice(totalPrice()) }}
          </span>
        </div>
      </div>
    </section>
  `
})
export class Layout {
  readonly departureCount = input(0);
  readonly totalProducts = input(0);
  readonly totalPrice = input(0);

  protected readonly formatPrice = formatPrice;
}
