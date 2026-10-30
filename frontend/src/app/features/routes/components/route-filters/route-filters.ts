import {
    ChangeDetectionStrategy,
    Component,
    inject,
    output
} from '@angular/core';

import {
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';

import {
    CATEGORY_LABELS,
    EventCategory,
    RouteFilters as RouteFiltersValue
} from '../../../../core/models/courses.model';


@Component({
    selector: 'app-route-filters',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule
    ],
    template: `
        <form
            [formGroup]="form"
            (ngSubmit)="apply()"
            class="rounded-2xl border border-gray-200 bg-white p-4"
        >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <div>
                    <label class="form-label" for="category">
                        Categoría
                    </label>

                    <select
                        id="category"
                        class="form-input"
                        formControlName="category"
                    >
                        <option value="">Todas</option>

                        @for (option of categories; track option.value) {
                            <option [value]="option.value">
                                {{ option.label }}
                            </option>
                        }
                    </select>
                </div>

                <div>
                    <label class="form-label" for="status">
                        Estado de actividad
                    </label>

                    <select
                        id="status"
                        class="form-input"
                        formControlName="status"
                    >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                </div>

                <div>
                    <label class="form-label" for="eventStatus">
                        Estado del evento
                    </label>

                    <select
                        id="eventStatus"
                        class="form-input"
                        formControlName="eventStatus"
                    >
                        <option value="all">Todos</option>
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                    </select>
                </div>

            </div>

            <div class="mt-4 flex justify-end gap-3">
                <button
                    type="button"
                    class="button-secondary"
                    (click)="clear()"
                >
                    Limpiar
                </button>

                <button
                    type="submit"
                    class="button-primary"
                >
                    Aplicar filtros
                </button>
            </div>
        </form>
    `
})


export class RouteFilters {

    private readonly fb = inject(FormBuilder);


    filtersChange = output<RouteFiltersValue>();


    protected readonly categories = (
        Object.entries(CATEGORY_LABELS) as [EventCategory, string][]
    ).map(([value, label]) => ({
        value,
        label
    }));


    protected readonly form = this.fb.nonNullable.group({
        category: [''],
        status: ['all'],
        eventStatus: ['all']
    });


    protected apply(): void {
        const v = this.form.getRawValue();

        const f: RouteFiltersValue = {
            status: v.status as RouteFiltersValue['status'],
            eventStatus: v.eventStatus as RouteFiltersValue['eventStatus']
        };

        if (v.category) {
            f.category = v.category;
        }

        this.filtersChange.emit(f);
    }


    protected clear(): void {
        this.form.reset({
            category: '',
            status: 'all',
            eventStatus: 'all'
        });

        this.filtersChange.emit({
            status: 'all',
            eventStatus: 'all'
        });
    }

}