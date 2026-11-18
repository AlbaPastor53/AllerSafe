import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { STATUS_LABELS, Event, categoryNames } from '../../../../core/models/event.model';
import { formatDate, formatPrice } from '../../../../shared/utils/format.util';

@Component({
    selector: 'app-event-row',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
    template: `
        <article
            class="flex flex-col gap-4 p-5 transition-colors hover:bg-[#332A20] sm:flex-row sm:items-center"
            [class.opacity-60]="!event().is_active">

            <div class="flex min-w-0 flex-1 items-start gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#8C6A3E]/40 bg-[#3B2E1C] text-[#E0BD78]">
                    @if (coverImage(); as cover) {
                        <img
                            [src]="cover.url"
                            [alt]="cover.alt || event().name"
                            class="h-full w-full object-cover"
                            loading="lazy"
                        />
                    } @else {
                        <span class="text-lg font-bold">{{ event().name.slice(0,1).toUpperCase() }}</span>
                    }
                </div>

                <div class="min-w-0 flex-1">
                    <a [routerLink]="['/events',event()._id]" class="font-semibold text-[#F5F0E6] transition-colors hover:text-[#E0BD78] hover:underline">{{ event().name }}</a>
                    <p class="mt-1 line-clamp-2 text-sm text-[#A99C8E]">{{ event().description }}</p>

                    <div class="mt-2 flex flex-wrap gap-2 text-xs">
                        <span class="rounded-full bg-[#3B2E1C] px-2.5 py-1 text-[#E0BD78]">{{ categoryLabel() }}</span>
                        <span class="rounded-full bg-[#3B2E1C] px-2.5 py-1 text-[#E0BD78]">{{ statusLabel() }}</span>
                        <span [class]="activeClass()">{{ event().is_active ? 'Activo' : 'Inactivo' }}</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:min-w-56">
                <div>
                    <p class="text-xs text-[#8E7F6F]">Fecha</p>
                    <strong>{{ formatDate(event().date) }}</strong>
                </div>

                <div>
                    <p class="text-xs text-[#8E7F6F]">Hora</p>
                    <strong>{{ event().time || '-' }}</strong>
                </div>

                <div>
                    <p class="text-xs text-[#8E7F6F]">Precio</p>
                    <strong>{{ formatPrice(event().price) }}</strong>
                </div>

                <div>
                    <p class="text-xs text-[#8E7F6F]">Aforo</p>
                    <strong>{{ event().capacity }}</strong>
                </div>
            </div>

            <div class="flex flex-wrap gap-2">
                @if(canManage()) {
                    <button class="button-secondary" type="button" [disabled]="pending()" (click)="edit.emit(event())">Editar</button>
                    <button class="button-secondary" type="button" [disabled]="pending()" (click)="toggleStatus.emit(event())">{{ event().is_active ? 'Desactivar' : 'Activar' }}</button>
                    <button class="button-danger" type="button" [disabled]="pending()" (click)="remove.emit(event())">Eliminar</button>
                }
            </div>
        </article>
    `
})

export class EventRow {
    event = input.required<Event>();
    pending = input(false);
    canManage = input(false);

    edit = output<Event>();
    remove = output<Event>();
    toggleStatus = output<Event>();

    protected readonly formatDate = formatDate;
    protected readonly formatPrice = formatPrice;

    protected readonly coverImage = computed(() => {
        const images = this.event().images ?? [];
        return images.find((image) => image.isCover) ?? images[0] ?? null;
    });

    protected readonly activeClass = computed(() =>
        this.event().is_active
            ? 'rounded-full bg-[#2E3A22] px-2.5 py-1 text-[#D6E0B8]'
            : 'rounded-full bg-[#3A211A] px-2.5 py-1 text-[#F0BDB2]');

    protected readonly categoryLabel = computed(() => categoryNames(this.event().categories));
    protected readonly statusLabel = computed(() =>
        STATUS_LABELS[this.event().status] ?? this.event().status);
}
