import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _count = signal(0);

  readonly active = computed(() => this._count() > 0);

  show(): void {
    this._count.update((count) => count + 1);
  }

  hide(): void {
    this._count.update((count) => Math.max(0, count - 1));
  }
}
