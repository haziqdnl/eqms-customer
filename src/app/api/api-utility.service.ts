import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiUtilityService {

  svcName: string = 'utilityservice.svc';
  constructor(public http: HttpClient, private g: GeneralService) {}

  public apiTestConnection(): Observable<any> {
    return this.http.get(`${this.g.getEnvApiUrl()}/${this.svcName}/TestConnection`, { 'headers': { 'content-type': 'application/json' } });
  }

  public apiDecodeJWTToken(body: any): Observable<any> {
    return this.http.post(`${this.g.getEnvApiUrl()}/${this.svcName}/DecodeJWTToken`, body, { 'headers': { 'content-type': 'application/json' } })
      .pipe( catchError( err => { throw err; } ) );
  }

  public apiValidateJWTToken(token: any): Observable<any> {
    return this.http.get(`${this.g.getEnvApiUrl()}/${this.svcName}/ValidateJWTToken`, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } })
      .pipe( catchError( err => { throw err; } ) );
  }

  public apiCheckInByQRCode(body: any, token: any): Observable<any> {
    return this.http.post(`${this.g.getEnvApiUrl()}/${this.svcName}/CheckInByQRCode`, body, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } })
      .pipe( catchError( err => { throw err; } ) );
  }

  public SendOTPEmail(body: any): Observable<any> {
    return this.http.post(`${this.g.getEnvApiUrl()}/${this.svcName}/SendOTPEmail`, body, { 'headers': { 'content-type': 'application/json' } })
      .pipe( catchError( err => { throw err; } ) );
  }
}