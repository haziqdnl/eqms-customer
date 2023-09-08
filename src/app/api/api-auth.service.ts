import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiAuthService {

  svcName: string = 'sessionservice.svc';
  constructor(public http: HttpClient, private appConfigService: AppConfigService) {}

  public apiCustomerLogin(body: any): Observable<any> {
    return this.http.post(`${this.appConfigService.apiBaseUrl}/${this.svcName}/CustomerLogin`, body, { 'headers': { 'content-type': 'application/json' } })
      .pipe( catchError( err => { throw err; } ) );
  }
}