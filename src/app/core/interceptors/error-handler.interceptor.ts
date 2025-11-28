import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface HttpErrorInfo {
  message: string;
  status: number;
  statusText: string;
}

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage: string;
      
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Erro de rede: ${error.error.message}`;
      } else {
        // Backend returned an unsuccessful response code
        switch (error.status) {
          case 0:
            errorMessage = 'Sem conexão com o servidor. Verifique sua internet.';
            break;
          case 400:
            errorMessage = 'Requisição inválida. Verifique os dados enviados.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          default:
            errorMessage = `Erro ${error.status}: ${error.statusText}`;
        }
      }

      const errorInfo: HttpErrorInfo = {
        message: errorMessage,
        status: error.status,
        statusText: error.statusText
      };

      console.error('HTTP Error:', errorInfo);
      return throwError(() => errorInfo);
    })
  );
};

