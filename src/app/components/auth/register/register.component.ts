import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiProfileService } from 'src/app/api/api-profile.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { TranslateService } from '@ngx-translate/core';
import { MaskitoElementPredicate, MaskitoOptions } from '@maskito/core';

@Component({
  selector    : 'app-register',
  templateUrl : './register.component.html',
  styleUrls   : ['./register.component.scss']
})
export class RegisterComponent {

  constructor(
    private routeParam: ActivatedRoute,
    private alertCtrl: AlertController,
    private apiProfileService: ApiProfileService,
    private apiUtilityService: ApiUtilityService,
    private fb: FormBuilder,
    public  g: GeneralService,
    private translate: TranslateService
  ) {}

  ionViewWillEnter() { this.getUrlParam(); }

  /**
   *  Method: get URL param
   */
  private urlParam: any;
  private getUrlParam() { this.routeParam.queryParamMap.subscribe(paramMap => { this.urlParam = paramMap.get('t'); }); }

  /**
   *  Method: Basic profile form
   */
  public formBasicInfo = this.fb.group({ fullname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80), Validators.pattern('^[a-zA-Z\\s\'@]+$')]]});
  public get errFormBasicInfo_fullname() { return this.g.getFormErrMsg(this.formBasicInfo.controls['fullname']); }

  /**
   *  Method: Form email
   */
  public formEmail = this.fb.group({ email: ['', [Validators.required, Validators.maxLength(80), Validators.pattern('^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$')]] });
  public get errFormEmail() { return this.g.getFormErrMsg(this.formEmail.controls['email']); }

  /**
   *  Method: Form mobile no.
   */
  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();
  readonly maskMobileNo: MaskitoOptions = { mask: ['+', '6', '0', /[1]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/] };
  public formMobileNo = this.fb.group({ mobileNo: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(15), Validators.pattern('[+][6][0][1][0-9]\\d*$')]], });
  public get errFormMobileNo() { return this.g.getFormErrMsg(this.formMobileNo.controls['mobileNo']); }

  /**
   *  Method: Form unique call ID
   */
  public formUniqCallId = this.fb.group({ uniqCallID: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30), Validators.pattern('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d\\(\\)\\*\\s]{5,30}$')]] });
  public get errFormUniqCallId() { return this.g.getFormErrMsg(this.formUniqCallId.controls['uniqCallID']); }
  public isCustom: boolean = true;
  public onChangeOptionUniqCallId(e: any) {
    this.isCustom = e.value == "1" ? true : false;
    this.formUniqCallId.setValue({ uniqCallID: this.isCustom ? "" : "DEFAULT123" });
  }

  /**
   *  Method: Password form
   */
  public formPassword = this.fb.group({ 
    password        : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(40), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,40}$')]],
    confirmPassword : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(40), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,40}$')]],
  }, { validator: this.g.matchPasswords('password', 'confirmPassword') });
  public get errFormPassword_password()         { return this.g.getFormErrMsg(this.formPassword.controls['password']);         }
  public get errFormPassword_confirmPassword()  { return this.g.getFormErrMsg(this.formPassword.controls['confirmPassword']);  }
  public async submitFormPassword() {
    if (this.formPassword.valid) {
      const alert = await this.alertCtrl.create({
        header    : this.translate.instant('SCRN_REGISTER.ALERT_CONFIRM.TITLE'),
        message   : this.translate.instant('SCRN_REGISTER.ALERT_CONFIRM.DESCR'),
        buttons   : [
          { text: this.translate.instant('CANCEL'),   role: 'cancel',   cssClass: 'text-danger',  handler: () => {} },
          { text: this.translate.instant('PROCEED'),  role: 'confirm',  cssClass: 'text-primary', handler: () => {
              this.g.toastSuccess(this.translate.instant('TOAST_MSG.SENDING_OTP'));
              this.apiUtilityService.SendOTPEmail({ objRequest: { Mode: 'verify', Email: this.formEmail.value.email } }).subscribe(rsp => {
                if (rsp.d.RespCode == "200") {
                  localStorage['eqmsCustomer_registerData'] = JSON.stringify({
                    Name      : this.formBasicInfo.value.fullname?.toUpperCase(),
                    Email     : this.formEmail.value.email,
                    MobileNo  : this.formMobileNo.value.mobileNo,
                    UniqCallID: this.formUniqCallId.value.uniqCallID == "DEFAULT123" ? '' : this.formUniqCallId.value.uniqCallID?.toUpperCase(),
                    Password  : this.formPassword.value.password,
                    OTP       : rsp.d.RespData[0].OTP,
                  });
                  this.g.toastSuccess(rsp.d.RespData[0].Status);
                  this.g.redirectTo('register', `register/verification` + (this.urlParam == 'adhoc' ? `?t=${this.urlParam}` : ''));
                }
                else this.g.toastError(rsp.d.RespMessage);
              });
            },
          },
        ],
      });
      await alert.present();
    }
  }

  /**
   *  Method: Check if value already exist
   */
  @ViewChild('btnNextBasicInfo')  public  btnNextBasicInfo: any;
  @ViewChild('btnNextEmail')      private btnNextEmail: any;
  @ViewChild('btnNextMobileNo')   private btnNextMobileNo: any;
  @ViewChild('btnNextUniqCallId') private btnNextUniqCallId: any;
  public checkExist(mode: string, searchVal: any) {
    this.apiProfileService.apiCheckExists({ objRequest: { Mode: mode, SearchValue: searchVal } }).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        if (mode == "EMAIL")      rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError(this.translate.instant('SCRN_REGISTER.VERIFY.EMAIL'))    : this.btnNextEmail.nativeElement.click();
        if (mode == "MOBILENO")   rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError(this.translate.instant('SCRN_REGISTER.VERIFY.MOBILENO')) : this.btnNextMobileNo.nativeElement.click();
        if (mode == "UNIQCALLID") rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError(this.translate.instant('SCRN_REGISTER.VERIFY.UCID'))     : this.btnNextUniqCallId.nativeElement.click();
      }
      else this.g.toastError(rsp.d.RespMessage)
    });
  }

  /**
   *  Method: Dynamic back button
   */
  public back() { this.urlParam == 'adhoc' ? window.location.href = this.g.getEnvDomainUrl + 'eqmskiosk/#/' : this.g.redirectBack('login'); }
}

