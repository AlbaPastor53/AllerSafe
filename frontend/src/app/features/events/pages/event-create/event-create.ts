import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal
} from '@angular/core';

import {
    Router,
    RouterLink
} from '@angular/router';

import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

import { EventPayload } from '../../../../core/models/event.model';
import { EventsService } from '../../../../core/services/events.service';
import { EventsStore } from '../../../../core/stores/events.store';

import {
    isHttpError,
    showUnexpectedError
} from '../../../../shared/utils/error.util';

import { EventForm } from '../../components/event-form/event-form';


@Component({
    selector: 'app-event-create',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,

    imports: [
        RouterLink,
        EventForm
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
                    Nuevo evento
                </span>

            </nav>

            <div class="mb-6">

                <h1 class="text-2xl font-semibold text-gray-900">
                    Crear evento
                </h1>

                <p class="mt-0.5 text-sm text-gray-500">
                    Rellena los datos obligatorios para dar de alta un evento.
                </p>

            </div>

            <app-event-form
                [event]="null"
                (formSubmit)="onCreate($event)"
                (cancelled)="onCancel()"
            />

        </div>
    `
})


export class EventCreate {

    private readonly service = inject(EventsService);

    private readonly store = inject(EventsStore);

    private readonly router = inject(Router);


    protected readonly submitting = signal(false);


    protected async onCreate(payload: EventPayload): Promise<void> {

        if (this.submitting()) return;

        this.submitting.set(true);

        try {
            const created = await firstValueFrom(
                this.service.create(payload)
            );

            this.store.markStale();

            this.router.navigate([
                '/events',
                created._id
            ]);

            Swal.fire({
                icon: 'success',
                title: 'Evento creado',
                text: `"${created.name}" se ha guardado correctamente.`,
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
        this.router.navigate(['/events']);
    }

}