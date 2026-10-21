import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

export function isHttpError(error: unknown): error is HttpErrorResponse {
  return error instanceof HttpErrorResponse;
}

export function showUnexpectedError(error?: unknown): void {
  const isTimeout = (error as { name?: string } | null | undefined)?.name === 'TimeoutError';

  if (error) {
    console.error(error);
  }

  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: isTimeout
      ? 'La petición ha superado el tiempo de espera. Comprueba que la API esté activa.'
      : 'La respuesta del servidor no es válida. Inténtalo de nuevo más tarde.',
    confirmButtonColor: '#FF385C',
    timer: 5000,
    timerProgressBar: true
  });
}
