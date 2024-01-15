import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiApptService {

  svcName: string = 'apptservice.svc';
  constructor(private g: GeneralService) {}

  public apiGetAppt(token:any)                  : Observable<any> { return this.g.httpGet(this.svcName, 'GetAppt', token);              }
  public apiGetApptDates(body: any, token: any) : Observable<any> { return this.g.httpPost(this.svcName, 'GetApptDates', body, token);  }
  public apiGetApptTime(body: any, token: any)  : Observable<any> { return this.g.httpPost(this.svcName, 'GetApptTime', body, token);   }
  public apiCRUD(body: any, token: any)         : Observable<any> { return this.g.httpPost(this.svcName, 'CRUD', body, token);          }
}