/** ========== Scrapped code ==========
 *  * Attributes in formBasicInfo
 *  gender          : ['', [Validators.required]]
 *  identificationNo: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]]
 *  * Attributes in localStorage['eqmsCustomer_registerData']
 *  Sex  : this.formBasicInfo.value.gender
 *  IDNum: this.formBasicInfo.value.identificationNo?.replaceAll('-', '')
 *  * Methods for FormBasicInfo form control
 *  public get errFormBasicInfo_gender()            { return this.g.getFormErrMsg(this.formBasicInfo.controls['gender']);           }
 *  public get errFormBasicInfo_identificationNo()  { return this.g.getFormErrMsg(this.formBasicInfo.controls['identificationNo']); }
 *  * Methods for gender control
 *  public genderList: any = [{ id: 'M', desc: this.translate.instant('MALE') }, { id: 'F', desc: this.translate.instant('FEMALE') }];
 *  public changeGender(e: any) { this.formBasicInfo.controls['gender']?.setValue(e, { onlySelf: true }); }
 *  * NRIC masking
 *  readonly maskIdentificationNo: MaskitoOptions = { mask: [/\d/, /\d/, /[01]/, /\d/, /[0123]/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]};
 *  * Check if exist
 *  if (mode == "NRIC") rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError(this.translate.instant('SCRN_REGISTER.VERIFY.NRIC')) : this.btnNextBasicInfo.nativeElement.click();
 * */