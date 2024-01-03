import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Haptics } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { LoadingController, NavController, Platform } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GeneralService {

  constructor(
    private deviceDetectorService: DeviceDetectorService,
    private loadingCtrl: LoadingController,
    private snackBar: MatSnackBar,
    private navCtrl: NavController,
    private platform: Platform,
  ) { }

  /**
   *  Method: Get environment details
   */
  public getEnvName()       { return environment.environmentName; }
  public getEnvDomainUrl()  { return environment.domainUrl; }
  public getEnvApiUrl()     { return environment.apiUrl; }
  public getEnvAppVer()     { return environment.appVersion; }

  /**
   *  Method: Customer Token
   */
  public setCustToken(t: any)  { localStorage.setItem('eqmsCustomer_jwtToken', t); }
  public getCustToken()    { return localStorage.getItem('eqmsCustomer_jwtToken'); }

  /**
   *  Method: End Session / Reset Token
   */
  public endSession() {
    this.setCustToken("");
    this.redirectBack('login');
  }

  /**
   *  Method: URL redirect/navigation
   */
  public redirectTo   (c: string) { this.navCtrl.navigateForward(c); }
  public redirectBack (c: string) { this.navCtrl.navigateBack(c); }

  /**
   *  Method: Success/Error Handling
   */
  public toastSuccess(msg: string)  { this.toastTemplate(msg, 5000, 'right', 'success') }
  public toastError(msg: string)    { this.toastTemplate(msg, 5000, 'right', 'error') }
  public toastInfo(msg: string)     { this.toastTemplate(msg, 5000, 'right', 'info') }
  public toastTemplate(msg: string, duration: number, pos: any, panelClass: string) {
    this.snackBar.open(msg, 'OK', {
      duration          : duration,
      horizontalPosition: pos,
      verticalPosition  : this.isMobileWeb() ? 'top' : 'bottom',
      panelClass        : panelClass,
    });
  }
  public apiRespError(rsp: any) { rsp.RespCode != '401' ? this.toastError(rsp.RespMessage) : this.endSession(); }

  /**
   *  Method: Ionic loader
   */
  public async showLoading(duration: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Loading',
      duration: duration,
    });
    loading.present();
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
   *  Method: To get user device information
   */
  public isMobile()       { return this.platform.is('android') || this.platform.is('ios');; }
  public isMobileWeb()    { return this.platform.is('mobileweb'); }
  public getDeviceInfo()  { return this.deviceDetectorService; }

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

  /** */
  public async createNotification(title: string, body: string, interval: number) {
    await LocalNotifications.schedule({
      notifications: [{
        id          : Date.now(),
        title       : title,
        body        : body,
        largeBody   : "",
        summaryText : "",
        schedule    : { at: new Date(Date.now() + interval) },
      }]
    });
  }
  public async vibrate() {
    await Haptics.vibrate({ duration: 3000});
  };
}