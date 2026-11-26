import { Location as RouterLocation, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import {
  Departure,
  DEPARTURE_STATUS_LABELS,
  DepartureStatus,
  departureAvailableSpots
} from '../../../../core/models/departure.model';
import {
  Event,
  STATUS_LABELS,
  categoryNames
} from '../../../../core/models/event.model';
import { Host, hostDisplayName } from '../../../../core/models/host.model';
import { Location } from '../../../../core/models/location.model';
import { CartStore } from '../../../../core/stores/cart.store';
import { ShopDetailStore } from '../../../../core/stores/shop-detail.store';
import { Carousel } from '../../../../shared/components/carousel/carousel';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import {
  formatDate,
  formatPrice,
  formatTime
} from '../../../../shared/utils/format.util';
import { ChatbotService } from '../../../../core/services/chatbot.service';
import { FaqEventContext, FaqItem } from '../../../../core/models/chatbot.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CommentsService } from '../../../../core/services/comments.service';
import { CommentPayload, RatingSummary } from '../../../../core/models/comment.model';
import { CommentsAccordion } from '../../components/comments-accordion/comments-accordion';
import { CommentForm } from '../../components/comment-form/comment-form';
import { ReviewSummary } from '../../components/review-summary/review-summary';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    RouterLink,
    Carousel,
    EmptyState,
    ErrorState,
    SkeletonLoader,
    CommentsAccordion,
    CommentForm,
    ReviewSummary
  ],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      @if (store.loading()) {
        <app-skeleton-loader tone="dark" [count]="3" />
      } @else if (store.error()) {
        <app-error-state
          tone="dark"
          [message]="store.error() ?? ''"
          (retry)="reload()"
        />
      } @else if (store.notFound() || !event()) {
        <app-empty-state
          tone="dark"
          title="Experiencia no encontrada"
          message="No existe ninguna experiencia publicada con ese identificador."
        >
          <a routerLink="/shop" class="button-primary">Volver a la tienda</a>
        </app-empty-state>
      } @else {
        <nav class="mb-6 flex items-center gap-2 text-sm text-[#A99C8E]">
          <button
            type="button"
            (click)="goBack()"
            class="transition-colors hover:text-[#E0BD78]"
          >
            ← Resultados
          </button>
          <span>/</span>
          <span class="truncate text-[#F5F0E6]">{{ event()!.name }}</span>
        </nav>

        <div
          class="mb-6 flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <p class="text-sm font-semibold uppercase tracking-wider text-brand">
              Experiencia
            </p>

            <h1 class="mt-2 text-3xl font-semibold sm:text-4xl">
              {{ event()!.name }}
            </h1>

            <div
              class="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#A99C8E]"
            >
              <span
                class="rounded-full border border-[#5A4530] px-3 py-1"
              >
                {{ categoryNames(event()!.categories) }}
              </span>
              <span>{{ hostName() }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ locationName() }}</span>
            </div>
          </div>

          <span
            class="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-sm font-medium text-[#E0BD78]"
          >
            {{ STATUS_LABELS[event()!.status] }}
          </span>
        </div>

        <div class="grid gap-8 lg:grid-cols-3">
          <div class="lg:col-span-2">
            <app-carousel
              title="Galería"
              [itemCount]="images().length"
              emptyTitle="Sin imágenes"
              emptyMessage="Esta experiencia todavía no tiene imágenes."
            >
              @for (image of images(); track image._id) {
                <div
                  class="w-full shrink-0 snap-start overflow-hidden rounded-2xl border border-[#4A3827] bg-[#24170F]"
                >
                  <img
                    [src]="image.url"
                    [alt]="image.alt || event()!.name"
                    loading="lazy"
                    class="h-72 w-full object-cover sm:h-96"
                  />
                </div>
              }
            </app-carousel>
          </div>

          <aside class="space-y-4">
            <div
              class="flex h-full flex-col rounded-2xl border border-[#4A3827] bg-[#24170F] p-6"
            >
              <p class="text-sm text-[#A99C8E]">Precio</p>
              <p class="text-3xl font-semibold text-[#E0BD78]">
                {{ formatPrice(event()!.price) }}
              </p>

              <dl class="mt-4 flex flex-1 flex-col justify-between gap-3 text-sm">
                <div class="flex justify-between gap-4">
                  <dt class="text-[#A99C8E]">Clase</dt>
                  <dd class="text-right text-[#F5F0E6]">
                    {{ event()!.classNumber }}
                  </dd>
                </div>

                <div class="flex justify-between gap-4">
                  <dt class="text-[#A99C8E]">Capacidad</dt>
                  <dd class="text-right text-[#F5F0E6]">
                    {{ event()!.capacity }} personas
                  </dd>
                </div>

                <div class="flex justify-between gap-4">
                  <dt class="text-[#A99C8E]">Ubicación</dt>
                  <dd class="text-right text-[#F5F0E6]">
                    {{ locationName() }}
                  </dd>
                </div>

                <div class="flex justify-between gap-4">
                  <dt class="text-[#A99C8E]">Salidas</dt>
                  <dd class="text-right text-[#F5F0E6]">
                    {{ store.departures().length }}
                  </dd>
                </div>
              </dl>

            </div>
          </aside>
        </div>

        <section
          class="mt-8 rounded-2xl border border-[#4A3827] bg-[#24170F] p-6"
        >
          <h2 class="text-xl font-semibold">Sobre esta experiencia</h2>
          <p
            class="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#D9CDBD]"
          >
            {{ event()!.description }}
          </p>
        </section>

        <div class="mt-8 grid gap-6 sm:grid-cols-2">
          <section
            class="h-full rounded-2xl border border-[#4A3827] bg-[#24170F] p-6"
          >
            <h2 class="text-base font-semibold">Anfitrión</h2>
            <p class="mt-2 font-medium text-[#E0BD78]">{{ hostName() }}</p>

            @if (host()?.biography; as biography) {
              <p class="mt-2 text-sm leading-relaxed text-[#A99C8E]">
                {{ biography }}
              </p>
            } @else {
              <p class="mt-2 text-sm text-[#A99C8E]">
                Sin biografía disponible.
              </p>
            }
          </section>

          <section
            class="h-full rounded-2xl border border-[#4A3827] bg-[#24170F] p-6"
          >
            <h2 class="text-base font-semibold">Ubicación</h2>

            @if (location(); as place) {
              <p class="mt-2 font-medium text-[#E0BD78]">{{ place.name }}</p>
              <p class="mt-2 text-sm text-[#A99C8E]">{{ place.address }}</p>
            } @else {
              <p class="mt-2 text-sm text-[#A99C8E]">
                Ubicación por confirmar.
              </p>
            }
          </section>
        </div>

        <section
          class="mt-8 rounded-2xl border border-[#4A3827] bg-[#24170F] p-6"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-semibold">Salidas</h2>
            <span class="text-sm text-[#A99C8E]">
              {{ store.departures().length }} programadas
            </span>
          </div>

          @if (reserveMessage()) {
            <p
              role="status"
              class="mt-4 rounded-xl border border-[#5A6A3E] bg-[#2E3A22] px-3 py-2 text-sm text-[#D6E0B8]"
            >
              {{ reserveMessage() }}
            </p>
          }

          @if (!store.hasDepartures()) {
            <p class="mt-4 text-sm text-[#A99C8E]">
              No hay salidas programadas para esta experiencia.
            </p>
          } @else {
            <ul class="mt-2 divide-y divide-[#4A3827]">
              @for (departure of store.departures(); track departure._id) {
                <li
                  class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p class="font-medium text-[#F5F0E6]">
                      {{ departureDateLabel(departure) }}
                    </p>
                    <p class="mt-1 text-sm text-[#A99C8E]">
                      {{ formatTime(departure.start_datetime) }} –
                      {{ formatTime(departure.end_datetime) }} ·
                      {{ departureAvailableSpots(departure) }} plazas
                      disponibles
                    </p>
                  </div>

                  <div class="flex flex-wrap items-center gap-3">
                    <span
                      class="rounded-full px-3 py-1 text-xs font-medium"
                      [ngClass]="statusClass(departure.status)"
                    >
                      {{ DEPARTURE_STATUS_LABELS[departure.status] }}
                    </span>

                    <span class="font-semibold text-[#E0BD78]">
                      {{ formatPrice(departure.price) }}
                    </span>

                    <button
                      type="button"
                      class="button-primary"
                      [disabled]="reservingId() === departure._id"
                      (click)="reserve(departure)"
                    >
                      Reservar
                    </button>
                  </div>
                </li>
              }
            </ul>
          }
        </section>

        <section class="mt-8 grid gap-6 lg:grid-cols-2">
          <app-review-summary class="h-full" [summary]="summary()" />

          <div class="flex flex-col gap-6">
            @if (auth.isAuthenticated()) {
              <app-comment-form
                [eventId]="event()!._id"
                [saving]="commentSaving()"
                [error]="commentError()"
                (created)="onCommentCreated($event)"
              />
            } @else {
              <p class="text-sm text-[#A99C8E]">
                <a routerLink="/login" class="text-[#E0BD78] underline">Inicia sesión</a>
                para dejar tu opinión.
              </p>
            }

            <app-comments-accordion
              [eventId]="event()!._id"
              [total]="summary()?.total ?? 0"
            />
          </div>
        </section>

        <section
          class="mt-8 rounded-2xl border border-[#4A3827] bg-[#24170F] p-6"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-semibold">Preguntas frecuentes</h2>

            <button
              type="button"
              class="button-secondary px-2.5 py-1 text-xs"
              [disabled]="faqsLoading()"
              (click)="reloadFaqs()"
            >
              Regenerar
            </button>
          </div>

          @if (faqsLoading()) {
            <p class="mt-4 text-sm text-[#A99C8E]">Generando preguntas…</p>
          } @else if (faqsError()) {
            <p class="mt-4 text-sm text-[#F0BDB2]">{{ faqsError() }}</p>

            <button
              type="button"
              class="button-secondary mt-3"
              (click)="reloadFaqs()"
            >
              Reintentar
            </button>
          } @else {
            <div class="mt-4 divide-y divide-[#4A3827]">
              @for (faq of faqs(); track $index) {
                <details class="py-3">
                  <summary class="cursor-pointer list-none font-medium text-[#F5F0E6]">
                    {{ faq.question }}
                  </summary>

                  <p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#D9CDBD]">
                    {{ faq.answer }}
                  </p>
                </details>
              } @empty {
                <p class="mt-4 text-sm text-[#A99C8E]">
                  No hay preguntas frecuentes disponibles.
                </p>
              }
            </div>
          }
        </section>
      }
    </section>
  `
})
export class ShopDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly routerLocation = inject(RouterLocation);
  private readonly router = inject(Router);
  private readonly slug = signal('');

  protected readonly store = inject(ShopDetailStore);
  private readonly cartStore = inject(CartStore);

  private readonly chatbotService = inject(ChatbotService);
  private readonly commentsService = inject(CommentsService);
  private readonly commentsAccordion = viewChild(CommentsAccordion);

  protected readonly auth = inject(AuthService);
  protected readonly event = this.store.event;

  protected readonly summary = signal<RatingSummary | null>(null);
  protected readonly commentSaving = signal(false);
  protected readonly commentError = signal<string | null>(null);
  protected readonly reserveMessage = signal<string | null>(null);
  protected readonly reservingId = signal<string | null>(null);

  protected readonly faqs = signal<FaqItem[]>([]);
  protected readonly faqsLoading = signal(false);
  protected readonly faqsError = signal<string | null>(null);

  protected readonly images = computed(() => this.event()?.images ?? []);

  protected readonly host = computed<Host | null>(() => {
    const host = this.event()?.host;
    return host && typeof host !== 'string' ? host : null;
  });

  protected readonly location = computed<Location | null>(() => {
    const location = this.event()?.location;
    return location && typeof location !== 'string' ? location : null;
  });

  protected readonly hostName = computed(() => {
    const host = this.host();
    return host ? hostDisplayName(host) : 'Anfitrión';
  });

  protected readonly locationName = computed(
    () => this.location()?.name ?? 'Ubicación por confirmar'
  );

  protected readonly STATUS_LABELS = STATUS_LABELS;
  protected readonly DEPARTURE_STATUS_LABELS = DEPARTURE_STATUS_LABELS;
  protected readonly categoryNames = categoryNames;
  protected readonly departureAvailableSpots = departureAvailableSpots;
  protected readonly formatDate = formatDate;
  protected readonly formatTime = formatTime;
  protected readonly formatPrice = formatPrice;

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const slug = params.get('slug') ?? '';
        this.slug.set(slug);
        this.store.load(slug);
      });

    toObservable(this.event)
      .pipe(
        filter((event): event is Event => Boolean(event)),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        void this.reloadFaqs(event);
        void this.loadSummary(event._id);
      });
  }

  protected async loadSummary(eventId: string): Promise<void> {
    try {
      this.summary.set(await firstValueFrom(this.commentsService.summary(eventId)));
    } catch {
      this.summary.set(null);
    }
  }

  protected async onCommentCreated(payload: CommentPayload): Promise<void> {
    this.commentSaving.set(true);
    this.commentError.set(null);

    try {
      await firstValueFrom(this.commentsService.create(payload));
      await this.loadSummary(payload.event_id);
      this.commentsAccordion()?.refresh();
    } catch {
      this.commentError.set('No se ha podido publicar la opinión.');
    } finally {
      this.commentSaving.set(false);
    }
  }

  protected async reserve(departure: Departure): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    this.reservingId.set(departure._id);
    this.reserveMessage.set(null);

    const added = await this.cartStore.add(departure._id);
    if (added) {
      this.reserveMessage.set('Reserva añadida al carrito.');
    }

    this.reservingId.set(null);
  }

  protected async reloadFaqs(event = this.event()): Promise<void> {
    if (!event) return;

    this.faqsLoading.set(true);
    this.faqsError.set(null);

    try {
      this.faqs.set(
        await this.chatbotService.getFaqs(this.buildFaqContext(event))
      );
    } catch (error) {
      this.faqs.set([]);
      this.faqsError.set(
        error instanceof Error
          ? error.message
          : 'No se han podido cargar las preguntas frecuentes.'
      );
    } finally {
      this.faqsLoading.set(false);
    }
  }

  private buildFaqContext(event: Event): FaqEventContext {
    const host =
      event.host && typeof event.host !== 'string'
        ? hostDisplayName(event.host)
        : '';
    const location =
      event.location && typeof event.location !== 'string'
        ? event.location.name
        : '';

    return {
      name: event.name,
      description: event.description ?? '',
      categories: (event.categories ?? []).map((category) => category.name),
      host,
      location,
      classNumber: event.classNumber,
      date: '',
      time: '',
      price: event.price,
      capacity: event.capacity
    };
  }

  protected reload(): void {
    this.store.load(this.slug());
  }

  /** Vuelve a la página anterior (la lista conserva sus filtros en la URL). */
  protected goBack(): void {
    this.routerLocation.back();
  }

  protected departureDateLabel(departure: Departure): string {
    const start = this.formatDate(departure.start_datetime);
    const end = this.formatDate(departure.end_datetime);
    return start === end ? start : `${start} – ${end}`;
  }

  protected statusClass(status: DepartureStatus): string {
    switch (status) {
      case 'scheduled':
        return 'bg-[#3A291D] text-[#E0BD78]';
      case 'full':
        return 'bg-[#3A211A] text-[#F0BDB2]';
      case 'cancelled':
        return 'bg-[#3A211A] text-[#F0BDB2]';
      case 'completed':
      default:
        return 'bg-[#24170F] text-[#A99C8E]';
    }
  }
}
