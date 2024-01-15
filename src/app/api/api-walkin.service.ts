import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiWalkinService {

  svcName: string = 'walkinservice.svc';
  constructor(private g: GeneralService) {}

  public apiGetWalkinByProfile(token: any): Observable<any> { return this.g.httpGet(this.svcName, 'GetWalkinByProfile', token); }
}