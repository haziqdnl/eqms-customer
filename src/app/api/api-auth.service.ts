import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiAuthService {

  svcName: string = 'sessionservice.svc';
  constructor(public http: HttpClient, private g: GeneralService) {}

  public apiCustomerLogin(body: any): Observable<any> {
    return this.http.post(`${this.g.getEnvApiUrl()}/${this.svcName}/CustomerLogin`, body, { 'headers': { 'content-type': 'application/json' } })
      .pipe( catchError( err => { throw err; } ) );
  }
}