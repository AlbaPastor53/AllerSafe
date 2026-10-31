import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isLoginRequest = req.url.includes('/auth/login');

  const token = auth.token();
  const request =
    token && !isLoginRequest
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRequest) {
        const wasAuthenticated = auth.isAuthenticated();
        auth.logout();

        if (wasAuthenticated) {
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
        }
      }

      return throwError(() => error);
    })
  );
};
