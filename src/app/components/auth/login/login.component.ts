import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MaskitoElementPredicate, MaskitoOptions } from '@maskito/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiAuthService } from 'src/app/api/api-auth.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { OnesignalService } from 'src/app/services/onesignal/onesignal.service';

@Component({
  selector    : 'app-login',
  templateUrl : './login.component.html',
  styleUrls   : ['./login.component.scss']
})
export class LoginComponent {
  
  constructor(
    private apiAuthService: ApiAuthService,
    private apiUtilityService: ApiUtilityService,
    private fb: FormBuilder,
    public  g: GeneralService,
    private oneSignalService: OnesignalService,
    private translate: TranslateService
  ) {}

  ngOnInit()          { this.validateToken();         }
  ionViewWillLeave()  { this.formIdPassword.reset();  }

  /**
   *  Method: Auto login if token from the previous login still valid
   */
  public defaultLang = this.g.getDefaultLanguage;
  private async validateToken() {
    if (this.g.getCustToken) {
      this.apiUtilityService.apiDecodeJWTToken({ objRequest: { Token: this.g.getCustToken } }).subscribe( rsp => { if (rsp.d.RespCode == "200") this.g.redirectTo('login', ''); });
    }
  }

  /**
   *  Method: Form builder and controller
   */
  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();
  readonly idMask: MaskitoOptions = { mask: ['+', '6', '0', /[1]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/] };
  public formIdPassword = this.fb.group({
    id      : ['', [Validators.required, Validators.pattern('[+][6][0][1][0-9]\\d*$')]],
    password: ['', [Validators.required]],
  });
  public get errFormIdPassword_id()       { return this.g.getFormErrMsg(this.formIdPassword.controls['id']);       }
  public get errFormIdPassword_password() { return this.g.getFormErrMsg(this.formIdPassword.controls['password']); }

  /**
   *  Method: Submit login form
   */
  public submit() {
    let request = {
      objRequest: {
        LoginID : this.formIdPassword.value.id,
        Password: this.formIdPassword.value.password
      }
    };
    this.apiAuthService.apiCustomerLogin(request).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.g.setCustToken(rsp.d.RespData[0].Token);
        this.apiUtilityService.apiDecodeJWTToken({ objRequest: { Token: this.g.getCustToken } }).subscribe( rsp => {
          if (rsp.d.RespCode == "200") {
            this.oneSignalService.setExternalId(rsp.d.RespData[0].pid);
            //await this.oneSignalService.createPushNotification("You have logged in another device. Is that you?" , rsp.d.RespData[0].pid);
          }
          else {
            rsp.d.RespCode = "401";
            this.g.apiRespError(rsp.d);
          }
        });
        this.g.redirectTo('login', '');
      }
      else {
        this.g.toastError(this.translate.instant('SCRN_LOGIN.INVALID_LOGIN'));
        this.g.setCustToken("");
      }
    });
  }
}