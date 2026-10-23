import {ChangeDetectionStrategy,Component,effect,inject,input,output} from '@angular/core';
import {FormBuilder, ReactiveFormsModule,Validators} from '@angular/forms';
import {CATEGORY_LABELS,EventCategory,EventStatus,Courses,CoursesPayload} from '../../../../core/models/courses.model';
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

                    <div>
                        <label class="form-label" for="date">
                            Fecha y hora *
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
                        <label class="form-label" for="category">
                            Categoría *
                        </label>

                        <select
                            id="category"
                            class="form-input"
                            formControlName="category"
                        >
                            @for (option of categories; track option.value) {
                                <option [value]="option.value">
                                    {{ option.label }}
                                </option>
                            }
                        </select>
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

                    @if (route()) {
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
                    }

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


    route = input<Courses | null>(null);

    formSubmit = output<CoursesPayload>();

    cancelled = output<void>();


    protected readonly categories = (
        Object.entries(CATEGORY_LABELS) as [EventCategory, string][]
    ).map(([value, label]) => ({
        value,
        label
    }));


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
        },
        {
            value: 'cancelled',
            label: 'Cancelado'
        },
        {
            value: 'completed',
            label: 'Completado'
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
        price: [
            0,
            [
                Validators.required,
                Validators.min(0)
            ]
        ],
        category: [
            'cocina' as EventCategory,
            [
                Validators.required
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
            'published' as EventStatus,
            [
                Validators.required
            ]
        ]
    });


    constructor() {
        effect(() => {
            const e = this.route();

            if (e) {
                this.form.patchValue({
                    name: e.name,
                    description: e.description,
                    date: formatDateTimeLocal(e.date),
                    price: e.price,
                    category: e.category,
                    capacity: e.capacity,
                    slug: e.slug,
                    status: e.status
                });
            }
        });
    }


    protected errorFor(name: string): string | null {
        const c = this.form.get(name);

        if (!c || !c.touched || c.valid) {
            return null;
        }

        if (c.errors?.['required']) {
            return 'Este campo es obligatorio.';
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
            price: Number(v.price),
            category: v.category,
            capacity: Number(v.capacity)
        };

        if (v.slug.trim()) {
            payload.slug = v.slug.trim();
        }

        if (this.route()) {
            payload.status = v.status;
        }

        this.formSubmit.emit(payload);
    }

}