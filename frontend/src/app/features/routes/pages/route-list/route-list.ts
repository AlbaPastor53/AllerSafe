import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    signal
} from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

import { CoursesStore } from '../../../../core/stores/courses.store';
import { CoursesService } from '../../../../core/services/courses.service';
import { Courses } from '../../../../core/models/courses.model';

import { RouteRow } from '../../components/route-row/route-row';

import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';

import {
    isHttpError,
    showUnexpectedError
} from '../../../../shared/utils/error.util';


@Component({
    selector: 'app-route-list',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,

    imports: [
        RouterLink,
        RouteRow,
        SkeletonLoader,
        EmptyState,
        ErrorState
    ],

    template: `
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <h1 class="text-2xl font-semibold tracking-tight text-[#F5F0E6]">
                        Eventos AllerSafe
                    </h1>

                    <p class="mt-1 text-sm text-[#A8B0A5]">
                        {{filteredEvents().length}} eventos encontrados
                    </p>
                </div>

                <a
                    routerLink="/routes/create"
                    class="button-primary whitespace-nowrap"
                >
                    + Nuevo evento
                </a>

            </div>

            @if(store.loading()) {
                <app-skeleton-loader [count]="8"/>

            } @else if(store.error()) {
                <app-error-state
                    [message]="store.error()!"
                    (retry)="load()"
                />

            } @else if(filteredEvents().length === 0) {
                <app-empty-state
                    title="No hay eventos"
                    message="Todavía no hay eventos para mostrar."
                >
                    <a
                        routerLink="/routes/create"
                        class="button-primary"
                    >
                        Crear evento
                    </a>
                </app-empty-state>

            } @else {
                <div class="divide-y divide-[#394239] overflow-hidden rounded-2xl border border-[#394239] bg-[#202720] shadow-xl shadow-black/10">

                    @for(event of filteredEvents(); track event._id) {
                        <app-route-row
                            [route]="event"
                            [pending]="isPending(event._id)"
                            (edit)="onEdit($event)"
                            (remove)="onDelete($event)"
                            (toggleStatus)="onToggleStatus($event)"
                        />
                    }

                </div>
            }

        </div>
    `
})


export class RouteList implements OnInit {

    protected readonly store = inject(CoursesStore);

    private readonly service = inject(CoursesService);

    private readonly router = inject(Router);

    private readonly pending = signal<ReadonlySet<string>>(new Set());

    protected readonly filteredEvents = computed(() =>
        this.store.routes()
    );


    ngOnInit(): void {
        if (!this.store.loaded() || this.store.stale()) {
            this.load();
        }
    }


    protected async load(): Promise<void> {
        this.store.setLoading(true);
        this.store.setError(null);

        try {
            this.store.setRoutes(
                await firstValueFrom(this.service.list())
            );

        } catch {
            this.store.setError(
                'No se han podido cargar los eventos. Comprueba que el backend esté iniciado y que la API esté disponible.'
            );

        } finally {
            this.store.setLoading(false);
        }
    }




    protected onEdit(event: Courses): void {
        this.store.setSelectedRoute(event);

        this.router.navigate([
            '/routes',
            event._id,
            'edit'
        ]);
    }


    protected isPending(id: string): boolean {
        return this.pending().has(id);
    }


    protected async onToggleStatus(event: Courses): Promise<void> {
        await this.withPending(event._id, async () => {
            try {
                const updated = await firstValueFrom(
                    this.service.setActive(
                        event._id,
                        !event.is_active
                    )
                );

                this.store.patchRoute(updated);

            } catch (error) {
                if (!isHttpError(error)) {
                    showUnexpectedError(error);
                }
            }
        });
    }


    private async withPending(
        id: string,
        action: () => Promise<void>
    ): Promise<void> {
        if (this.pending().has(id)) return;

        this.pending.update(s => new Set(s).add(id));

        try {
            await action();

        } finally {
            this.pending.update(s => {
                const n = new Set(s);
                n.delete(id);
                return n;
            });
        }
    }


    protected async onDelete(event: Courses): Promise<void> {
        const result = await Swal.fire({
            title: '¿Eliminar evento?',
            text: `"${event.name}" se eliminará lógicamente y dejará de aparecer en la lista habitual.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF385C',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            await firstValueFrom(
                this.service.remove(event._id)
            );

            this.store.setRoutes(
                this.store.routes().filter(e => e._id !== event._id)
            );

            Swal.fire({
                icon: 'success',
                title: 'Evento eliminado',
                text: 'Se ha realizado el borrado lógico.',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            if (!isHttpError(error)) {
                showUnexpectedError(error);
            }
        }
    }

}