import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal
} from '@angular/core';
import { CommentPayload } from '../../../../core/models/comment.model';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-2xl border border-[#4A3827] bg-[#24170F] p-6">
      <h2 class="text-lg font-semibold">Deja tu opinión</h2>

      <div class="mt-3 flex gap-1" aria-label="Valoración">
        @for (star of stars; track star) {
          <button
            type="button"
            class="text-2xl leading-none transition-colors"
            [style.color]="star <= rating() ? '#E0BD78' : '#5A4530'"
            [attr.aria-label]="star + ' estrellas'"
            (click)="rating.set(star)"
          >
            {{ star <= rating() ? '★' : '☆' }}
          </button>
        }
      </div>

      <textarea
        class="form-input mt-3"
        rows="3"
        maxlength="1000"
        placeholder="Cuéntanos qué te ha parecido la experiencia…"
        [value]="text()"
        (input)="onText($event)"
      ></textarea>

      @if (error()) {
        <p class="mt-2 text-sm text-[#F0BDB2]">{{ error() }}</p>
      }

      <button
        type="button"
        class="button-primary mt-3"
        [disabled]="saving() || text().trim().length < 5"
        (click)="submit()"
      >
        {{ saving() ? 'Publicando…' : 'Publicar opinión' }}
      </button>
    </section>
  `
})
export class CommentForm {
  readonly eventId = input.required<string>();
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly created = output<CommentPayload>();

  readonly stars = [1, 2, 3, 4, 5];
  readonly rating = signal(5);
  readonly text = signal('');

  protected onText(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
  }

  protected submit(): void {
    const comment = this.text().trim();
    if (comment.length < 5) return;

    this.created.emit({
      event_id: this.eventId(),
      rating: this.rating(),
      comment
    });
    this.text.set('');
    this.rating.set(5);
  }
}
