import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Profile } from '../../../../core/models/profile.model';
import { User, UserFormPayload } from '../../../../core/models/user.model';
import { UsersService } from '../../../../core/services/users.service';
import { UsersStore } from '../../../../core/stores/users.store';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { buildProfileName } from '../../../../shared/utils/avatar.util';
import { formatDate } from '../../../../shared/utils/format.util';
import { UserForm } from '../../components/user-form/user-form';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UserForm, SkeletonLoader, ErrorState],
  template: `
    <section class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <a
        routerLink="/users"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#A99C8E] transition-colors hover:text-[#E0BD78]"
      >
        ← Volver a usuarios
      </a>

      @if (loading()) {
        <app-skeleton-loader [count]="6" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else {
        @if (user(); as currentUser) {
        <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <span class="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-lg font-semibold text-gray-950">
            @if (showAvatarImage()) {
              <img
                [src]="avatarSrc()"
                [alt]="currentUser.name"
                class="h-full w-full object-cover"
                (error)="onAvatarError()"
              />
            } @else {
              {{ initials() }}
            }
          </span>

          <div class="min-w-0">
            <h1 class="text-2xl font-semibold text-[#F5F0E6]">{{ currentUser.name }}</h1>
            <p class="mt-1 truncate text-sm text-[#A99C8E]">{{ currentUser.email }}</p>

            <div class="mt-2 flex flex-wrap gap-2 text-xs">
              <span class="rounded-full bg-[#3B2E1C] px-2.5 py-1 text-[#E0BD78]">
                {{ currentUser.role === 'Admin' ? 'Administrador' : 'Cliente' }}
              </span>
              <span [class]="statusClass(currentUser)">
                {{ statusLabel(currentUser) }}
              </span>
            </div>
          </div>
        </header>

        @if (saved()) {
          <p
            role="status"
            class="mb-4 rounded-xl border border-[#5A6A3E] bg-[#2E3A22] px-3 py-2 text-sm text-[#D6E0B8]"
          >
            Usuario actualizado correctamente.
          </p>
        }

        @if (saveError()) {
          <p
            role="alert"
            class="mb-4 rounded-xl border border-[#7A4A3C] bg-[#3A211A] px-3 py-2 text-sm text-[#F0BDB2]"
          >
            {{ saveError() }}
          </p>
        }

        <div class="grid gap-6 lg:grid-cols-2">
          <div class="rounded-2xl border border-[#4A3827] bg-[#24170F] p-6">
            <h2 class="mb-4 text-lg font-semibold text-[#F5F0E6]">Datos de la cuenta</h2>

            <app-user-form
              [user]="currentUser"
              [showCancel]="false"
              (formSubmit)="save($event)"
            />
          </div>

          <div class="rounded-2xl border border-[#4A3827] bg-[#24170F] p-6">
            <h2 class="mb-4 text-lg font-semibold text-[#F5F0E6]">Perfil</h2>

            @if (profile(); as currentProfile) {
              <dl class="space-y-3 text-sm">
                <div class="flex justify-between gap-4">
                  <dt class="text-[#8E7F6F]">Nombre completo</dt>
                  <dd class="text-right text-[#F5F0E6]">{{ fullName(currentProfile) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-[#8E7F6F]">Teléfono</dt>
                  <dd class="text-right text-[#F5F0E6]">{{ currentProfile.phone || '-' }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-[#8E7F6F]">Fecha de nacimiento</dt>
                  <dd class="text-right text-[#F5F0E6]">{{ formatDate(currentProfile.birth_date ?? undefined) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-[#8E7F6F]">Dirección</dt>
                  <dd class="text-right text-[#F5F0E6]">{{ currentProfile.address || '-' }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-[#8E7F6F]">Ciudad</dt>
                  <dd class="text-right text-[#F5F0E6]">{{ currentProfile.city || '-' }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-[#8E7F6F]">Código postal</dt>
                  <dd class="text-right text-[#F5F0E6]">{{ currentProfile.postal_code || '-' }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-[#8E7F6F]">Alergias</dt>
                  <dd class="text-right text-[#F5F0E6]">{{ listLabel(currentProfile.allergies) }}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-[#8E7F6F]">Restricciones</dt>
                  <dd class="text-right text-[#F5F0E6]">{{ listLabel(currentProfile.dietary_restrictions) }}</dd>
                </div>
              </dl>

              @if (currentProfile.bio) {
                <div class="mt-4 border-t border-[#4A3827] pt-4">
                  <p class="text-xs font-semibold uppercase tracking-wide text-[#8E7F6F]">Biografía</p>
                  <p class="mt-2 whitespace-pre-line text-sm text-[#E4D8C8]">{{ currentProfile.bio }}</p>
                </div>
              }
            } @else {
              <p class="text-sm text-[#A99C8E]">Este usuario todavía no ha completado su perfil.</p>
            }
          </div>
        </div>
        }
      }
    </section>
  `
})
export class UserDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly usersStore = inject(UsersStore);

  protected readonly user = this.usersStore.selectedUser;
  protected readonly profile = signal<Profile | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly saveError = signal<string | null>(null);

  private readonly failedSrc = signal<string | null>(null);

  protected readonly formatDate = formatDate;

  private readonly profileName = computed(() =>
    buildProfileName(this.profile())
  );

  protected readonly avatarSrc = computed(() => {
    const custom = this.profile()?.avatar_url?.trim();
    if (custom && this.failedSrc() !== custom) return custom;
    return '';
  });

  protected readonly showAvatarImage = computed(() => this.avatarSrc() !== '');

  protected readonly initials = computed(() => {
    const name = this.profileName() || this.user()?.name?.trim() || '';
    if (!name) return '?';

    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? parts[1]?.[0] ?? '' : '';

    return (first + second).toUpperCase() || '?';
  });

  ngOnInit(): void {
    this.load();
  }

  protected statusLabel(user: User): string {
    if (user.status === 'blocked') return 'Bloqueado';
    return user.is_active ? 'Activo' : 'Inactivo';
  }

  protected statusClass(user: User): string {
    if (user.status === 'blocked') {
      return 'rounded-full bg-[#3A211A] px-2.5 py-1 text-[#F0BDB2]';
    }

    return user.is_active
      ? 'rounded-full bg-[#2E3A22] px-2.5 py-1 text-[#D6E0B8]'
      : 'rounded-full bg-[#3A211A] px-2.5 py-1 text-[#F0BDB2]';
  }

  protected fullName(profile: Profile): string {
    const name = [profile.first_name, profile.last_name]
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part))
      .join(' ');

    return name || '-';
  }

  protected listLabel(values: string[] | undefined): string {
    return values && values.length > 0 ? values.join(', ') : '-';
  }

  protected onAvatarError(): void {
    this.failedSrc.set(this.avatarSrc());
  }

  protected async save(payload: UserFormPayload): Promise<void> {
    const current = this.user();
    if (!current || this.saving()) return;

    this.saving.set(true);
    this.saved.set(false);
    this.saveError.set(null);

    try {
      await this.usersStore.update(current._id, payload);
      this.saved.set(true);
    } catch {
      this.saveError.set('No se ha podido actualizar el usuario.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('No se ha indicado el usuario.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.saved.set(false);
    this.saveError.set(null);
    this.usersStore.clearSelection();

    try {
      await this.usersStore.getById(id);
    } catch {
      this.error.set('No se ha podido cargar el usuario.');
      this.loading.set(false);
      return;
    }

    try {
      this.profile.set(await firstValueFrom(this.usersService.getProfile(id)));
    } catch {
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
