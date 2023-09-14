import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiProfileService {

  svcName: string = 'profileservice.svc';
  constructor(public http: HttpClient, private g: GeneralService) {}

  public apiGetProfileInfo(body: any, token: any): Observable<any> {
    return this.http.post(`${this.g.getEnvApiUrl()}/${this.svcName}/GetProfileInfo`, body, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } })
      .pipe( catchError( err => { throw err; } ) );
  }

  public apiCRUD(body: any, token: any): Observable<any> {
    return this.http.post(`${this.g.getEnvApiUrl()}/${this.svcName}/CRUD`, body, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } })
      .pipe( catchError( err => { throw err; } ) );
  }
}