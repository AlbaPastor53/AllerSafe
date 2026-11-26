import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { catchError, filter, firstValueFrom, map, of, tap } from 'rxjs';
import { ApiService } from './core/services/api.service';
import { AuthService } from './core/services/auth.service';
import { AuthStore } from './core/stores/auth.store';
import { AuthMeResponse } from './core/models/auth.model';
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
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly authStore = inject(AuthStore);

  protected readonly showChatbot = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      tap(() => void this.me()),
      map(() => this.router.url.startsWith('/shop'))
    ),
    { initialValue: this.router.url.startsWith('/shop') }
  );

  constructor() {
    this.authStore.ready = this.me();
  }

  private me(): Promise<void> {
    return firstValueFrom(
      this.api.get<AuthMeResponse>('auth/me').pipe(
        map((response) => {
          this.authStore.setUser(response?.data?.user ?? null);
          this.auth.syncRenewalTimer();
        }),
        catchError(() => {
          this.authStore.setUser(null);
          this.auth.syncRenewalTimer();
          return of(undefined);
        })
      )
    );
  }
}
