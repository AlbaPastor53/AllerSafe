import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Cart } from '../models/cart.model';
import { CartService } from '../services/cart.service';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly service = inject(CartService);

  private readonly _cart = signal<Cart | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly cart = this._cart.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly totalProducts = computed(() => this._cart()?.total_products ?? 0);
  readonly totalPrice = computed(() => this._cart()?.total_price ?? 0);
  readonly departureCount = computed(() => this._cart()?.items?.length ?? 0);

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      this._cart.set(await firstValueFrom(this.service.get()));
    } catch {
      this._error.set('No se ha podido cargar el carrito.');
    } finally {
      this._loading.set(false);
    }
  }

  async add(departureId: string): Promise<boolean> {
    this._loading.set(true);
    this._error.set(null);

    try {
      this._cart.set(await firstValueFrom(this.service.addItem(departureId)));
      return true;
    } catch {
      this._error.set('No se ha podido añadir la reserva al carrito.');
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  clear(): void {
    this._cart.set(null);
    this._loading.set(false);
    this._error.set(null);
  }
}
