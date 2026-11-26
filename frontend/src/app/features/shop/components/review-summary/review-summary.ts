import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RatingSummary } from '../../../../core/models/comment.model';

@Component({
  selector: 'app-review-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (summary(); as data) {
      <section class="h-full rounded-2xl border border-[#4A3827] bg-[#24170F] p-6">
        <h2 class="text-xl font-semibold">Valoraciones</h2>

        <div class="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div class="shrink-0">
            <p class="text-4xl font-semibold text-[#E0BD78]">{{ data.average }}</p>
            <p class="text-sm text-[#A99C8E]">sobre 5</p>
            <p class="mt-1 text-sm text-[#F5F0E6]">
              {{ data.total }} {{ data.total === 1 ? 'valoración' : 'valoraciones' }}
            </p>
          </div>

          <div class="w-full space-y-1.5">
            @for (item of data.distribution; track item.stars) {
              <div class="flex items-center gap-2 text-xs text-[#A99C8E]">
                <span class="w-8">{{ item.stars }} ★</span>
                <div class="h-2 flex-1 rounded-full bg-[#3A291D]">
                  <div
                    class="h-2 rounded-full bg-[#E0BD78]"
                    [style.width.%]="item.percentage"
                  ></div>
                </div>
                <span class="w-10 text-right">{{ item.count }}</span>
                <span class="w-10 text-right">{{ item.percentage }}%</span>
              </div>
            }
          </div>
        </div>

        @if (data.ai; as ai) {
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl bg-[#2E2418] p-4">
              <h3 class="text-sm font-semibold text-[#D6E0B8]">Lo mejor</h3>
              <p class="mt-1 text-sm leading-relaxed text-[#D9CDBD]">
                {{ ai.positiveAspects || 'No se han destacado aspectos positivos.' }}
              </p>
            </div>
            <div class="rounded-xl bg-[#2E211B] p-4">
              <h3 class="text-sm font-semibold text-[#F0BDB2]">A mejorar</h3>
              <p class="mt-1 text-sm leading-relaxed text-[#D9CDBD]">
                {{ ai.negativeAspects || 'No se han destacado aspectos negativos.' }}
              </p>
            </div>
          </div>
        }
      </section>
    }
  `
})
export class ReviewSummary {
  readonly summary = input<RatingSummary | null>(null);
}
