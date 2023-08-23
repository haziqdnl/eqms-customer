import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiWalkinService {

  svcName: string = 'walkinservice.svc';
  constructor(public http: HttpClient, private appConfigService: AppConfigService) {}

  public apiGetWalkinByProfile(data:any): Observable<any> {
    return this.http.get(`${this.appConfigService.apiBaseUrl}/${this.svcName}/GetWalkinByProfile`, { 'headers': { 'content-type': 'application/json', 'SessionToken': data } } )
      .pipe( catchError( err => { throw err; } ) );
  }

  private apiCRUD(bodyData: any, headerData: any): Observable<any> {
    return this.http.post(`${this.appConfigService.apiBaseUrl}/${this.svcName}/CRUD`, bodyData, { 'headers': { 'content-type': 'application/json', 'SessionToken': headerData } })
      .pipe( catchError( err => { throw err; } ) );
  }
}