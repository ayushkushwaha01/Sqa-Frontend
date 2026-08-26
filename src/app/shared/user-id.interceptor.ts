import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class UserIdInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // 🔥 Grab the exact UserId from your Local Storage
    const userId = localStorage.getItem('UserId');

    // 🔥 If it exists, attach it as a custom header called "UserId"
    if (userId) {
      request = request.clone({
        setHeaders: {
          UserId: userId
        }
      });
    }

    return next.handle(request);
  }
}