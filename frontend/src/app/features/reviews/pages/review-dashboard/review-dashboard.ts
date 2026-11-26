import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  SentimentAnalysis,
  SentimentLabel
} from '../../../../core/models/comment.model';
import { Event } from '../../../../core/models/event.model';
import { CommentsService } from '../../../../core/services/comments.service';
import { EventsService } from '../../../../core/services/events.service';

@Component({
  selector: 'app-review-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-[#F5F0E6]">
        Sentimiento de opiniones
      </h1>
      <p class="mt-1 text-sm text-[#A99C8E]">
        Analiza solo los comentarios activos de una experiencia.
      </p>

      <div class="mt-6 flex flex-col gap-3 sm:flex-row">
        <select
          class="form-input"
          [value]="selectedId()"
          (change)="onSelect($any($event.target).value)"
        >
          <option value="">Selecciona una experiencia</option>
          @for (event of events(); track event._id) {
            <option [value]="event._id">{{ event.name }}</option>
          }
        </select>

        <button
          type="button"
          class="button-primary"
          [disabled]="!selectedId() || loading()"
          (click)="analyze()"
        >
          {{ loading() ? 'Analizando…' : 'Analizar' }}
        </button>
      </div>

      @if (error()) {
        <p class="mt-4 text-sm text-[#F0BDB2]">{{ error() }}</p>
      }

      @if (analysis(); as data) {
        <div class="mt-6 rounded-2xl border border-[#4A3827] bg-[#24170F] p-6">
          @if (!data.enoughData) {
            <p class="text-sm text-[#F0BDB2]">{{ data.message }}</p>
          } @else {
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="text-xl font-semibold">Sentimiento general</h2>
              <span
                class="rounded-full px-3 py-1 text-sm font-medium"
                [class]="sentimentClass(data.sentiment)"
              >
                {{ data.sentiment }}
              </span>
            </div>

            <p class="mt-2 text-sm text-[#A99C8E]">
              {{ data.analyzed }} comentarios analizados de {{ data.total }} activos
            </p>

            <div class="mt-4 space-y-2">
              @for (item of data.sentiments; track item.label) {
                <div class="flex items-center gap-3 text-sm">
                  <span class="w-24 text-[#D9CDBD]">{{ item.label }}</span>
                  <div class="h-2 flex-1 rounded-full bg-[#3A291D]">
                    <div
                      class="h-2 rounded-full bg-[#E0BD78]"
                      [style.width.%]="item.percentage"
                    ></div>
                  </div>
                  <span class="w-20 text-right text-[#A99C8E]">
                    {{ item.count }} · {{ item.percentage }}%
                  </span>
                </div>
              }
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl bg-[#2E2418] p-4">
                <h3 class="text-sm font-semibold text-[#D6E0B8]">Aspectos positivos</h3>
                <p class="mt-1 text-sm leading-relaxed text-[#D9CDBD]">
                  {{ data.positiveAspects || 'No se han detectado aspectos positivos.' }}
                </p>
              </div>
              <div class="rounded-xl bg-[#2E211B] p-4">
                <h3 class="text-sm font-semibold text-[#F0BDB2]">Aspectos negativos</h3>
                <p class="mt-1 text-sm leading-relaxed text-[#D9CDBD]">
                  {{ data.negativeAspects || 'No se han detectado aspectos negativos.' }}
                </p>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `
})
export class ReviewDashboard implements OnInit {
  private readonly eventsService = inject(EventsService);
  private readonly commentsService = inject(CommentsService);

  protected readonly events = signal<Event[]>([]);
  protected readonly selectedId = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly analysis = signal<SentimentAnalysis | null>(null);

  ngOnInit(): void {
    void this.loadEvents();
  }

  protected onSelect(value: string): void {
    this.selectedId.set(value);
    this.analysis.set(null);
  }

  protected async analyze(): Promise<void> {
    const eventId = this.selectedId();
    if (!eventId) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      this.analysis.set(await firstValueFrom(this.commentsService.sentiment(eventId)));
    } catch {
      this.error.set('No se ha podido analizar el sentimiento. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  protected sentimentClass(label: SentimentLabel | null): string {
    if (label === 'Positivo') return 'bg-[#2E3A22] text-[#D6E0B8]';
    if (label === 'Negativo') return 'bg-[#3A211A] text-[#F0BDB2]';
    return 'bg-[#3A291D] text-[#E0BD78]';
  }

  private async loadEvents(): Promise<void> {
    try {
      this.events.set(await firstValueFrom(this.eventsService.list()));
    } catch {
      this.error.set('No se ha podido cargar la lista de experiencias.');
    }
  }
}
