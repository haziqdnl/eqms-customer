import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiWalkinService {

  svcName: string = 'walkinservice.svc';
  constructor(public http: HttpClient, private g: GeneralService) {}

  public apiGetWalkinByProfile(data:any): Observable<any> {
    return this.http.get(`${this.g.getEnvApiUrl()}/${this.svcName}/GetWalkinByProfile`, { 'headers': { 'content-type': 'application/json', 'SessionToken': data } } )
      .pipe( catchError( err => { throw err; } ) );
  }
}