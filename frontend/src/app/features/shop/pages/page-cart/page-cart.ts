import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CartStore } from '../../../../core/stores/cart.store';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { Details } from '../../details/details';
import { Layout } from '../../layout/layout';

@Component({
  selector: 'app-page-cart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Layout, Details, ErrorState, SkeletonLoader],
  template: `
    @if (store.loading()) {
      <app-skeleton-loader tone="dark" [count]="3" />
    } @else if (store.error()) {
      <app-error-state
        tone="dark"
        [message]="store.error() ?? ''"
        (retry)="reload()"
      />
    } @else {
      <app-cart-layout
        [departureCount]="store.departureCount()"
        [totalProducts]="store.totalProducts()"
        [totalPrice]="store.totalPrice()"
      >
        <app-cart-details [items]="store.cart()?.items ?? []" />
      </app-cart-layout>
    }
  `
})
export class PageCart implements OnInit {
  protected readonly store = inject(CartStore);

  ngOnInit(): void {
    void this.store.load();
  }

  protected reload(): void {
    void this.store.load();
  }
}
