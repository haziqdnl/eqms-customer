import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GeneralService {

  constructor(
    private deviceDetectorService: DeviceDetectorService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  /**
   *  Method: Get environment details
   */
  public getEnvName()       { return environment.environmentName; }
  public getEnvDomainUrl()  { return environment.domainUrl; }
  public getEnvApiUrl()     { return environment.apiUrl; }

  /**
   *  Method: Customer Token
   */
  public setCustToken(t: any)  { localStorage.setItem('eqmsCustomer_jwtToken', t); }
  public getCustToken()    { return localStorage.getItem('eqmsCustomer_jwtToken'); }

  /**
   *  Method: Error Handling
   */
  public apiRespError(rsp: any) {
    if (rsp.RespCode != '401') {
      this.snackBar.open(rsp.RespMessage, 'Close', {
        duration          : 7000,
        horizontalPosition: 'center',
        verticalPosition  : 'bottom',
        panelClass        : 'error',
      });
    }
    else 
      this.endSession();
  }

  /**
   *  Method: End Session / Reset Token
   */
  public endSession() {
    this.setCustToken("");
    this.router.navigate(['login']);
  }

  /**
   *  Method: To set input type text as numeric only
   */
  public numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return charCode > 31 && (charCode < 48 || charCode > 57) ? false : true;
  }

  /**
   *  Method: Match two passwords
   */
  public matchPasswords(pwd1: string, pwd2: string) {
    return (formGroup: FormGroup) => {
      const pwdCtrl1 = formGroup.controls[pwd1];
      const pwdCtrl2 = formGroup.controls[pwd2];

      if (!pwdCtrl1 || !pwdCtrl2)                                   null;
      if (pwdCtrl2.errors && !pwdCtrl2.errors['passwordMismatch'])  null;

      pwdCtrl1.value !== pwdCtrl2.value ? pwdCtrl2.setErrors({ passwordMismatch: true }) : pwdCtrl2.setErrors(null);
    }
  }
  
  /**
   *  Method: To identify user device is mobile
   */
  public getIsMobile() { return this.deviceDetectorService.isMobile(); }

  /**
   *  Method: Get current Date (no time)
   */
  public getCurrentDateOnly() {
    let todayDateTime = new Date();
    let year = todayDateTime.getFullYear();
    let month = (todayDateTime.getMonth() + 1).toString().length == 1 ? '0' + (todayDateTime.getMonth() + 1) : todayDateTime.getMonth() + 1;
    let day = todayDateTime.getDate().toString().length == 1 ? '0' + todayDateTime.getDate() : todayDateTime.getDate();
    return new Date(year + '-' + month + '-' + day);
  }
}