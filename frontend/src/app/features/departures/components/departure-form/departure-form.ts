import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  DEPARTURE_STATUS_LABELS,
  Departure,
  DeparturePayload,
  DepartureStatus
} from '../../../../core/models/departure.model';
import { Event } from '../../../../core/models/event.model';
import { EventsService } from '../../../../core/services/events.service';
import { formatDateTimeLocal } from '../../../../shared/utils/format.util';

@Component({
  selector: 'app-departure-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      @if (loadError()) {
        <p class="rounded-xl border border-[#70404A] bg-[#352329] px-3 py-2 text-sm text-[#F0B7BF]">
          {{ loadError() }}
        </p>
      }

      @if (formError()) {
        <p class="rounded-xl border border-[#70404A] bg-[#352329] px-3 py-2 text-sm text-[#F0B7BF]">
          {{ formError() }}
        </p>
      }

      <div>
        <label class="form-label" for="departure-event">Evento / clase *</label>
        <select id="departure-event" class="form-input" formControlName="event">
          <option value="">Selecciona un evento</option>

          @for (event of events(); track event._id) {
            <option
              [value]="event._id"
              [disabled]="!isEventAvailable(event)"
            >
              {{ event.name }}
              {{ isEventAvailable(event) ? '' : ' (inactivo)' }}
            </option>
          }
        </select>
        @if (errorFor('event')) {
          <p class="form-error">{{ errorFor('event') }}</p>
        }
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="form-label" for="departure-start">Inicio *</label>
          <input
            id="departure-start"
            type="datetime-local"
            class="form-input"
            formControlName="start_datetime"
          />
          @if (errorFor('start_datetime')) {
            <p class="form-error">{{ errorFor('start_datetime') }}</p>
          }
        </div>

        <div>
          <label class="form-label" for="departure-end">Fin *</label>
          <input
            id="departure-end"
            type="datetime-local"
            class="form-input"
            formControlName="end_datetime"
          />
          @if (errorFor('end_datetime')) {
            <p class="form-error">{{ errorFor('end_datetime') }}</p>
          }
        </div>

        <div>
          <label class="form-label" for="departure-capacity">Aforo *</label>
          <input
            id="departure-capacity"
            type="number"
            min="1"
            step="1"
            class="form-input"
            formControlName="capacity"
          />
          @if (errorFor('capacity')) {
            <p class="form-error">{{ errorFor('capacity') }}</p>
          }
        </div>

        <div>
          <label class="form-label" for="departure-booked">Plazas ocupadas</label>
          <input
            id="departure-booked"
            type="number"
            min="0"
            step="1"
            class="form-input"
            formControlName="booked_participants"
          />
          @if (errorFor('booked_participants')) {
            <p class="form-error">{{ errorFor('booked_participants') }}</p>
          }
        </div>

        <div>
          <label class="form-label" for="departure-price">Precio (€) *</label>
          <input
            id="departure-price"
            type="number"
            min="0"
            step="0.01"
            class="form-input"
            formControlName="price"
          />
          @if (errorFor('price')) {
            <p class="form-error">{{ errorFor('price') }}</p>
          }
        </div>

        <div>
          <label class="form-label" for="departure-status">Estado</label>
          <select id="departure-status" class="form-input" formControlName="status">
            @for (option of statuses; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        </div>
      </div>

      <div>
        <label class="form-label" for="departure-slug">Slug (opcional)</label>
        <input
          id="departure-slug"
          class="form-input"
          formControlName="slug"
          placeholder="Se genera automáticamente"
        />
      </div>

      <label class="flex items-center gap-2 text-sm text-[#D5D8D0]">
        <input type="checkbox" class="h-4 w-4 rounded border-[#414940]" formControlName="is_active" />
        Salida activa
      </label>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="button-secondary" (click)="cancelled.emit()">
          Cancelar
        </button>
        <button type="submit" class="button-primary">
          {{ departure() ? 'Guardar cambios' : 'Crear salida' }}
        </button>
      </div>
    </form>
  `
})
export class DepartureForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly eventsService = inject(EventsService);

  readonly departure = input<Departure | null>(null);
  readonly formSubmit = output<DeparturePayload>();
  readonly cancelled = output<void>();

  protected readonly events = signal<Event[]>([]);
  protected readonly loadError = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);

  protected readonly statuses = (
    Object.keys(DEPARTURE_STATUS_LABELS) as DepartureStatus[]
  ).map((value) => ({ value, label: DEPARTURE_STATUS_LABELS[value] }));

  protected readonly currentEventId = computed(() => {
    const departure = this.departure();
    if (!departure) return null;

    return typeof departure.event === 'string'
      ? departure.event
      : departure.event._id;
  });

  protected readonly form = this.fb.nonNullable.group({
    event: ['', [Validators.required]],
    start_datetime: ['', [Validators.required]],
    end_datetime: ['', [Validators.required]],
    capacity: [1, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0)]],
    booked_participants: [0, [Validators.required, Validators.min(0)]],
    status: ['scheduled' as DepartureStatus, [Validators.required]],
    slug: [''],
    is_active: [true]
  });

  constructor() {
    effect(() => {
      const departure = this.departure();

      if (!departure) return;

      this.form.patchValue({
        event: this.currentEventId() ?? '',
        start_datetime: formatDateTimeLocal(departure.start_datetime),
        end_datetime: formatDateTimeLocal(departure.end_datetime),
        capacity: departure.capacity,
        price: departure.price,
        booked_participants: departure.booked_participants ?? 0,
        status: departure.status,
        slug: departure.slug,
        is_active: departure.is_active
      });
    });
  }

  ngOnInit(): void {
    void this.loadEvents();
  }

  protected isEventAvailable(event: Event): boolean {
    return event.is_active || event._id === this.currentEventId();
  }

  protected errorFor(name: string): string | null {
    const control = this.form.get(name);

    if (!control || !control.touched || control.valid) return null;

    if (control.errors?.['required']) return 'Este campo es obligatorio.';
    if (control.errors?.['min']) return 'El valor es inferior al mínimo permitido.';

    return 'Revisa este campo.';
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    this.formError.set(null);

    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const start = new Date(value.start_datetime);
    const end = new Date(value.end_datetime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      this.formError.set('Introduce una fecha y hora válidas.');
      return;
    }

    if (end <= start) {
      this.formError.set('La fecha de fin debe ser posterior a la de inicio.');
      return;
    }

    if (value.booked_participants > value.capacity) {
      this.formError.set('Las plazas ocupadas no pueden superar el aforo.');
      return;
    }

    const payload: DeparturePayload = {
      event: value.event,
      start_datetime: start.toISOString(),
      end_datetime: end.toISOString(),
      capacity: Number(value.capacity),
      price: Number(value.price),
      booked_participants: Number(value.booked_participants),
      status: value.status,
      is_active: value.is_active && value.status !== 'cancelled'
    };

    if (value.slug.trim()) {
      payload.slug = value.slug.trim();
    }

    this.formSubmit.emit(payload);
  }

  private async loadEvents(): Promise<void> {
    try {
      this.events.set(await firstValueFrom(this.eventsService.list()));
    } catch {
      this.loadError.set('No se han podido cargar los eventos disponibles.');
    }
  }
}
