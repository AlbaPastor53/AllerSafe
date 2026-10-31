import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../../../../core/models/user.model';
import { UsersService } from '../../../../core/services/users.service';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonLoader, EmptyState, ErrorState],
  template: `
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-[#F5F0E6]">Usuarios</h1>
        <p class="mt-1 text-sm text-[#A8B0A5]">{{ users().length }} usuarios registrados</p>
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
            <article class="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-[#F5F0E6]">{{ user.name }}</p>
                <p class="text-sm text-[#A8B0A5]">{{ user.email }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-xs">
                <span class="rounded-full bg-[#29332A] px-2.5 py-1 text-[#D6B66E]">{{ user.role }}</span>
                <span class="rounded-full bg-[#29332A] px-2.5 py-1 text-[#D6B66E]">{{ user.status }}</span>
                <span class="rounded-full px-2.5 py-1" [class.bg-green-100]="user.is_active" [class.text-green-800]="user.is_active" [class.bg-gray-200]="!user.is_active">
                  {{ user.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class UserList implements OnInit {
  private readonly service = inject(UsersService);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
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
