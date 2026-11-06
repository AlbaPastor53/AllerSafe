import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  DEPARTURE_STATUS_LABELS,
  Departure,
  DeparturePayload,
  DepartureStatus,
  departureAvailableSpots,
  departureEventName
} from '../../../../core/models/departure.model';
import { EventSummary, categoryNames } from '../../../../core/models/event.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DeparturesStore } from '../../../../core/stores/departures.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { Modal } from '../../../../shared/components/modal/modal';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import {
  formatDate,
  formatDateTimeLocal,
  formatPrice,
  formatTime
} from '../../../../shared/utils/format.util';
import { DepartureForm } from '../../components/departure-form/departure-form';

@Component({
  selector: 'app-departure-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    SkeletonLoader,
    EmptyState,
    ErrorState,
    Modal,
    DepartureForm
  ],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-[#F5F0E6]">Clases</h1>
          <p class="mt-1 text-sm text-[#A8B0A5]">
            {{ visibleDepartures().length }} clases disponibles
          </p>
        </div>

        @if (isAdmin()) {
          <button type="button" class="button-primary" (click)="openCreate()">
            + Nueva clase
          </button>
        }
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (visibleDepartures().length === 0) {
        <app-empty-state title="No hay clases" message="Todavía no hay clases programadas." />
      } @else {
        <div class="space-y-4">
          @for (departure of visibleDepartures(); track departure._id) {
            <article class="rounded-2xl border border-[#394239] bg-[#202720] p-5">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="font-semibold text-[#F5F0E6]">{{ eventName(departure) }}</h2>
                    <span [class]="statusClass(departure)">{{ statusLabel(departure) }}</span>
                    <span class="rounded-full bg-[#2B3226] px-2.5 py-1 text-xs text-[#D6B66E]">
                      {{ categoryLabel(departure) }}
                    </span>
                  </div>

                  <p class="mt-1 text-sm text-[#A8B0A5]">
                    {{ locationLabel(departure) }}
                  </p>
                </div>

                <div class="text-sm sm:text-right">
                  <p class="font-semibold text-[#F5F0E6]">{{ formatPrice(departure.price) }}</p>
                  <p class="text-xs text-[#A8B0A5]">
                    {{ availableSpots(departure) }} plazas disponibles
                  </p>
                  <p class="text-xs text-[#899188]">
                    {{ departure.booked_participants }} / {{ departure.capacity }} ocupadas
                  </p>
                </div>
              </div>

              <div class="mt-4 grid gap-3 border-t border-[#394239] pt-4 text-sm sm:grid-cols-3">
                <div>
                  <p class="text-xs text-[#899188]">Fecha</p>
                  <strong class="text-[#F5F0E6]">{{ formatDate(departure.start_datetime) }}</strong>
                </div>
                <div>
                  <p class="text-xs text-[#899188]">Horario</p>
                  <strong class="text-[#F5F0E6]">
                    {{ formatTime(departure.start_datetime) }} - {{ formatTime(departure.end_datetime) }}
                  </strong>
                </div>
                <div>
                  <p class="text-xs text-[#899188]">Evento</p>
                  <strong class="text-[#F5F0E6]">{{ eventName(departure) }}</strong>
                </div>
              </div>

              @if (isAdmin()) {
                <div class="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="button-secondary"
                    [disabled]="pendingId() === departure._id"
                    (click)="openEdit(departure)"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    class="button-secondary"
                    [disabled]="pendingId() === departure._id"
                    (click)="openReschedule(departure)"
                  >
                    Mover a otro día
                  </button>

                  @if (departure.status === 'cancelled') {
                    <button
                      type="button"
                      class="button-secondary"
                      [disabled]="pendingId() === departure._id"
                      (click)="activate(departure)"
                    >
                      Activar
                    </button>
                  } @else {
                    <button
                      type="button"
                      class="button-danger"
                      [disabled]="pendingId() === departure._id"
                      (click)="cancel(departure)"
                    >
                      Cancelar
                    </button>
                  }
                </div>
              }
            </article>
          }
        </div>
      }

      <app-modal
        [open]="showForm()"
        [title]="editing() ? 'Editar clase' : 'Nueva clase'"
        (closed)="closeForm()"
      >
        @if (showForm()) {
          <app-departure-form
            [departure]="editing()"
            (formSubmit)="save($event)"
            (cancelled)="closeForm()"
          />
        }
      </app-modal>

      <app-modal
        [open]="showReschedule()"
        title="Mover salida a otro día"
        (closed)="closeReschedule()"
      >
        @if (showReschedule() && rescheduling(); as departure) {
          <form (ngSubmit)="saveReschedule()" class="space-y-4">
            <p class="text-sm text-[#A8B0A5]">
              {{ eventName(departure) }} · {{ formatDate(departure.start_datetime) }}
            </p>

            <div>
              <label class="form-label" for="reschedule-start">Nueva fecha y hora de inicio *</label>
              <input
                id="reschedule-start"
                name="reschedule-start"
                type="datetime-local"
                class="form-input"
                [(ngModel)]="rescheduleValue"
                required
              />
            </div>

            <p class="text-xs text-[#899188]">
              Se conservará la duración actual de la salida.
            </p>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" class="button-secondary" (click)="closeReschedule()">
                Cancelar
              </button>
              <button
                type="submit"
                class="button-primary"
                [disabled]="pendingId() === departure._id"
              >
                Guardar nueva fecha
              </button>
            </div>
          </form>
        }
      </app-modal>
    </section>
  `
})
export class DepartureList implements OnInit {
  protected readonly store = inject(DeparturesStore);
  private readonly auth = inject(AuthService);

  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly departures = this.store.departures;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly pendingId = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly editing = signal<Departure | null>(null);
  protected readonly showReschedule = signal(false);
  protected readonly rescheduling = signal<Departure | null>(null);

  protected rescheduleValue = '';

  protected readonly formatDate = formatDate;
  protected readonly formatPrice = formatPrice;
  protected readonly formatTime = formatTime;
  protected readonly availableSpots = departureAvailableSpots;

  protected readonly visibleDepartures = computed(() => {
    const departures = this.departures();

    if (this.isAdmin()) return departures;

    return departures.filter(
      (departure) =>
        departure.is_active &&
        departure.status !== 'cancelled' &&
        (typeof departure.event === 'string' || departure.event.is_active !== false)
    );
  });

  ngOnInit(): void {
    this.load();
  }

  protected eventName(departure: Departure): string {
    return departureEventName(departure);
  }

  protected categoryLabel(departure: Departure): string {
    return categoryNames(this.eventSummary(departure)?.categories);
  }

  protected locationLabel(departure: Departure): string {
    const location = this.eventSummary(departure)?.location;

    if (!location) return 'Sin ubicación';
    return typeof location === 'string' ? location : location.name;
  }

  protected statusLabel(departure: Departure): string {
    return DEPARTURE_STATUS_LABELS[departure.status] ?? departure.status;
  }

  protected statusClass(departure: Departure): string {
    const base = 'rounded-full px-2.5 py-1 text-xs';

    if (departure.status === 'cancelled') {
      return `${base} bg-[#3A2024] text-[#F0B7BF]`;
    }

    if (departure.status === 'full') {
      return `${base} bg-[#3B3425] text-[#D6B66E]`;
    }

    if (departure.status === 'completed') {
      return `${base} bg-[#29332A] text-[#A8B0A5]`;
    }

    return `${base} bg-[#233527] text-[#BFE3C2]`;
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(departure: Departure): void {
    this.editing.set(departure);
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  protected openReschedule(departure: Departure): void {
    this.rescheduling.set(departure);
    this.rescheduleValue = formatDateTimeLocal(departure.start_datetime);
    this.showReschedule.set(true);
  }

  protected closeReschedule(): void {
    this.showReschedule.set(false);
    this.rescheduling.set(null);
    this.rescheduleValue = '';
  }

  protected async save(payload: DeparturePayload): Promise<void> {
    const current = this.editing();

    try {
      if (current) {
        await this.store.update(current._id, payload);
      } else {
        await this.store.create(payload);
      }

      this.closeForm();
    } catch {
      // El interceptor global muestra el error de la API.
    }
  }

  protected async saveReschedule(): Promise<void> {
    const departure = this.rescheduling();
    if (!departure) return;

    const start = new Date(this.rescheduleValue);

    if (Number.isNaN(start.getTime())) {
      await Swal.fire({
        icon: 'error',
        title: 'Fecha no válida',
        text: 'Introduce una fecha y hora válidas.',
        confirmButtonColor: '#FF385C'
      });
      return;
    }

    const previousStart = new Date(departure.start_datetime).getTime();
    const previousEnd = new Date(departure.end_datetime).getTime();
    const duration =
      Number.isFinite(previousStart) && previousEnd > previousStart
        ? previousEnd - previousStart
        : 60 * 60 * 1000;

    const end = new Date(start.getTime() + duration);

    this.pendingId.set(departure._id);

    try {
      await this.store.update(departure._id, {
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString()
      });
      this.closeReschedule();
    } catch {
      // El interceptor global muestra el error de la API.
    } finally {
      this.pendingId.set(null);
    }
  }

  protected async cancel(departure: Departure): Promise<void> {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Cancelar salida',
      text: 'La salida dejará de estar disponible para los clientes.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#FF385C'
    });

    if (result.isConfirmed) {
      await this.changeStatus(departure, 'cancelled');
    }
  }

  protected async activate(departure: Departure): Promise<void> {
    await this.changeStatus(departure, 'scheduled');
  }

  protected async load(): Promise<void> {
    try {
      await this.store.load();
    } catch {
      // The store exposes the load error to the view.
    }
  }

  private async changeStatus(
    departure: Departure,
    status: DepartureStatus
  ): Promise<void> {
    if (this.pendingId()) return;

    this.pendingId.set(departure._id);

    try {
      await this.store.setStatus(departure._id, status);
    } catch {
      // El interceptor global muestra el error de la API.
    } finally {
      this.pendingId.set(null);
    }
  }

  private eventSummary(departure: Departure): EventSummary | null {
    return typeof departure.event === 'string' ? null : departure.event;
  }
}
