import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Event } from '../../../../core/models/event.model';
import { Carousel } from '../../../../shared/components/carousel/carousel';
import { ExperienceCard } from '../experience-card/experience-card';

@Component({
  selector: 'app-event-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Carousel, ExperienceCard],
  template: `
    <app-carousel
      variant="large"
      title="Experiencias destacadas"
      subtitle="Descubre las próximas clases y talleres disponibles."
      [loading]="loading()"
      [error]="error()"
      [itemCount]="events().length"
      emptyTitle="Sin experiencias publicadas"
      emptyMessage="Todavía no hay experiencias que coincidan con los filtros."
      (retry)="retry.emit()"
    >
      @for (event of events(); track event._id) {
        <div class="w-full shrink-0 snap-center">
          <app-experience-card [event]="event" variant="large" />
        </div>
      }
    </app-carousel>
  `
})
export class EventCarousel {
  events = input<readonly Event[]>([]);
  loading = input(false);
  error = input<string | null>(null);

  retry = output<void>();
}
