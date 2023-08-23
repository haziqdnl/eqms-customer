import { Injectable } from '@angular/core';
import { AppConfigService } from '../services/app-config/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiStateService {

  svcName: string = 'stateservice.svc';
  constructor(public http: HttpClient, private appConfigService: AppConfigService) {}

  public apiGetComboboxListState(): Observable<any> {
    return this.http.get(`${this.appConfigService.apiBaseUrl}/${this.svcName}/ComboboxListState`, { 'headers': { 'content-type': 'application/json' } } )
      .pipe( catchError( err => { throw err; } ) );
  }
}