import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiNewsfeedService {

  svcName: string = 'newsfeedservice.svc';
  constructor(public http: HttpClient, private appConfigService: AppConfigService) {}

  public apiGetCustNewsfeedInfo(token:any): Observable<any> {
    return this.http.get(`${this.appConfigService.apiBaseUrl}/${this.svcName}/GetCustNewsfeedInfo`, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } } )
      .pipe( catchError( err => { throw err; } ) );
  }

  private apiGetConsoleNewsfeedInfo(body: any, token: any): Observable<any> {
    return this.http.post(`${this.appConfigService.apiBaseUrl}/${this.svcName}/GetConsoleNewsfeedInfo`, body, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } } )
      .pipe( catchError( err => { throw err; } ) );
  }

  private apiCRUD(body: any, token: any): Observable<any> {
    return this.http.post(`${this.appConfigService.apiBaseUrl}/${this.svcName}/CRUD`, body, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } })
      .pipe( catchError( err => { throw err; } ) );
  }
}