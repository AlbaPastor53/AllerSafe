import {ChangeDetectionStrategy,Component,OnInit,inject,signal} from '@angular/core';

import {ActivatedRoute,Router,RouterLink} from '@angular/router';

import Swal from 'sweetalert2';

import {Event,EventPayload} from '../../../../core/models/event.model';

import { EventsStore } from '../../../../core/stores/events.store';

import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../../shared/components/error-state/error-state';

import { isValidObjectId } from '../../../../shared/utils/object-id.util';

import {isHttpError,showUnexpectedError} from '../../../../shared/utils/error.util';

import { EventForm } from '../../components/event-form/event-form';


@Component({
    selector: 'app-event-edit',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,

    imports: [
        RouterLink,
        EventForm,
        EmptyState,
        ErrorState
    ],

    template: `
        <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

            <nav class="mb-6 flex items-center gap-2 text-sm text-gray-500">

                <a
                    routerLink="/events"
                    class="hover:text-gray-800 hover:underline"
                >
                    Eventos
                </a>

                <span>/</span>

                <span class="font-medium text-gray-800">
                    Editar evento
                </span>

            </nav>

            @if(loading()) {
                <div class="animate-pulse space-y-4">

                    <div class="h-6 w-1/3 rounded bg-gray-200">
                    </div>

                    <div class="h-64 rounded-2xl bg-gray-200">
                    </div>

                </div>

            } @else if(loadError()) {
                <app-error-state
                    [message]="loadError()!"
                    (retry)="load()"
                />

            } @else if(notFound() || !event()) {
                <app-empty-state
                    title="Evento no encontrado"
                    message="No existe ningún evento con ese ID o no está disponible."
                >
                    <a
                        routerLink="/events"
                        class="button-primary"
                    >
                        Volver a la lista
                    </a>
                </app-empty-state>

            } @else {
                <div class="mb-6">

                    <h1 class="text-2xl font-semibold text-gray-900">
                        Editar evento
                    </h1>

                    <p class="mt-0.5 text-sm text-gray-500">
                        Modifica los datos de
                        <strong>{{event()!.name}}</strong>.
                    </p>

                </div>

                <app-event-form
                    [event]="event()"
                    (formSubmit)="onUpdate($event)"
                    (cancelled)="onCancel()"
                />
            }

        </div>
    `
})


export class EventEdit implements OnInit {

    private readonly activatedRoute = inject(ActivatedRoute);

    private readonly store = inject(EventsStore);

    private readonly router = inject(Router);


    protected readonly event = signal<Event | null>(null);

    protected readonly loading = signal(false);

    protected readonly notFound = signal(false);

    protected readonly loadError = signal<string | null>(null);

    protected readonly submitting = signal(false);


    private currentId = '';


    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(params => {

            const id = params.get('id') ?? '';

            if (!isValidObjectId(id)) {
                this.currentId = '';
                this.event.set(null);
                this.notFound.set(true);
                return;
            }

            this.currentId = id;
            this.load();

        });
    }


    protected load(): void {
        this.loadError.set(null);
        this.notFound.set(false);

        const cached = this.store.selectedEvent();

        if (cached?._id === this.currentId && !this.store.stale()) {
            this.event.set(cached);
            this.loading.set(false);
            return;
        }

        this.loading.set(true);

        void this.fetchEvent();
    }


    private async fetchEvent(): Promise<void> {
        try {
            this.event.set(
                await this.store.getById(this.currentId)
            );

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


    protected async onUpdate(payload: EventPayload): Promise<void> {
        if (this.submitting()) return;

        this.submitting.set(true);

        try {
            const updated = await this.store.update(this.currentId, payload);

            this.router.navigate([
                '/events',
                updated._id
            ]);

            Swal.fire({
                icon: 'success',
                title: 'Evento actualizado',
                text: 'Los cambios se han guardado correctamente.',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            if (!isHttpError(error)) {
                showUnexpectedError(error);
            }

        } finally {
            this.submitting.set(false);
        }
    }


    protected onCancel(): void {
        this.router.navigate([
            '/events',
            this.currentId
        ]);
    }

}