import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { EmptyState } from '../empty-state/empty-state';
import { ErrorState } from '../error-state/error-state';

@Component({
  selector: 'app-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, EmptyState, ErrorState],
  styles: [
    `
      .carousel-track {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .carousel-track::-webkit-scrollbar {
        display: none;
      }
    `
  ],
  template: `
    <section class="space-y-6">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold text-[#F5F0E6]">{{ title() }}</h2>
          @if (subtitle(); as description) {
            <p class="mt-2 text-sm text-[#A99C8E]">{{ description }}</p>
          }
        </div>

        @if (!loading() && !error() && itemCount() > 1) {
          <div class="flex shrink-0 gap-2">
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-lg border border-[#5A4530] text-[#F5F0E6] transition-colors hover:bg-[#3A291D]"
              aria-label="Ver elementos anteriores"
              (click)="scroll(-1)"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-lg border border-[#5A4530] text-[#F5F0E6] transition-colors hover:bg-[#3A291D]"
              aria-label="Ver más elementos"
              (click)="scroll(1)"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        }
      </div>

      @if (loading()) {
        <div class="flex gap-4 overflow-hidden">
          @for (item of skeletons; track item) {
            <div
              class="shrink-0 animate-pulse rounded-2xl border border-[#4A3827] bg-[#24170F]"
              [ngClass]="
                variant() === 'large' ? 'h-80 w-full' : 'h-64 w-64'
              "
            ></div>
          }
        </div>
      } @else if (error()) {
        <app-error-state
          tone="dark"
          [message]="error() ?? ''"
          (retry)="retry.emit()"
        />
      } @else if (itemCount() === 0) {
        <app-empty-state
          tone="dark"
          [title]="emptyTitle()"
          [message]="emptyMessage()"
        />
      } @else {
        <div
          #track
          class="carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto"
          (scroll)="onScroll()"
        >
          <ng-content />
        </div>

        @if (variant() === 'large' && itemCount() > 1) {
          <div class="flex flex-wrap items-center justify-center gap-2">
            @for (dot of dots(); track dot) {
              <button
                type="button"
                class="h-2 rounded-full transition-all"
                [ngClass]="
                  dot === activeIndex()
                    ? 'w-6 bg-[#E0BD78]'
                    : 'w-2 bg-[#5A4530] hover:bg-[#6B5335]'
                "
                [attr.aria-label]="'Ver experiencia ' + (dot + 1)"
                [attr.aria-current]="dot === activeIndex() ? 'true' : null"
                (click)="goTo(dot)"
              ></button>
            }
          </div>
        }
      }
    </section>
  `
})
export class Carousel {
  title = input('');
  subtitle = input<string | null>(null);
  loading = input(false);
  error = input<string | null>(null);
  itemCount = input(0);
  emptyTitle = input('Sin resultados');
  emptyMessage = input('Todavía no hay elementos disponibles.');
  variant = input<'default' | 'large'>('default');

  retry = output<void>();

  protected readonly skeletons = [0, 1, 2, 3];
  protected readonly activeIndex = signal(0);
  protected readonly dots = computed(() =>
    Array.from({ length: this.itemCount() }, (_, index) => index)
  );

  private readonly track = viewChild<ElementRef<HTMLDivElement>>('track');

  constructor() {
    effect(
      () => {
        this.itemCount();
        this.activeIndex.set(0);
      },
      { allowSignalWrites: true }
    );
  }

  protected onScroll(): void {
    const track = this.track()?.nativeElement;
    if (!track) return;

    const step = this.stepSize(track);
    if (step <= 0) return;

    const index = Math.round(track.scrollLeft / step);
    const last = Math.max(0, this.itemCount() - 1);
    this.activeIndex.set(Math.min(Math.max(index, 0), last));
  }

  protected goTo(index: number): void {
    const track = this.track()?.nativeElement;
    if (!track) return;

    const step = this.stepSize(track);
    if (step <= 0) return;

    track.scrollTo({ left: index * step, behavior: 'smooth' });
  }

  protected scroll(direction: number): void {
    const track = this.track()?.nativeElement;
    if (!track) return;

    const step = this.stepSize(track);
    const distance = step > 0 ? step : track.clientWidth * 0.8;

    track.scrollBy({
      left: direction * Math.max(1, distance),
      behavior: 'smooth'
    });
  }

  private stepSize(track: HTMLElement): number {
    const first = track.firstElementChild as HTMLElement | null;
    if (!first) return 0;

    const gap = 16;
    return first.getBoundingClientRect().width + gap;
  }
}
