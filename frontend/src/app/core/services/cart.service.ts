import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Cart } from '../models/cart.model';

function extractCart(response: ApiResponse<Cart> | null | undefined): Cart {
  const data = response?.data;
  if (!data?._id) throw new Error('INVALID_RESPONSE');
  return data;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = inject(ApiService);

  get(): Observable<Cart> {
    return this.api.get<ApiResponse<Cart>>('cart').pipe(map(extractCart));
  }

  addItem(departureId: string): Observable<Cart> {
    return this.api
      .post<ApiResponse<Cart>>('cart/items', { departure: departureId })
      .pipe(map(extractCart));
  }
}
