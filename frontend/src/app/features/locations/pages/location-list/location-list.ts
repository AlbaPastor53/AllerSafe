import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { Location, LocationPayload } from '../../../../core/models/location.model';
import { AuthService } from '../../../../core/services/auth.service';
import { LocationsStore } from '../../../../core/stores/locations.store';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { Modal } from '../../../../shared/components/modal/modal';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { LocationForm } from '../../components/location-form/location-form';

@Component({
  selector: 'app-location-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonLoader, EmptyState, ErrorState, Modal, LocationForm],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-[#F5F0E6]">Ubicaciones</h1>
          <p class="mt-1 text-sm text-[#A8B0A5]">
            {{ locations().length }} ubicaciones registradas
          </p>
        </div>

        @if (isAdmin()) {
          <button type="button" class="button-primary" (click)="openCreate()">
            + Nueva ubicación
          </button>
        }
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (locations().length === 0) {
        <app-empty-state title="No hay ubicaciones" message="Todavía no hay ubicaciones registradas." />
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (location of locations(); track location._id) {
            <article class="rounded-2xl border border-[#394239] bg-[#202720] p-5">
              <div class="flex items-start justify-between gap-3">
                <h2 class="font-semibold text-[#F5F0E6]">{{ location.name }}</h2>
                <span class="rounded-full bg-[#2B3226] px-2.5 py-1 text-xs text-[#D6B66E]">
                  {{ location.status === 'active' ? 'Activa' : 'Inactiva' }}
                </span>
              </div>

              <p class="mt-2 text-sm text-[#A8B0A5]">{{ location.address }}</p>

              <div class="mt-3 flex flex-wrap gap-2 text-xs">
                <span class="rounded-full bg-[#29332A] px-2.5 py-1 text-[#A8B0A5]">
                  Slug: {{ location.slug }}
                </span>
                <span [class]="statusClass(location)">
                  {{ location.is_active ? 'Activa' : 'Inactiva' }}
                </span>
              </div>

              @if (isAdmin()) {
                <div class="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="button-secondary"
                    [disabled]="pendingId() === location._id"
                    (click)="openEdit(location)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="button-secondary"
                    [disabled]="pendingId() === location._id"
                    (click)="toggle(location)"
                  >
                    {{ location.is_active ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              }
            </article>
          }
        </div>
      }

      <app-modal
        [open]="showForm()"
        [title]="editing() ? 'Editar ubicación' : 'Nueva ubicación'"
        (closed)="closeForm()"
      >
        @if (showForm()) {
          <app-location-form
            [location]="editing()"
            (formSubmit)="save($event)"
            (cancelled)="closeForm()"
          />
        }
      </app-modal>
    </section>
  `
})
export class LocationList implements OnInit {
  protected readonly store = inject(LocationsStore);
  private readonly auth = inject(AuthService);

  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly locations = this.store.locations;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly pendingId = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly editing = signal<Location | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected statusClass(location: Location): string {
    return location.is_active
      ? 'rounded-full bg-[#233527] px-2.5 py-1 text-[#BFE3C2]'
      : 'rounded-full bg-[#3A2024] px-2.5 py-1 text-[#F0B7BF]';
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(location: Location): void {
    this.editing.set(location);
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  protected async save(payload: LocationPayload): Promise<void> {
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

  protected async toggle(location: Location): Promise<void> {
    if (this.pendingId()) return;

    this.pendingId.set(location._id);

    try {
      await this.store.setActive(location._id, !location.is_active);
    } catch {
      // El interceptor global muestra el error de la API.
    } finally {
      this.pendingId.set(null);
    }
  }

  protected async load(): Promise<void> {
    try {
      await this.store.load();
    } catch {
      // The store exposes the load error to the view.
    }
  }
}
