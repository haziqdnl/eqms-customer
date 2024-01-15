import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiNewsfeedService {

  svcName: string = 'newsfeedservice.svc';
  constructor(private g: GeneralService) {}

  public apiGetCustNewsfeedInfo(token: any): Observable<any> { return this.g.httpGet(this.svcName, 'GetCustNewsfeedInfo', token); }
}