import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { catchError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GeneralService {

  constructor(
    private deviceDetectorService: DeviceDetectorService,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private snackBar: MatSnackBar,
    private navCtrl: NavController,
    private platform: Platform,
    private translate: TranslateService
  ) {}

  /**
   *  Method: Get environment details
   */
  public get getEnvName()       { return environment.environmentName; }
  public get getEnvDomainUrl()  { return environment.domainUrl;       }
  public get getEnvApiUrl()     { return environment.apiUrl;          }
  public get getEnvAppVer()     { return environment.appVersion;      }

  /**
   *  Method: HTTP request to back-end services handler
   */
  private getHttpHeader(token?: string): any {
    if (token)  return { 'headers': { 'content-type': 'application/json', 'SessionToken': token } };
    else        return { 'headers': { 'content-type': 'application/json' }                        };
  }
  public httpGet(service: string, method: string, token?: string) {
    return this.http.get(`${this.getEnvApiUrl}/${service}/${method}?lang=${this.getDefaultLanguage}`, this.getHttpHeader(token)).pipe( catchError( err => { throw err; } ) );
  }
  public httpPost(service: string, method: string, body: any, token?: string) {
    return this.http.post(`${this.getEnvApiUrl}/${service}/${method}?lang=${this.getDefaultLanguage}`, body, this.getHttpHeader(token)).pipe( catchError( err => { throw err; } ) );
  }

  /**
   *  Method: Customer Token
   */
  public setCustToken(t: any)  { localStorage.setItem('eqmsCustomer_jwtToken', t);      }
  public get getCustToken()    { return localStorage.getItem('eqmsCustomer_jwtToken');  }

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
  public redirectTo   (c: string) { this.navCtrl.navigateForward(c);  }
  public redirectBack (c: string) { this.navCtrl.navigateBack(c);     }

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
      verticalPosition  : this.isMobile ? 'bottom' : this.isMobileWeb ? 'bottom' : 'top',
      panelClass        : panelClass,
    });
  }
  public apiRespError(rsp: any) { rsp.RespCode != '401' ? this.toastError(rsp.RespMessage) : this.endSession(); }

  /**
   *  Method: Ionic loader
   */
  public async showLoading(duration: number) {
    const loading = await this.loadingCtrl.create({ message: 'Loading', duration: duration });
    loading.present();
  }

  /**
   *  Method: Form validation
   */
  public getFormErrMsg(form: any) {
    var msg = "";
    if (form.touched && form.invalid) {
      if (form.hasError('required'))          msg = '_ERROR.REQUIRED';
      if (form.hasError('pattern'))           msg = '_ERROR.INVALID';
      if (form.hasError('minlength'))         msg = '_ERROR.MINLENGTH';
      if (form.hasError('maxlength'))         msg = '_ERROR.MAXLENGTH';
      if (form.hasError('passwordMismatch'))  msg = '_ERROR.PASSWORD.CRITERIA.NOTMATCH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
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
  public get isMobile()       { return this.platform.is('android') || this.platform.is('ios');  }
  public get isMobileWeb()    { return this.platform.is('mobileweb');                           }
  public get getDeviceInfo()  { return this.deviceDetectorService;                              }

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

  /**
   *  Method: Set preferred default language
   */
  public setLanguage(lang: any) {
    this.translate.use(lang);
    this.translate.setDefaultLang(lang);
    localStorage.setItem('eqmsCustomer_defLanguage', lang);
  }
  /**
   *  Method: Get preferred default language
   */
  public get getDefaultLanguage() { 
    if (localStorage.getItem('eqmsCustomer_defLanguage') != null) return localStorage.getItem('eqmsCustomer_defLanguage')!;
    else                                                          return "en";
  }
  /**
   *  Method: Set default translate language when visiting the app
   */
  public setDefaultLanguage() {
    if (this.getDefaultLanguage != null)  this.translate.setDefaultLang(this.getDefaultLanguage);
    else                                  this.translate.setDefaultLang('en');
  }
}