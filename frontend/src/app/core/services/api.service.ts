import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize, from, switchMap, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.API_URL;
  private readonly requestTimeout = environment.requestTimeout;

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, {
        headers: this.headers(),
        params,
        withCredentials: true
      })
      .pipe(timeout(this.requestTimeout));
  }

  /**
   * GET con cancelación real mediante AbortController.
   * Se usa solo en endpoints públicos que necesitan abortar peticiones
   * anteriores cuando cambian los filtros.
   */
  getWithSignal<T>(
    endpoint: string,
    params: HttpParams | undefined,
    signal: AbortSignal
  ): Observable<T> {
    const query = params?.toString();
    const url = `${this.baseUrl}/${endpoint}${query ? `?${query}` : ''}`;
    const controller = new AbortController();
    const abort = () => controller.abort();

    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', abort, { once: true });
    }

    const timer = setTimeout(() => controller.abort(), this.requestTimeout);

    return from(
      fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal
      })
    ).pipe(
      switchMap(async (response) => {
        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw body ?? new Error(`HTTP ${response.status}`);
        }

        return body as T;
      }),
      finalize(() => {
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
      })
    );
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.headers(),
        withCredentials: true
      })
      .pipe(timeout(this.requestTimeout));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.headers(),
        withCredentials: true
      })
      .pipe(timeout(this.requestTimeout));
  }

  patch<T>(endpoint: string, body: unknown = {}): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.headers(),
        withCredentials: true
      })
      .pipe(timeout(this.requestTimeout));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint}`, {
        headers: this.headers(),
        withCredentials: true
      })
      .pipe(timeout(this.requestTimeout));
  }
}
