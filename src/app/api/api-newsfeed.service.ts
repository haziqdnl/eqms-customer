import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiNewsfeedService {

  svcName: string = 'newsfeedservice.svc';
  constructor(public http: HttpClient, private g: GeneralService) {}

  public apiGetCustNewsfeedInfo(token:any): Observable<any> {
    return this.http.get(`${this.g.getEnvApiUrl()}/${this.svcName}/GetCustNewsfeedInfo`, { 'headers': { 'content-type': 'application/json', 'SessionToken': token } } )
      .pipe( catchError( err => { throw err; } ) );
  }
}