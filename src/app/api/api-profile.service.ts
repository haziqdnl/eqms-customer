import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiProfileService {

  svcName: string = 'profileservice.svc';
  constructor(public http: HttpClient, private appConfigService: AppConfigService) {}

  public apiGetProfileInfo(body: any, token: any): Observable<any> {
    return this.http.post(`${this.appConfigService.apiBaseUrl}/${this.svcName}/GetProfileInfo`, body, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } })
      .pipe( catchError( err => { throw err; } ) );
  }

  public apiCRUD(body: any, token: any): Observable<any> {
    return this.http.post(`${this.appConfigService.apiBaseUrl}/${this.svcName}/CRUD`, body, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } })
      .pipe( catchError( err => { throw err; } ) );
  }
}