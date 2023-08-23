import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiOutletService {

  svcName: string = 'outletservice.svc';
  constructor(public http: HttpClient, private appConfigService: AppConfigService) {}

  private apiGetOutletInfo(bodyData: any, headerData: any): Observable<any> {
    return this.http.post(`${this.appConfigService.apiBaseUrl}/${this.svcName}/GetOutletInfo`, bodyData, { 'headers': { 'content-type': 'application/json', 'SessionToken': headerData } })
      .pipe( catchError( err => { throw err; } ) );
  }

  public apiGetListOutletByState(): Observable<any> {
    return this.http.get(`${this.appConfigService.apiBaseUrl}/${this.svcName}/ListOutletByState`, { 'headers': { 'content-type': 'application/json' } } )
      .pipe( catchError( err => { throw err; } ) );
  }

  private apiGetComboboxListOutlet(data: any): Observable<any> {
    return this.http.post(`${this.appConfigService.apiBaseUrl}/${this.svcName}/ComboboxListOutlet`, data, { 'headers': { 'content-type': 'application/json' } } )
      .pipe( catchError( err => { throw err; } ) );
  }
}