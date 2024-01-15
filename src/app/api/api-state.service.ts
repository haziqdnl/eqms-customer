import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiStateService {

  svcName: string = 'stateservice.svc';
  constructor(private g: GeneralService) {}

  public apiGetComboboxListState(): Observable<any> { return this.g.httpGet(this.svcName, 'ComboboxListState'); }
}