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
  //  Gender dropdown
  public genderList: any = [{ id: 'M', desc: this.translate.instant('MALE') }, { id: 'F', desc: this.translate.instant('FEMALE') },];
  public changeGender(e: any) { this.formBasicInfo.controls['gender']?.setValue(e, { onlySelf: true }); }
  //  Input masking
  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();
  readonly maskIdentificationNo: MaskitoOptions = { mask: [/\d/, /\d/, /[01]/, /\d/, /[01]/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]};
  //  Form
  public formBasicInfo = this.fb.group({ 
    fullname        : ['', [Validators.required,  Validators.minLength(3),  Validators.maxLength(80), Validators.pattern('^[a-zA-Z\\s\'@]+$')]],
    gender          : ['', [Validators.required]],
    identificationNo: ['', [Validators.required,  Validators.minLength(12), Validators.maxLength(14)]]
  });
  public get errFormBasicInfo_fullname() {
    var msg = "";
    if (this.formBasicInfo.controls['fullname'].touched && this.formBasicInfo.controls['fullname'].invalid) {
      if (this.formBasicInfo.controls['fullname'].hasError('required'))   msg = '_ERROR.REQUIRED';
      if (this.formBasicInfo.controls['fullname'].hasError('pattern'))    msg = '_ERROR.INVALID';
      if (this.formBasicInfo.controls['fullname'].hasError('minlength'))  msg = '_ERROR.MINLENGTH';
      if (this.formBasicInfo.controls['fullname'].hasError('maxlength'))  msg = '_ERROR.MAXLENGTH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }
  public get errFormBasicInfo_gender() {
    var msg = "";
    if (this.formBasicInfo.controls['gender'].touched && this.formBasicInfo.controls['gender'].invalid)
      if (this.formBasicInfo.controls['gender'].hasError('required')) msg = '_ERROR.REQUIRED';
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }
  public get errFormBasicInfo_identificationNo() {
    var msg = "";
    if (this.formBasicInfo.controls['identificationNo'].touched && this.formBasicInfo.controls['identificationNo'].invalid) {
      if (this.formBasicInfo.controls['identificationNo'].hasError('required'))   msg = '_ERROR.REQUIRED';
      if (this.formBasicInfo.controls['identificationNo'].hasError('minlength'))  msg = '_ERROR.MINLENGTH';
      if (this.formBasicInfo.controls['identificationNo'].hasError('maxlength'))  msg = '_ERROR.MAXLENGTH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }

  /**
   *  Method: Form email
   */
  public formEmail = this.fb.group({ email: ['', [Validators.required, Validators.maxLength(80), Validators.pattern('^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$')]] });
  public get errFormEmail() {
    var msg = "";
    if (this.formEmail.controls['email'].touched && this.formEmail.controls['email'].invalid) {
      if (this.formEmail.controls['email'].hasError('required'))  msg = '_ERROR.REQUIRED';
      if (this.formEmail.controls['email'].hasError('pattern'))   msg = '_ERROR.INVALID';
      if (this.formEmail.controls['email'].hasError('maxlength')) msg = '_ERROR.MAXLENGTH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }

  /**
   *  Method: Form mobile no.
   */
  readonly maskMobileNo: MaskitoOptions = { mask: ['+', '6', '0', /[1]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/] };
  public formMobileNo = this.fb.group({ mobileNo: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(15), Validators.pattern('[+][6][0][1][0-9]\\d*$')]], });
  public get errFormMobileNo() {
    var msg = "";
    if (this.formMobileNo.controls['mobileNo'].touched && this.formMobileNo.controls['mobileNo'].invalid) {
      if (this.formMobileNo.controls['mobileNo'].hasError('required'))  msg = '_ERROR.REQUIRED';
      if (this.formMobileNo.controls['mobileNo'].hasError('pattern'))   msg = '_ERROR.INVALID';
      if (this.formMobileNo.controls['mobileNo'].hasError('minlength')) msg = '_ERROR.MINLENGTH';
      if (this.formMobileNo.controls['mobileNo'].hasError('maxlength')) msg = '_ERROR.MAXLENGTH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }

  /**
   *  Method: Form unique call ID
   */
  public formUniqCallId = this.fb.group({ uniqCallID: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30), Validators.pattern('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d\\(\\)\\*\\s]{5,30}$')]] });
  public isCustom: boolean = true;
  public onChangeOptionUniqCallId(e: any) {
    this.isCustom = e.value == "1" ? true : false; 
    this.formUniqCallId.setValue({ uniqCallID: this.isCustom ? "" : "DEFAULT123" });
  }
  public get errFormUniqCallId() {
    var msg = "";
    if (this.formUniqCallId.controls['uniqCallID'].touched && this.formUniqCallId.controls['uniqCallID'].invalid) {
      if (this.formUniqCallId.controls['uniqCallID'].hasError('required'))  msg = '_ERROR.REQUIRED';
      if (this.formUniqCallId.controls['uniqCallID'].hasError('pattern'))   msg = '_ERROR.INVALID';
      if (this.formUniqCallId.controls['uniqCallID'].hasError('minlength')) msg = '_ERROR.MINLENGTH';
      if (this.formUniqCallId.controls['uniqCallID'].hasError('maxlength')) msg = '_ERROR.MAXLENGTH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }

  /**
   *  Method: Check if value already exist
   */
  @ViewChild('btnNextBasicInfo')  private btnNextBasicInfo: any;
  @ViewChild('btnNextEmail')      private btnNextEmail: any;
  @ViewChild('btnNextMobileNo')   private btnNextMobileNo: any;
  @ViewChild('btnNextUniqCallId') private btnNextUniqCallId: any;
  public checkExist(mode: string, searchVal: any) {
    this.apiProfileService.apiCheckExists({ objRequest: { Mode: mode, SearchValue: searchVal } }).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        if (mode == "NRIC")       rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError(this.translate.instant('SCRN_REGISTER.VERIFY.NRIC'))     : this.btnNextBasicInfo.nativeElement.click();
        if (mode == "EMAIL")      rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError(this.translate.instant('SCRN_REGISTER.VERIFY.EMAIL'))    : this.btnNextEmail.nativeElement.click();
        if (mode == "MOBILENO")   rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError(this.translate.instant('SCRN_REGISTER.VERIFY.MOBILENO')) : this.btnNextMobileNo.nativeElement.click();
        if (mode == "UNIQCALLID") rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError(this.translate.instant('SCRN_REGISTER.VERIFY.UCID'))     : this.btnNextUniqCallId.nativeElement.click();
      }
      else this.g.toastError(rsp.d.RespMessage)
    });
  }

  /**
   *  Method: Password form
   */
  public formPassword = this.fb.group({ 
    password        : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(40), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,40}$')]],
    confirmPassword : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(40), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,40}$')]],
  }, { validator: this.g.matchPasswords('password', 'confirmPassword') });
  public get errFormPassword_password() {
    var msg = "";
    if (this.formPassword.controls['password'].touched && this.formPassword.controls['password'].invalid) {
      if (this.formPassword.controls['password'].hasError('required'))  msg = '_ERROR.REQUIRED';
      if (this.formPassword.controls['password'].hasError('pattern'))   msg = '_ERROR.INVALID';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }
  public get errFormPassword_confirmPassword() {
    var msg = "";
    if (this.formPassword.controls['confirmPassword'].touched && this.formPassword.controls['confirmPassword'].invalid) {
      if (this.formPassword.controls['confirmPassword'].hasError('required'))          msg = '_ERROR.REQUIRED';
      if (this.formPassword.controls['confirmPassword'].hasError('passwordMismatch'))  msg = '_ERROR.PASSWORD.CRITERIA.NOTMATCH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }
  public async submitFormPassword() {
    if (this.formPassword.valid) {
      const alert = await this.alertCtrl.create({
        header    : this.translate.instant('SCRN_REGISTER.ALERT_CONFIRM.TITLE'),
        message   : this.translate.instant('SCRN_REGISTER.ALERT_CONFIRM.DESCR'),
        buttons   : [
          { text: this.translate.instant('CANCEL'),   role: 'cancel',   cssClass: 'text-danger',  handler: () => {} },
          {
            text: this.translate.instant('PROCEED'),  role: 'confirm',  cssClass: 'text-primary', handler: () => {
              this.g.toastSuccess(this.translate.instant('TOAST_MSG.SENDING_OTP'));
              this.apiUtilityService.SendOTPEmail({ objRequest: { Email: this.formEmail.value.email } }).subscribe(rsp => {
                if (rsp.d.RespCode == "200") {
                  localStorage['eqmsCustomer_registerData'] = JSON.stringify({
                    Email     : this.formEmail.value.email,
                    MobileNo  : this.formMobileNo.value.mobileNo,
                    Name      : this.formBasicInfo.value.fullname?.toUpperCase(),
                    Sex       : this.formBasicInfo.value.gender,
                    Password  : this.formPassword.value.password,
                    IDNum     : this.formBasicInfo.value.identificationNo?.replaceAll('-', ''),
                    UniqCallID: this.formUniqCallId.value.uniqCallID == "DEFAULT123" ? '' : this.formUniqCallId.value.uniqCallID?.toUpperCase(),
                    OTP       : rsp.d.RespData[0].OTP,
                  });
                  this.g.toastSuccess(rsp.d.RespData[0].Status);
                  this.g.redirectTo(`register/verification` + (this.urlParam == 'adhoc' ? `?t=${this.urlParam}` : ''));
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
   *  Method: Back button
   */
  public back() { this.urlParam == 'adhoc' ? window.location.href = this.g.getEnvDomainUrl + 'eqmskiosk/#/' : this.g.redirectBack('login'); }
}