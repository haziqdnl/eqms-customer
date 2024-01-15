import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiProfileService {

  svcName: string = 'profileservice.svc';
  constructor(private g: GeneralService) {}

  public apiGetProfileInfo(body: any, token: any) : Observable<any> { return this.g.httpPost(this.svcName, 'GetProfileInfo', body, token);  }
  public apiCheckExists(body: any)                : Observable<any> { return this.g.httpPost(this.svcName, 'CheckExists', body);            }
  public apiCRUD(body: any, token: any)           : Observable<any> { return this.g.httpPost(this.svcName, 'CRUD', body, token);            }
}