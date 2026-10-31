import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Profile } from '../../../../core/models/profile.model';
import { ProfileService } from '../../../../core/services/profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonLoader, EmptyState, ErrorState],
  template: `
    <section class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-[#F5F0E6]">Mi perfil</h1>
        <p class="mt-1 text-sm text-[#A8B0A5]">{{ user()?.name }} · {{ user()?.email }}</p>
      </div>

      @if (loading()) {
        <app-skeleton-loader [count]="4" />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (!profile()) {
        <app-empty-state title="Perfil no encontrado" message="No hay datos de perfil disponibles." />
      } @else {
        <div class="grid gap-4 rounded-2xl border border-[#394239] bg-[#202720] p-6 sm:grid-cols-2">
          <div>
            <p class="text-xs text-gray-500">Nombre</p>
            <p class="text-[#F5F0E6]">{{ profile()!.first_name || '-' }} {{ profile()!.last_name || '' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Teléfono</p>
            <p class="text-[#F5F0E6]">{{ profile()!.phone || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Dirección</p>
            <p class="text-[#F5F0E6]">{{ profile()!.address || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Ciudad</p>
            <p class="text-[#F5F0E6]">{{ profile()!.city || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Código postal</p>
            <p class="text-[#F5F0E6]">{{ profile()!.postal_code || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Fecha de nacimiento</p>
            <p class="text-[#F5F0E6]">{{ profile()!.birth_date || '-' }}</p>
          </div>
          <div class="sm:col-span-2">
            <p class="text-xs text-gray-500">Biografía</p>
            <p class="text-[#F5F0E6]">{{ profile()!.bio || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Alergias</p>
            <p class="text-[#F5F0E6]">{{ profile()!.allergies?.join(', ') || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Restricciones alimentarias</p>
            <p class="text-[#F5F0E6]">{{ profile()!.dietary_restrictions?.join(', ') || '-' }}</p>
          </div>
        </div>
      }
    </section>
  `
})
export class ProfileDetail implements OnInit {
  private readonly service = inject(ProfileService);
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly profile = signal<Profile | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.profile.set(await firstValueFrom(this.service.get()));
    } catch {
      this.error.set('No se ha podido cargar el perfil.');
    } finally {
      this.loading.set(false);
    }
  }
}
