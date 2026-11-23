import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Chatbot } from './shared/components/chatbot/chatbot';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Chatbot],
  templateUrl: './app.html'
})
export class App {
  private readonly router = inject(Router);

  protected readonly showChatbot = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/shop'))
    ),
    { initialValue: this.router.url.startsWith('/shop') }
  );
}
