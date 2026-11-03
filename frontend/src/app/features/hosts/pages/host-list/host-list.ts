import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Departure, departureEventName } from '../../../../core/models/departure.model';
import { Event, refId } from '../../../../core/models/event.model';
import { Host, HostPayload } from '../../../../core/models/host.model';
import { AuthService } from '../../../../core/services/auth.service';
import { DeparturesService } from '../../../../core/services/departures.service';
import { EventsService } from '../../../../core/services/events.service';
import { HostsService } from '../../../../core/services/hosts.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { Modal } from '../../../../shared/components/modal/modal';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { formatDate, formatTime } from '../../../../shared/utils/format.util';
import { HostForm } from '../../components/host-form/host-form';

interface HostDeparture {
  _id: string;
  eventName: string;
  start: string;
  end: string;
}

@Component({
  selector: 'app-host-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SkeletonLoader, EmptyState, ErrorState, Modal, HostForm],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-[#F5F0E6]">Anfitriones</h1>
          <p class="mt-1 text-sm text-[#A8B0A5]">
            {{ hosts().length }} anfitriones registrados
          </p>
        </div>

        @if (isAdmin()) {
          <button type="button" class="button-primary" (click)="openCreate()">
            + Nuevo anfitrión
          </button>
        }
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (hosts().length === 0) {
        <app-empty-state title="No hay anfitriones" message="Todavía no hay anfitriones registrados." />
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (host of hosts(); track host._id) {
            <article class="rounded-2xl border border-[#394239] bg-[#202720] p-5">
              <div class="flex items-start justify-between gap-3">
                <a
                  [routerLink]="['/users', hostUserId(host)]"
                  class="font-semibold text-[#F5F0E6] transition-colors hover:text-[#D6B66E] hover:underline"
                >
                  {{ hostName(host) }}
                </a>

                <span class="rounded-full bg-[#2B3226] px-2.5 py-1 text-xs text-[#D6B66E]">
                  {{ host.status }}
                </span>
              </div>

              <p class="mt-2 text-sm text-[#A8B0A5]">
                {{ host.biography || 'Sin biografía' }}
              </p>

              <div class="mt-3 flex flex-wrap gap-2 text-xs">
                <span class="rounded-full bg-[#29332A] px-2.5 py-1 text-[#A8B0A5]">
                  Slug: {{ host.slug }}
                </span>
                <span [class]="statusClass(host)">
                  {{ host.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="mt-4 rounded-xl border border-[#394239] bg-[#1B211D] p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-[#899188]">
                  Salidas en las que participa
                </p>

                @if (departuresForHost(host).length === 0) {
                  <p class="mt-2 text-xs text-[#A8B0A5]">Sin salidas asignadas.</p>
                } @else {
                  <ul class="mt-2 space-y-2">
                    @for (departure of departuresForHost(host); track departure._id) {
                      <li class="text-xs text-[#D5D8D0]">
                        <span class="font-medium text-[#F5F0E6]">
                          {{ departure.eventName }}
                        </span>
                        <span class="block text-[#A8B0A5]">
                          {{ formatDate(departure.start) }} ·
                          {{ formatTime(departure.start) }} - {{ formatTime(departure.end) }}
                        </span>
                      </li>
                    }
                  </ul>
                }
              </div>

              @if (isAdmin()) {
                <div class="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="button-secondary"
                    [disabled]="pendingId() === host._id"
                    (click)="openEdit(host)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="button-secondary"
                    [disabled]="pendingId() === host._id"
                    (click)="toggle(host)"
                  >
                    {{ host.is_active ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              }
            </article>
          }
        </div>
      }

      <app-modal
        [open]="showForm()"
        [title]="editing() ? 'Editar anfitrión' : 'Nuevo anfitrión'"
        (closed)="closeForm()"
      >
        @if (showForm()) {
          <app-host-form
            [host]="editing()"
            (formSubmit)="save($event)"
            (cancelled)="closeForm()"
          />
        }
      </app-modal>
    </section>
  `
})
export class HostList implements OnInit {
  private readonly service = inject(HostsService);
  private readonly eventsService = inject(EventsService);
  private readonly departuresService = inject(DeparturesService);
  private readonly auth = inject(AuthService);

  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly hosts = signal<Host[]>([]);
  protected readonly events = signal<Event[]>([]);
  protected readonly departures = signal<Departure[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pendingId = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly editing = signal<Host | null>(null);

  protected readonly formatDate = formatDate;
  protected readonly formatTime = formatTime;

  ngOnInit(): void {
    this.load();
  }

  protected hostName(host: Host): string {
    return typeof host.user_id === 'string' ? host.slug : host.user_id.name;
  }

  protected hostUserId(host: Host): string {
    return typeof host.user_id === 'string' ? host.user_id : host.user_id._id;
  }

  protected statusClass(host: Host): string {
    return host.is_active
      ? 'rounded-full bg-[#233527] px-2.5 py-1 text-[#BFE3C2]'
      : 'rounded-full bg-[#3A2024] px-2.5 py-1 text-[#F0B7BF]';
  }

  protected departuresForHost(host: Host): HostDeparture[] {
    const eventIds = new Set(
      this.events()
        .filter((event) => refId(event.host) === host._id)
        .map((event) => event._id)
    );

    return this.departures()
      .filter((departure) => eventIds.has(refId(departure.event)))
      .map((departure) => ({
        _id: departure._id,
        eventName: departureEventName(departure),
        start: departure.start_datetime,
        end: departure.end_datetime
      }))
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(host: Host): void {
    this.editing.set(host);
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  protected async save(payload: HostPayload): Promise<void> {
    const current = this.editing();

    try {
      if (current) {
        await firstValueFrom(this.service.update(current._id, payload));
      } else {
        await firstValueFrom(this.service.create(payload));
      }

      this.closeForm();
      await this.load();
    } catch {
      // El interceptor global muestra el error de la API.
    }
  }

  protected async toggle(host: Host): Promise<void> {
    if (this.pendingId()) return;

    this.pendingId.set(host._id);

    try {
      const updated = await firstValueFrom(
        this.service.setActive(host._id, !host.is_active)
      );

      this.hosts.update((list) =>
        list.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch {
      // El interceptor global muestra el error de la API.
    } finally {
      this.pendingId.set(null);
    }
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [hosts, events, departures] = await Promise.all([
        firstValueFrom(this.service.list()),
        firstValueFrom(this.eventsService.list()),
        firstValueFrom(this.departuresService.list())
      ]);

      this.hosts.set(hosts);
      this.events.set(events);
      this.departures.set(departures);
    } catch {
      this.error.set('No se han podido cargar los anfitriones.');
    } finally {
      this.loading.set(false);
    }
  }
}
