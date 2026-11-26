import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  retry,
  shareReplay,
  throwError
} from 'rxjs';
import Swal from 'sweetalert2';
import { AuthUser } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

// Varias peticiones pueden recibir el 401 a la vez: una sola renovación.
let renewalInFlight: Observable<AuthUser | void> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isLoginRequest = req.url.includes('/auth/login');
  const isRefreshRequest = req.url.includes('/auth/refresh');
  const isRenewRequest = req.url.includes('/auth/renew');
  const isRenewalRequest = isRefreshRequest || isRenewRequest;

  return next(req).pipe(
    retry({
      count: 1,
      delay: (error: HttpErrorResponse) => {
        const role = auth.user()?.role;
        const canRenew =
          error.status === 401 &&
          !isLoginRequest &&
          !isRenewalRequest &&
          (role === 'Client' || role === 'Admin');

        if (!canRenew) {
          return throwError(() => error);
        }

        if (!renewalInFlight) {
          const renewal$: Observable<AuthUser | void> =
            role === 'Client' ? auth.refresh() : auth.renew();

          renewalInFlight = renewal$.pipe(
            finalize(() => {
              renewalInFlight = null;
            }),
            shareReplay({ bufferSize: 1, refCount: false })
          );
        }

        return renewalInFlight;
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const mustLogout =
        error.status === 401 || (isRenewalRequest && error.status === 403);

      if (isLoginRequest || !mustLogout) {
        return throwError(() => error);
      }

      if (!auth.isAuthenticated()) {
        return throwError(() => error);
      }

      auth.clearSession();

      void router
        .navigate(['/login'], {
          queryParams: { returnUrl: router.url }
        })
        .then(() =>
          Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Vuelve a iniciar sesión para continuar.',
            confirmButtonColor: '#FF385C'
          })
        );

      return throwError(() => error);
    })
  );
};
