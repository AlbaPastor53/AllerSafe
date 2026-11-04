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
  const isAuthRequest = ['/auth/login', '/auth/me', '/auth/logout'].some(
    (path) => req.url.includes(path)
  );

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRequest) {
        const wasAuthenticated = auth.isAuthenticated();
        auth.clearSession();

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
