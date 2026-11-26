import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  Comment,
  commentAuthorName,
  commentStars
} from '../../../../core/models/comment.model';
import { CommentsService } from '../../../../core/services/comments.service';
import { formatDate } from '../../../../shared/utils/format.util';

@Component({
  selector: 'app-comments-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details
      class="group overflow-hidden rounded-2xl border border-[#4A3827] bg-[#24170F] transition-colors hover:border-brand/50 open:border-brand/50"
      (toggle)="onToggle($event)"
    >
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[#2E2418] [&::-webkit-details-marker]:hidden"
      >
        <span class="flex items-center gap-3">
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-base text-[#E0BD78]"
            aria-hidden="true"
          >
            ★
          </span>
          <span>
            <span class="block font-semibold text-[#F5F0E6]">Opiniones</span>
            <span class="block text-xs text-[#8E7F6F]">
              Lo que dicen los viajeros
            </span>
          </span>
          <span
            class="rounded-full border border-[#5A4530] bg-[#2E2418] px-2.5 py-0.5 text-xs font-medium text-[#E0BD78]"
          >
            {{ count() }}
          </span>
        </span>

        <span
          class="text-xl leading-none text-[#A99C8E] transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        >
          ▾
        </span>
      </summary>

      <div class="border-t border-[#4A3827] px-5 py-4">
        @if (loading()) {
          <p class="text-sm text-[#A99C8E]">Cargando opiniones…</p>
        } @else if (error()) {
          <p class="text-sm text-[#F0BDB2]">{{ error() }}</p>
        } @else if (comments().length === 0) {
          <p class="text-sm text-[#A99C8E]">
            Todavía no hay opiniones sobre esta experiencia.
          </p>
        } @else {
          <ul class="space-y-3">
            @for (comment of comments(); track comment._id) {
              <li class="rounded-xl border border-[#4A3827] bg-[#2E2418] p-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <span
                      class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-semibold text-[#E0BD78]"
                      aria-hidden="true"
                    >
                      {{ initial(author(comment)) }}
                    </span>
                    <div>
                      <p class="font-medium text-[#F5F0E6]">{{ author(comment) }}</p>
                      <p class="mt-0.5 text-xs text-[#8E7F6F]">
                        {{ date(comment.created_at) }}
                      </p>
                    </div>
                  </div>

                  <span
                    class="whitespace-nowrap rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-[#E0BD78]"
                  >
                    {{ stars(comment.rating) }}
                  </span>
                </div>

                <p
                  class="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#D9CDBD]"
                >
                  {{ comment.comment }}
                </p>
              </li>
            }
          </ul>
        }
      </div>
    </details>
  `
})
export class CommentsAccordion {
  readonly eventId = input.required<string>();
  readonly total = input(0);

  private readonly commentsService = inject(CommentsService);

  readonly comments = signal<Comment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  protected readonly author = commentAuthorName;
  protected readonly stars = commentStars;
  protected readonly date = formatDate;

  protected readonly initial = (name: string): string =>
    name.trim().charAt(0).toUpperCase() || '?';

  private open = false;
  private loaded = false;

  protected count(): number {
    return this.loaded ? this.comments().length : this.total();
  }

  protected onToggle(event: Event): void {
    this.open = (event.target as HTMLDetailsElement).open;
    if (this.open && !this.loaded) void this.load();
  }

  /** Vuelve a consultar el backend cuando se publica un comentario. */
  refresh(): void {
    if (this.open) void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const comments = await firstValueFrom(this.commentsService.list(this.eventId()));
      this.comments.set(comments);
      this.loaded = true;
    } catch {
      this.error.set('No se han podido cargar las opiniones.');
    } finally {
      this.loading.set(false);
    }
  }
}
