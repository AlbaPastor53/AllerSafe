import {
    ChangeDetectionStrategy,
    Component,
    effect,
    inject,
    input,
    output,
    signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
    Category,
    Courses,
    CoursesPayload,
    EventStatus,
    Host,
    Location,
    refId
} from '../../../../core/models/courses.model';
import { CatalogService } from '../../../../core/services/catalog.service';
import { formatDateTimeLocal } from '../../../../shared/utils/format.util';

@Component({
    selector: 'app-route-form',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule
    ],
    template: `
        <form
            [formGroup]="form"
            (ngSubmit)="submit()"
            class="space-y-8 rounded-2xl border border-gray-200 bg-white p-6"
        >
            @if (catalogError()) {
                <p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {{ catalogError() }}
                </p>
            }

            <section class="space-y-4">
                <h2 class="text-base font-semibold text-gray-900">
                    Datos del evento
                </h2>

                <div class="grid gap-4 sm:grid-cols-2">

                    <div class="sm:col-span-2">
                        <label class="form-label" for="name">
                            Nombre *
                        </label>

                        <input
                            id="name"
                            class="form-input"
                            formControlName="name"
                            maxlength="120"
                            placeholder="Ej.: Taller de cocina sin gluten"
                        />

                        @if (errorFor('name')) {
                            <p class="form-error">
                                {{ errorFor('name') }}
                            </p>
                        }
                    </div>

                    <div class="sm:col-span-2">
                        <label class="form-label" for="description">
                            Descripción *
                        </label>

                        <textarea
                            id="description"
                            rows="4"
                            class="form-input"
                            formControlName="description"
                            maxlength="2000"
                            placeholder="Describe el contenido del evento..."
                        ></textarea>

                        @if (errorFor('description')) {
                            <p class="form-error">
                                {{ errorFor('description') }}
                            </p>
                        }
                    </div>

                    <div class="sm:col-span-2">
                        <label class="form-label" for="slug">
                            Slug (opcional)
                        </label>

                        <input
                            id="slug"
                            class="form-input"
                            formControlName="slug"
                            placeholder="Se genera automáticamente si se deja vacío"
                        />
                    </div>

                </div>
            </section>

            <section class="space-y-4">
                <h2 class="text-base font-semibold text-gray-900">
                    Programación
                </h2>

                <div class="grid gap-4 sm:grid-cols-2">

                    <div>
                        <label class="form-label" for="date">
                            Fecha y hora de inicio *
                        </label>

                        <input
                            id="date"
                            type="datetime-local"
                            class="form-input"
                            formControlName="date"
                        />

                        @if (errorFor('date')) {
                            <p class="form-error">
                                {{ errorFor('date') }}
                            </p>
                        }
                    </div>

                    <div>
                        <label class="form-label" for="time">
                            Hora (HH:mm) *
                        </label>

                        <input
                            id="time"
                            type="time"
                            class="form-input"
                            formControlName="time"
                        />

                        @if (errorFor('time')) {
                            <p class="form-error">
                                {{ errorFor('time') }}
                            </p>
                        }
                    </div>

                    <div>
                        <label class="form-label" for="classNumber">
                            Número de clase *
                        </label>

                        <input
                            id="classNumber"
                            type="number"
                            min="1"
                            step="1"
                            class="form-input"
                            formControlName="classNumber"
                        />

                        @if (errorFor('classNumber')) {
                            <p class="form-error">
                                {{ errorFor('classNumber') }}
                            </p>
                        }
                    </div>

                    <div>
                        <label class="form-label" for="price">
                            Precio (€) *
                        </label>

                        <input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            class="form-input"
                            formControlName="price"
                        />

                        @if (errorFor('price')) {
                            <p class="form-error">
                                {{ errorFor('price') }}
                            </p>
                        }
                    </div>

                    <div>
                        <label class="form-label" for="capacity">
                            Aforo *
                        </label>

                        <input
                            id="capacity"
                            type="number"
                            min="1"
                            step="1"
                            class="form-input"
                            formControlName="capacity"
                        />

                        @if (errorFor('capacity')) {
                            <p class="form-error">
                                {{ errorFor('capacity') }}
                            </p>
                        }
                    </div>

                    <div>
                        <label class="form-label" for="status">
                            Estado del evento
                        </label>

                        <select
                            id="status"
                            class="form-input"
                            formControlName="status"
                        >
                            @for (option of statuses; track option.value) {
                                <option [value]="option.value">
                                    {{ option.label }}
                                </option>
                            }
                        </select>
                    </div>

                </div>
            </section>

            <section class="space-y-4">
                <h2 class="text-base font-semibold text-gray-900">
                    Relaciones
                </h2>

                <div class="grid gap-4 sm:grid-cols-2">

                    <div>
                        <label class="form-label" for="host">
                            Anfitrión *
                        </label>

                        <select
                            id="host"
                            class="form-input"
                            formControlName="host"
                        >
                            <option value="">Selecciona un anfitrión</option>

                            @for (host of hosts(); track host._id) {
                                <option [value]="host._id">
                                    {{ hostLabel(host) }}
                                </option>
                            }
                        </select>

                        @if (errorFor('host')) {
                            <p class="form-error">
                                {{ errorFor('host') }}
                            </p>
                        }
                    </div>

                    <div>
                        <label class="form-label" for="location">
                            Ubicación *
                        </label>

                        <select
                            id="location"
                            class="form-input"
                            formControlName="location"
                        >
                            <option value="">Selecciona una ubicación</option>

                            @for (location of locations(); track location._id) {
                                <option [value]="location._id">
                                    {{ location.name }} — {{ location.address }}
                                </option>
                            }
                        </select>

                        @if (errorFor('location')) {
                            <p class="form-error">
                                {{ errorFor('location') }}
                            </p>
                        }
                    </div>

                    <div class="sm:col-span-2">
                        <label class="form-label" for="categories">
                            Categorías * (mantén pulsado Ctrl para seleccionar varias)
                        </label>

                        <select
                            id="categories"
                            class="form-input"
                            formControlName="categories"
                            multiple
                            size="5"
                        >
                            @for (category of categories(); track category._id) {
                                <option [value]="category._id">
                                    {{ category.name }}
                                </option>
                            }
                        </select>

                        @if (errorFor('categories')) {
                            <p class="form-error">
                                {{ errorFor('categories') }}
                            </p>
                        }
                    </div>

                </div>
            </section>

            <div class="flex justify-end gap-3">
                <button
                    type="button"
                    class="button-secondary"
                    (click)="cancelled.emit()"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    class="button-primary"
                >
                    {{ route() ? 'Guardar cambios' : 'Crear evento' }}
                </button>
            </div>
        </form>
    `
})


