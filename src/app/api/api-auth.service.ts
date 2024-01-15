import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiAuthService {

  svcName: string = 'sessionservice.svc';
  constructor(private g: GeneralService) {}

  public apiCustomerLogin(body: any): Observable<any> { return this.g.httpPost(this.svcName, 'CustomerLogin', body); }
}