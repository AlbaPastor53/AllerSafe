import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  User,
  UserFormPayload,
  UserPayload
} from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { UsersService } from '../../../../core/services/users.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { Modal } from '../../../../shared/components/modal/modal';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { UserForm } from '../../components/user-form/user-form';

@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SkeletonLoader, EmptyState, ErrorState, Modal, UserForm],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-[#F5F0E6]">Usuarios</h1>
          <p class="mt-1 text-sm text-[#A8B0A5]">{{ users().length }} usuarios registrados</p>
        </div>

        @if (isAdmin()) {
          <button type="button" class="button-primary" (click)="openCreate()">
            + Nuevo usuario
          </button>
        }
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (users().length === 0) {
        <app-empty-state title="No hay usuarios" message="Todavía no hay usuarios registrados." />
      } @else {
        <div class="divide-y divide-[#394239] overflow-hidden rounded-2xl border border-[#394239] bg-[#202720]">
          @for (user of users(); track user._id) {
            <article class="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div class="min-w-0">
                <a
                  [routerLink]="['/users', user._id]"
                  class="font-semibold text-[#F5F0E6] transition-colors hover:text-[#D6B66E] hover:underline"
                >
                  {{ user.name }}
                </a>
                <p class="truncate text-sm text-[#A8B0A5]">{{ user.email }}</p>
              </div>

              <div class="flex flex-wrap items-center gap-2 text-xs">
                <span class="rounded-full bg-[#2B3226] px-2.5 py-1 text-[#D6B66E]">
                  {{ user.role === 'Admin' ? 'Administrador' : 'Cliente' }}
                </span>
                <span [class]="statusClass(user)">{{ statusLabel(user) }}</span>
              </div>

              @if (isAdmin()) {
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="button-secondary"
                    [disabled]="pendingId() === user._id"
                    (click)="openEdit(user)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="button-secondary"
                    [disabled]="pendingId() === user._id"
                    (click)="toggle(user)"
                  >
                    {{ user.status === 'active' ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              }
            </article>
          }
        </div>
      }

      <app-modal
        [open]="showForm()"
        [title]="editing() ? 'Editar usuario' : 'Nuevo usuario'"
        (closed)="closeForm()"
      >
        @if (showForm()) {
          <app-user-form
            [user]="editing()"
            (formSubmit)="save($event)"
            (cancelled)="closeForm()"
          />
        }
      </app-modal>
    </section>
  `
})
export class UserList implements OnInit {
  private readonly service = inject(UsersService);
  private readonly auth = inject(AuthService);

  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pendingId = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly editing = signal<User | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected statusLabel(user: User): string {
    if (user.status === 'blocked') return 'Bloqueado';
    return user.is_active ? 'Activo' : 'Inactivo';
  }

  protected statusClass(user: User): string {
    if (user.status === 'blocked') {
      return 'rounded-full bg-[#3A2024] px-2.5 py-1 text-[#F0B7BF]';
    }

    return user.is_active
      ? 'rounded-full bg-[#233527] px-2.5 py-1 text-[#BFE3C2]'
      : 'rounded-full bg-[#3A2024] px-2.5 py-1 text-[#F0B7BF]';
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  protected openEdit(user: User): void {
    this.editing.set(user);
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  protected async save(payload: UserFormPayload): Promise<void> {
    const current = this.editing();

    try {
      if (current) {
        await firstValueFrom(this.service.update(current._id, payload));
      } else {
        const createPayload: UserPayload = {
          ...payload,
          password: payload.password ?? ''
        };

        await firstValueFrom(this.service.create(createPayload));
      }

      this.closeForm();
      await this.load();
    } catch {
      // El interceptor global muestra el error de la API.
    }
  }

  protected async toggle(user: User): Promise<void> {
    if (this.pendingId()) return;

    this.pendingId.set(user._id);

    try {
      const updated = await firstValueFrom(
        this.service.setStatus(
          user._id,
          user.status === 'active' ? 'inactive' : 'active'
        )
      );

      this.users.update((list) =>
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
      this.users.set(await firstValueFrom(this.service.list()));
    } catch {
      this.error.set('No se han podido cargar los usuarios.');
    } finally {
      this.loading.set(false);
    }
  }
}
