import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiOutletService {

  svcName: string = 'outletservice.svc';
  constructor(public http: HttpClient, private appConfigService: AppConfigService) {}

  public apiGetListOutletByState(): Observable<any> {
    return this.http.get(`${this.appConfigService.apiBaseUrl}/${this.svcName}/ListOutletByState`, { 'headers': { 'content-type': 'application/json' } } )
      .pipe( catchError( err => { throw err; } ) );
  }
}