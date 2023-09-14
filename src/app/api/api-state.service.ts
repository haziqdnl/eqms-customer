import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiStateService {

  svcName: string = 'stateservice.svc';
  constructor(public http: HttpClient, private g: GeneralService) {}

  public apiGetComboboxListState(): Observable<any> {
    return this.http.get(`${this.g.getEnvApiUrl()}/${this.svcName}/ComboboxListState`, { 'headers': { 'content-type': 'application/json' } } )
      .pipe( catchError( err => { throw err; } ) );
  }
}