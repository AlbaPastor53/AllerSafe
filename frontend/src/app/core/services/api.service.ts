import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
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
      .get<T>(`${this.baseUrl}/${endpoint}`, { headers: this.headers(), params })
      .pipe(timeout(this.requestTimeout));
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body, { headers: this.headers() })
      .pipe(timeout(this.requestTimeout));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}`, body, { headers: this.headers() })
      .pipe(timeout(this.requestTimeout));
  }

  patch<T>(endpoint: string, body: unknown = {}): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}`, body, { headers: this.headers() })
      .pipe(timeout(this.requestTimeout));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint}`, { headers: this.headers() })
      .pipe(timeout(this.requestTimeout));
  }
}
