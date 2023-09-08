import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { AppConfigService } from '../services/app-config/app-config.service';

@Injectable({ providedIn: 'root' })
export class ApiUtilityService {

  svcName: string = 'utilityservice.svc';
  constructor(public http: HttpClient, private appConfigService: AppConfigService) {}

  public apiTestConnection(): Observable<any> {
    return this.http.get(`${this.appConfigService.apiBaseUrl}/${this.svcName}/TestConnection`, { 'headers': { 'content-type': 'application/json' } });
  }

  public apiDecodeJWTToken(body: any): Observable<any> {
    return this.http.post(`${this.appConfigService.apiBaseUrl}/${this.svcName}/DecodeJWTToken`, body, { 'headers': { 'content-type': 'application/json' } })
      .pipe( catchError( err => { throw err; } ) );
  }

  public apiValidateJWTToken(token: any): Observable<any> {
    return this.http.get(`${this.appConfigService.apiBaseUrl}/${this.svcName}/ValidateJWTToken`, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } })
      .pipe( catchError( err => { throw err; } ) );
  }

  public apiCheckInByQRCode(body: any, token: any): Observable<any> {
    return this.http.post(`${this.appConfigService.apiBaseUrl}/${this.svcName}/CheckInByQRCode`, body, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } })
      .pipe( catchError( err => { throw err; } ) );
  }
}