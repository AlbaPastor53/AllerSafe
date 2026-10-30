import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    computed,
    inject,
    signal
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
    RouterLink
} from '@angular/router';

import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

import { Courses } from '../../../../core/models/courses.model';
import { CoursesService } from '../../../../core/services/courses.service';
import { CoursesStore } from '../../../../core/stores/courses.store';

import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';

import {
    formatDate,
    formatPrice
} from '../../../../shared/utils/format.util';

import { isValidObjectId } from '../../../../shared/utils/object-id.util';

import {
    isHttpError,
    showUnexpectedError
} from '../../../../shared/utils/error.util';

import {
    STATUS_LABELS,
    categoryNames
} from '../../../../core/models/courses.model';


@Component({
    selector: 'app-route-detail',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,

    imports: [
        RouterLink,
        EmptyState,
        ErrorState,
        SkeletonLoader
    ],

    template: `
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            @if(loading()) {
                <app-skeleton-loader [count]="4"/>

            } @else if(loadError()) {
                <app-error-state
                    [message]="loadError()!"
                    (retry)="reload()"
                />

            } @else if(notFound() || !event()) {
                <app-empty-state
                    title="Evento no encontrado"
                    message="No existe ningún evento con ese ID o no está disponible."
                >
                    <a
                        routerLink="/routes"
                        class="button-primary"
                    >
                        Volver a la lista
                    </a>
                </app-empty-state>

            } @else {
                <nav class="mb-6 flex items-center gap-2 text-sm text-gray-500">

                    <a
                        routerLink="/routes"
                        class="hover:text-gray-800 hover:underline"
                    >
                        Eventos
                    </a>

                    <span>/</span>

                    <span class="truncate font-medium text-gray-800">
                        {{event()!.name}}
                    </span>

                </nav>

                <div class="grid gap-8 lg:grid-cols-3">

                    <section class="space-y-6 lg:col-span-2">

                        @if(coverImage(); as cover) {
                            <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                                <div class="relative h-64 w-full sm:h-80 lg:h-96">
                                    <img
                                        [src]="cover.url"
                                        [alt]="cover.alt || event()!.name"
                                        class="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                @if(eventImages().length > 1) {
                                    <div class="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4">
                                        @for(img of eventImages(); track img._id) {
                                            @if(img._id !== cover._id) {
                                                <img
                                                    [src]="img.url"
                                                    [alt]="img.alt || event()!.name"
                                                    class="h-24 w-full rounded-lg object-cover sm:h-28"
                                                    loading="lazy"
                                                />
                                            }
                                        }
                                    </div>
                                }
                            </div>
                        }

                        <div class="rounded-2xl border border-gray-200 bg-white p-6">

                            <div class="mb-4 flex flex-wrap items-start justify-between gap-3">

                                <div>
                                    <h1 class="text-3xl font-semibold text-gray-900">
                                        {{event()!.name}}
                                    </h1>

                                    <p class="mt-2 text-sm text-gray-500">
                                        Slug: {{event()!.slug}}
                                    </p>
                                </div>

                                <span
                                    class="rounded-full px-3 py-1 text-sm"
                                    [class.bg-green-100]="event()!.is_active"
                                    [class.text-green-800]="event()!.is_active"
                                    [class.bg-gray-100]="!event()!.is_active"
                                >
                                    {{event()!.is_active ? 'Activo' : 'Inactivo'}}
                                </span>

                            </div>

                            <p class="whitespace-pre-line leading-7 text-gray-700">
                                {{event()!.description}}
                            </p>

                        </div>

                        <div class="rounded-2xl border border-gray-200 bg-white p-6">

                            <h2 class="mb-4 text-lg font-semibold">
                                Información del evento
                            </h2>

                            <dl class="grid gap-5 sm:grid-cols-2">

                                <div>
                                    <dt class="text-sm text-gray-500">
                                        Fecha
                                    </dt>

                                    <dd class="mt-1 font-semibold">
                                        {{formatDate(event()!.date)}}
                                    </dd>
                                </div>

                                <div>
                                    <dt class="text-sm text-gray-500">
                                        Precio
                                    </dt>

                                    <dd class="mt-1 font-semibold">
                                        {{formatPrice(event()!.price)}}
                                    </dd>
                                </div>

                                <div>
                                    <dt class="text-sm text-gray-500">
                                        Hora
                                    </dt>

                                    <dd class="mt-1 font-semibold">
                                        {{event()!.time || '-'}}
                                    </dd>
                                </div>

                                <div>
                                    <dt class="text-sm text-gray-500">
                                        Categoría
                                    </dt>

                                    <dd class="mt-1 font-semibold">
                                        {{categoryLabel()}}
                                    </dd>
                                </div>

                                <div>
                                    <dt class="text-sm text-gray-500">
                                        Anfitrión
                                    </dt>

                                    <dd class="mt-1 font-semibold">
                                        {{hostName()}}
                                    </dd>
                                </div>

                                <div>
                                    <dt class="text-sm text-gray-500">
                                        Ubicación
                                    </dt>

                                    <dd class="mt-1 font-semibold">
                                        {{locationLabel()}}
                                    </dd>
                                </div>

                                <div>
                                    <dt class="text-sm text-gray-500">
                                        Número de clase
                                    </dt>

                                    <dd class="mt-1 font-semibold">
                                        {{event()!.classNumber}}
                                    </dd>
                                </div>

                                <div>
                                    <dt class="text-sm text-gray-500">
                                        Aforo
                                    </dt>

                                    <dd class="mt-1 font-semibold">
                                        {{event()!.capacity}} personas
                                    </dd>
                                </div>

                                <div>
                                    <dt class="text-sm text-gray-500">
                                        Estado
                                    </dt>

                                    <dd class="mt-1 font-semibold">
                                        {{statusLabel()}}
                                    </dd>
                                </div>

                                <div>
                                    <dt class="text-sm text-gray-500">
                                        Actualizado
                                    </dt>

                                    <dd class="mt-1 font-semibold">
                                        {{formatDate(event()!.updated_at)}}
                                    </dd>
                                </div>

                            </dl>

                        </div>

                    </section>

                    <aside class="h-fit rounded-2xl border border-gray-200 bg-white p-6">

                        <h2 class="text-lg font-semibold">
                            Acciones
                        </h2>

                        <div class="mt-4 flex flex-col gap-3">

                            <a
                                [routerLink]="['/routes', event()!._id, 'edit']"
                                class="button-primary text-center"
                            >
                                Editar evento
                            </a>

                            <button
                                type="button"
                                class="button-secondary"
                                (click)="toggleStatus()"
                            >
                                {{event()!.is_active ? 'Desactivar evento' : 'Activar evento'}}
                            </button>

                            <button
                                type="button"
                                class="button-danger"
                                (click)="remove()"
                            >
                                Eliminar evento
                            </button>

                            <a
                                routerLink="/routes"
                                class="button-secondary text-center"
                            >
                                Volver a la lista
                            </a>

                        </div>

                    </aside>

                </div>
            }

        </div>
    `
})


