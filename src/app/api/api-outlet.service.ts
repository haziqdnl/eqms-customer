import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiOutletService {

  svcName: string = 'outletservice.svc';
  constructor(private g: GeneralService) {}

  public apiGetListOutletByState(): Observable<any> { return this.g.httpGet(this.svcName, 'ListOutletByState'); }
}