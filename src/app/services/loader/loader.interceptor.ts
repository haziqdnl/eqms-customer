import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoaderService } from './loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  private totalRequest = 0;
  constructor(private loaderService: LoaderService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.totalRequest++;
    this.loaderService.setLoading(true);
    return next.handle(request).pipe( finalize( () => {
      setTimeout( () => { 
        this.loaderService.setLoading(false); 
        this.totalRequest = 0; 
      }, this.totalRequest * 500 );
    }));
  }
}