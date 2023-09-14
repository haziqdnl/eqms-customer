import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiApptService {

  svcName: string = 'apptservice.svc';
  constructor(public http: HttpClient, private g: GeneralService) {}

  public apiGetAppt(data:any): Observable<any> {
    return this.http.get(`${this.g.getEnvApiUrl()}/${this.svcName}/GetAppt`, { 'headers': { 'content-type': 'application/json', 'SessionToken': data } } )
      .pipe( catchError( err => { throw err; } ) );
  }

  public apiGetApptDates(bodyData: any, headerData: any): Observable<any> {
    return this.http.post(`${this.g.getEnvApiUrl()}/${this.svcName}/GetApptDates`, bodyData, { 'headers': { 'content-type': 'application/json', 'SessionToken': headerData } })
      .pipe( catchError( err => { throw err; } ) );
  }

  public apiGetApptTime(bodyData: any, headerData: any): Observable<any> {
    return this.http.post(`${this.g.getEnvApiUrl()}/${this.svcName}/GetApptTime`, bodyData, { 'headers': { 'content-type': 'application/json', 'SessionToken': headerData } })
      .pipe( catchError( err => { throw err; } ) );
  }

  public apiCRUD(bodyData: any, headerData: any): Observable<any> {
    return this.http.post(`${this.g.getEnvApiUrl()}/${this.svcName}/CRUD`, bodyData, { 'headers': { 'content-type': 'application/json', 'SessionToken': headerData } })
      .pipe( catchError( err => { throw err; } ) );
  }
}