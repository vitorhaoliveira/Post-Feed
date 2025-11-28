import { HttpInterceptorFn } from '@angular/common/http';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Only modify requests that don't already have a complete URL
  if (!req.url.startsWith('http')) {
    const apiReq = req.clone({
      url: `${API_BASE_URL}${req.url}`
    });
    return next(apiReq);
  }
  return next(req);
};

