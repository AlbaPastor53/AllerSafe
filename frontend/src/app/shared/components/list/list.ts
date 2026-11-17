import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { EmptyState } from '../empty-state/empty-state';
import { ErrorState } from '../error-state/error-state';
import { SkeletonLoader } from '../skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, EmptyState, ErrorState, SkeletonLoader],
  template: `
    @if (loading()) {
      <app-skeleton-loader [tone]="tone()" [count]="skeletonCount()" />
    } @else if (error()) {
      <app-error-state
        [tone]="tone()"
        [message]="error() ?? ''"
        (retry)="retry.emit()"
      />
    } @else if (items().length === 0) {
      <app-empty-state
        [tone]="tone()"
        [title]="emptyTitle()"
        [message]="emptyMessage()"
      />
    } @else {
      <div [ngClass]="layoutClass()">
        <ng-content />
      </div>
    }
  `
})
export class List {
  items = input<readonly unknown[]>([]);
  loading = input(false);
  error = input<string | null>(null);
  emptyTitle = input('Sin resultados');
  emptyMessage = input('Prueba con otros filtros o vuelve más tarde.');
  skeletonCount = input(6);
  tone = input<'light' | 'dark'>('dark');
  layoutClass = input('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3');

  retry = output<void>();
}
