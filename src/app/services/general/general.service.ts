import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavController } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GeneralService {

  constructor(
    private deviceDetectorService: DeviceDetectorService,
    private snackBar: MatSnackBar,
    private navController: NavController,
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
   *  Method: Success/Error Handling
   */
  public toastSuccess(msg: any) {
    this.snackBar.open(msg, 'OK', {
      duration          : 5000,
      horizontalPosition: 'right',
      verticalPosition  : 'top',
      panelClass        : 'success',
    });
  }
  public toastError(msg: any) {
    this.snackBar.open(msg, 'Close', {
      duration          : 5000,
      horizontalPosition: 'right',
      verticalPosition  : 'top',
      panelClass        : 'error',
    });
  }
  public apiRespError(rsp: any) { rsp.RespCode != '401' ? this.toastError(rsp.RespMessage) : this.endSession(); }

  /**
   *  Method: URL redirect/navigation
   */
  public redirectTo   (c: string) { this.navController.navigateForward(c); }
  public redirectBack (c: string) { this.navController.navigateBack(c); }

  /**
   *  Method: End Session / Reset Token
   */
  public endSession() {
    this.setCustToken("");
    this.redirectBack('login');
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