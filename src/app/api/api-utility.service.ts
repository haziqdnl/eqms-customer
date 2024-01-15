import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralService } from '../services/general/general.service';

@Injectable({ providedIn: 'root' })
export class ApiUtilityService {

  svcName: string = 'utilityservice.svc';
  constructor(private g: GeneralService) {}

  public apiTestConnection()                      : Observable<any> { return this.g.httpGet(this.svcName, 'TestConnection');                }
  public apiValidateJWTToken(token: any)          : Observable<any> { return this.g.httpGet(this.svcName, 'ValidateJWTToken', token);       }
  public apiDecodeJWTToken(body: any)             : Observable<any> { return this.g.httpPost(this.svcName, 'DecodeJWTToken', body);         }
  public apiCheckInByQRCode(body: any, token: any): Observable<any> { return this.g.httpPost(this.svcName, 'CheckInByQRCode', body, token); }
  public SendOTPEmail(body: any)                  : Observable<any> { return this.g.httpPost(this.svcName, 'SendOTPEmail', body);           }
}