export class RouteDetail implements OnInit {

    private readonly activatedRoute = inject(ActivatedRoute);

    private readonly router = inject(Router);

    private readonly service = inject(CoursesService);

    private readonly store = inject(CoursesStore);


    protected readonly event = signal<Courses | null>(null);

    protected readonly loading = signal(false);

    protected readonly notFound = signal(false);

    protected readonly loadError = signal<string | null>(null);


    protected readonly eventImages = computed(() => this.event()?.images ?? []);

    protected readonly coverImage = computed(() => {
        const imgs = this.eventImages();

        return imgs.find(img => img.isCover) ?? imgs[0] ?? null;
    });


    protected readonly formatDate = formatDate;

    protected readonly formatPrice = formatPrice;


    protected readonly categoryLabel = () => {
        const e = this.event();

        return e ? categoryNames(e.categories) : '';
    };


    protected readonly hostName = computed(() => {
        const host = this.event()?.host;

        if (!host || typeof host === 'string') return '-';

        if (!host.user_id || typeof host.user_id === 'string') return host.slug;

        return host.user_id.name;
    });


    protected readonly locationLabel = computed(() => {
        const location = this.event()?.location;

        if (!location || typeof location === 'string') return '-';

        return location.address
            ? `${location.name} (${location.address})`
            : location.name;
    });


    protected readonly statusLabel = () => {
        const e = this.event();

        return e ? STATUS_LABELS[e.status] : '';
    };


    private id = '';


    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(p => {
            this.id = p.get('id') ?? '';

            this.reload();
        });
    }


    protected reload(): void {
        this.loadError.set(null);
        this.notFound.set(false);

        if (!isValidObjectId(this.id)) {
            this.notFound.set(true);
            return;
        }

        this.loading.set(true);

        void this.fetch();
    }


    private async fetch(): Promise<void> {
        try {
            const e = await firstValueFrom(
                this.service.getById(this.id)
            );

            this.event.set(e);

            this.store.setSelectedRoute(e);

        } catch (error) {
            if (isHttpError(error) && error.status === 404) {
                this.notFound.set(true);
            } else {
                this.loadError.set(
                    'No se ha podido cargar el evento. Inténtalo de nuevo.'
                );
            }

        } finally {
            this.loading.set(false);
        }
    }


    protected async toggleStatus(): Promise<void> {
        const e = this.event();

        if (!e) return;

        try {
            const updated = await firstValueFrom(
                this.service.setActive(
                    e._id,
                    !e.is_active
                )
            );

            this.event.set({ ...updated, images: e.images ?? [] });

            this.store.patchRoute(updated);

        } catch (error) {
            if (!isHttpError(error)) {
                showUnexpectedError(error);
            }
        }
    }


    protected async remove(): Promise<void> {
        const e = this.event();

        if (!e) return;

        const result = await Swal.fire({
            title: '¿Eliminar evento?',
            text: `"${e.name}" dejará de aparecer en la lista habitual.`,
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
                this.service.remove(e._id)
            );

            this.store.markStale();

            this.router.navigate(['/routes']);

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