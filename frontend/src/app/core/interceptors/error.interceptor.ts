import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiErrorBody } from '../models/api.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Se ha producido un error inesperado.';

      if ((error as { name?: string }).name === 'TimeoutError') {
        message = 'La petición ha superado el tiempo de espera. Comprueba que la API esté activa.';
      } else if (error.status === 0) {
        message = 'No se puede conectar con el servidor. Comprueba que la API esté en marcha.';
      } else {
        const body = error.error as ApiErrorBody | null | undefined;
        const apiMessage = body?.error?.message;

        if (error.status === 400) {
          message = apiMessage ?? 'La solicitud no es válida.';
          const details = body?.error?.details;
          if (Array.isArray(details) && details.length > 0) {
            const lines = details
              .slice(0, 8)
              .map((item) => {
                const issue = item as { path?: unknown; message?: unknown };
                const path = typeof issue.path === 'string' && issue.path ? issue.path : 'campo';
                const text = typeof issue.message === 'string' ? issue.message : 'no válido';
                return `${path}: ${text}`;
              })
              .join('\n');
            message = `${message}\n\n${lines}`;
          }
        } else if (error.status === 404) {
          message = apiMessage ?? 'No se ha encontrado el recurso solicitado.';
        } else if (error.status === 409) {
          message = apiMessage ?? 'La operación entra en conflicto con el estado actual del evento.';
        } else if (error.status >= 500) {
          message = 'Error del servidor. Inténtalo de nuevo más tarde.';
        } else {
          message = apiMessage ?? message;
        }
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#FF385C',
        timer: 5000,
        timerProgressBar: true
      });

      return throwError(() => error);
    })
  );
};
