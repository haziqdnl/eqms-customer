import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiOutletService {

  svcName: string = 'outletservice.svc';
  constructor(public http: HttpClient, private g: GeneralService) {}

  public apiGetListOutletByState(): Observable<any> {
    return this.http.get(`${this.g.getEnvApiUrl()}/${this.svcName}/ListOutletByState`, { 'headers': { 'content-type': 'application/json' } } )
      .pipe( catchError( err => { throw err; } ) );
  }
}