export class RouteForm {

    private readonly fb = inject(FormBuilder);

    private readonly catalog = inject(CatalogService);


    route = input<Courses | null>(null);

    formSubmit = output<CoursesPayload>();

    cancelled = output<void>();


    protected readonly hosts = signal<Host[]>([]);

    protected readonly categories = signal<Category[]>([]);

    protected readonly locations = signal<Location[]>([]);

    protected readonly catalogError = signal<string | null>(null);


    protected readonly statuses: Array<{
        value: EventStatus;
        label: string;
    }> = [
        {
            value: 'draft',
            label: 'Borrador'
        },
        {
            value: 'published',
            label: 'Publicado'
        }
    ];


    protected readonly form = this.fb.nonNullable.group({
        name: [
            '',
            [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(120)
            ]
        ],
        description: [
            '',
            [
                Validators.required,
                Validators.minLength(5),
                Validators.maxLength(2000)
            ]
        ],
        date: [
            '',
            [
                Validators.required
            ]
        ],
        time: [
            '',
            [
                Validators.required,
                Validators.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
            ]
        ],
        classNumber: [
            1,
            [
                Validators.required,
                Validators.min(1)
            ]
        ],
        price: [
            0,
            [
                Validators.required,
                Validators.min(0)
            ]
        ],
        capacity: [
            1,
            [
                Validators.required,
                Validators.min(1)
            ]
        ],
        slug: [''],
        status: [
            'draft' as EventStatus,
            [
                Validators.required
            ]
        ],
        host: [
            '',
            [
                Validators.required
            ]
        ],
        categories: this.fb.nonNullable.control<string[]>(
            [],
            [
                Validators.required
            ]
        ),
        location: [
            '',
            [
                Validators.required
            ]
        ]
    });


    constructor() {
        void this.loadCatalogs();

        effect(() => {
            const e = this.route();

            if (e) {
                this.form.patchValue({
                    name: e.name,
                    description: e.description,
                    date: formatDateTimeLocal(e.date),
                    time: e.time,
                    classNumber: e.classNumber,
                    price: e.price,
                    capacity: e.capacity,
                    slug: e.slug,
                    status: e.status,
                    host: refId(e.host),
                    categories: (e.categories ?? []).map(category => category._id),
                    location: refId(e.location)
                });
            }
        });
    }


    protected hostLabel(host: Host): string {
        if (!host.user_id || typeof host.user_id === 'string') {
            return host.slug;
        }

        return host.user_id.name;
    }


    protected errorFor(name: string): string | null {
        const c = this.form.get(name);

        if (!c || !c.touched || c.valid) {
            return null;
        }

        if (c.errors?.['required']) {
            return name === 'categories'
                ? 'Selecciona al menos una categoría.'
                : 'Este campo es obligatorio.';
        }

        if (c.errors?.['minlength']) {
            return 'Introduce más caracteres.';
        }

        if (c.errors?.['maxlength']) {
            return 'Has superado la longitud máxima.';
        }

        if (c.errors?.['min']) {
            return 'El valor debe ser igual o superior al mínimo permitido.';
        }

        if (c.errors?.['pattern']) {
            return 'El formato no es válido (usa HH:mm).';
        }

        return 'Revisa este campo.';
    }


    protected submit(): void {
        this.form.markAllAsTouched();

        if (this.form.invalid) {
            return;
        }

        const v = this.form.getRawValue();

        const payload: CoursesPayload = {
            name: v.name.trim(),
            description: v.description.trim(),
            date: new Date(v.date).toISOString(),
            time: v.time,
            classNumber: Number(v.classNumber),
            price: Number(v.price),
            capacity: Number(v.capacity),
            status: v.status,
            host: v.host,
            categories: v.categories,
            location: v.location
        };

        if (v.slug.trim()) {
            payload.slug = v.slug.trim();
        }

        this.formSubmit.emit(payload);
    }


    private async loadCatalogs(): Promise<void> {
        try {
            const [hosts, categories, locations] = await Promise.all([
                firstValueFrom(this.catalog.listHosts()),
                firstValueFrom(this.catalog.listCategories()),
                firstValueFrom(this.catalog.listLocations())
            ]);

            this.hosts.set(hosts);
            this.categories.set(categories);
            this.locations.set(locations);

        } catch {
            this.catalogError.set(
                'No se han podido cargar anfitriones, categorías y ubicaciones. ' +
                'Comprueba que el backend esté iniciado.'
            );
        }
    }

}
