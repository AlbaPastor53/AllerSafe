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
            class="flex flex-col gap-4 p-5 transition-colors hover:bg-[#29332A] sm:flex-row sm:items-center"
            [class.opacity-60]="!event().is_active">

            <div class="flex min-w-0 flex-1 items-start gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#8C7548]/40 bg-[#3B3425] text-[#D6B66E]">
                    <span class="text-lg font-bold">{{ event().name.slice(0,1).toUpperCase() }}</span>
                </div>

                <div class="min-w-0 flex-1">
                    <a [routerLink]="['/events',event()._id]" class="font-semibold text-[#F5F0E6] transition-colors hover:text-[#D6B66E] hover:underline">{{ event().name }}</a>
                    <p class="mt-1 line-clamp-2 text-sm text-gray-500">{{ event().description }}</p>

                    <div class="mt-2 flex flex-wrap gap-2 text-xs">
                        <span class="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">{{ categoryLabel() }}</span>
                        <span class="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">{{ statusLabel() }}</span>
                        <span class="rounded-full px-2.5 py-1" [class.bg-green-100]="event().is_active" [class.text-green-800]="event().is_active" [class.bg-gray-200]="!event().is_active">{{ event().is_active ? 'Activo' : 'Inactivo' }}</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:min-w-56">
                <div>
                    <p class="text-xs text-gray-500">Fecha</p>
                    <strong>{{ formatDate(event().date) }}</strong>
                </div>

                <div>
                    <p class="text-xs text-gray-500">Hora</p>
                    <strong>{{ event().time || '-' }}</strong>
                </div>

                <div>
                    <p class="text-xs text-gray-500">Precio</p>
                    <strong>{{ formatPrice(event().price) }}</strong>
                </div>

                <div>
                    <p class="text-xs text-gray-500">Aforo</p>
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

    protected readonly categoryLabel = computed(() => categoryNames(this.event().categories));
    protected readonly statusLabel = computed(() =>
        STATUS_LABELS[this.event().status] ?? this.event().status);
}
