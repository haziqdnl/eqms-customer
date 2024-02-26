import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { MaskitoElementPredicate, MaskitoOptions } from '@maskito/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiAuthService } from 'src/app/api/api-auth.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  
  constructor(
    private alertCtrl: AlertController,
    private apiUtilityService: ApiUtilityService,
    private fb: FormBuilder,
    public  g: GeneralService,
    private translate: TranslateService
  ) {}

  ngOnInit() {}
  ionViewWillLeave() {
    this.formMobileNo.reset();
    this.formEmail.reset();
    this.formOTPVerification.reset();
  }

  /**
   *  Method: Set forgot password form mode
   */
  public formMode = { forgot: true, otp: false, reset: false }
  public setFormMode(f: boolean, o: boolean, r: boolean) {
    this.formMode.forgot  = f;
    this.formMode.otp     = o;
    this.formMode.reset   = r;
  }

  /**
   *  Method: Forgot Password with mobile number or email form
   */
  readonly maskPredicate: MaskitoElementPredicate = async (el) => (el as HTMLIonInputElement).getInputElement();
  readonly phoneMask: MaskitoOptions = { mask: ['+', '6', '0', /[1]/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/] };
  public formMobileNo = this.fb.group({ mobileNo: ['', [Validators.required, Validators.maxLength(15), Validators.pattern('[+][6][0][1][0-9]\\d*$')]] });
  public get errFormMobileNo() {
    var msg = "";
    if (this.formMobileNo.controls['mobileNo'].touched && this.formMobileNo.controls['mobileNo'].invalid) {
      if (this.formMobileNo.controls['mobileNo'].hasError('required'))  msg = this.translate.instant('_ERROR.REQUIRED');
      if (this.formMobileNo.controls['mobileNo'].hasError('pattern'))   msg = this.translate.instant('_ERROR.INVALID');
    }
    return msg.toLowerCase();
  }
  public formEmail = this.fb.group({ email: ['', [Validators.required, Validators.maxLength(80), Validators.pattern('^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$')]] });
  public get errFormEmail() {
    var msg = "";
    if (this.formEmail.controls['email'].touched && this.formEmail.controls['email'].invalid) {
      if (this.formEmail.controls['email'].hasError('required'))  msg = this.translate.instant('_ERROR.REQUIRED');
      if (this.formEmail.controls['email'].hasError('pattern'))   msg = this.translate.instant('_ERROR.INVALID');
    }
    return msg.toLowerCase();
  }
  private otp: string = "";
  public  submitForgotPassword(mode: number) {
    this.g.toastSuccess(this.translate.instant('TOAST_MSG.SENDING_OTP'));
    this.apiUtilityService.SendOTPEmail({ objRequest: { Email: this.formEmail.value.email } }).subscribe(rsp => {
      if (rsp.d.RespCode == "200") {
        this.otp = rsp.d.RespData[0].OTP;
        this.g.toastSuccess(rsp.d.RespData[0].Status);
        //  reveal OTP Verification form
        this.setFormMode(false, true, false);
        setTimeout(() => { this.otp1.nativeElement.focus(); }, 500);
      }
      else this.g.toastError(rsp.d.RespMessage);
    });
  }

  /**
   *  Method: Resend OTP
   */
  public async resendOTP() {
    const alert = await this.alertCtrl.create({
      header  : this.translate.instant('OTP_VERIFICATION.CONFIRM_RESEND'),
      buttons : [
        { text: this.translate.instant('CANCEL'), role: 'cancel', cssClass: 'text-danger', handler: () => {} },
        {
          text: this.translate.instant('YES'), role: 'confirm', cssClass: 'text-primary',
          handler: () => {
            this.g.toastSuccess(this.translate.instant('TOAST_MSG.SENDING_OTP'));
            this.apiUtilityService.SendOTPEmail({ objRequest: { Email: this.formEmail.value.email } }).subscribe(rsp => {
              if (rsp.d.RespCode == "200") {
                this.otp = rsp.d.RespData[0].OTP;
                this.g.toastSuccess(rsp.d.RespData[0].Status);
                this.formOTPVerification.reset();
                setTimeout(() => { this.otp1.nativeElement.focus(); }, 500);
              }
              else this.g.toastError(rsp.d.RespMessage);
            });
          },
        },
      ],
    });
    await alert.present();
  }

  /**
   *  Method: OTP Verification form
   */
  public formOTPVerification = this.fb.group({ 
    otp1: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
    otp2: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
    otp3: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
    otp4: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
    otp5: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
    otp6: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
  });
  public submitFormOTPVerification() {
    if (this.formOTPVerification.valid) {
      let otpCombine = `${this.formOTPVerification.value.otp1}${this.formOTPVerification.value.otp2}${this.formOTPVerification.value.otp3}${this.formOTPVerification.value.otp4}${this.formOTPVerification.value.otp5}${this.formOTPVerification.value.otp6}`
      if (otpCombine == this.otp) this.setFormMode(false, false, true);
      else                        this.g.toastError(this.translate.instant('OTP_VERIFICATION.INVALID_OTP'));
    }
  }

  /**
   *  Method: OTP input keyup event
   */
  @ViewChild('otp1') private otp1: any;
  @ViewChild('otp2') private otp2: any;
  @ViewChild('otp3') private otp3: any;
  @ViewChild('otp4') private otp4: any;
  @ViewChild('otp5') private otp5: any;
  @ViewChild('otp6') private otp6: any;
  @ViewChild('btnSubmitFormOTPVerification') private btnSubmitFormOTPVerification: any;
  public keyupOTP1(e: any) {
    if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode == 39)
      this.otp2.nativeElement.focus();
  }
  public keyupOTP2(e: any) {
    if (e.keyCode == 37)
      this.otp1.nativeElement.focus();
    else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode == 39)
      this.otp3.nativeElement.focus();
  }
  public keyupOTP3(e: any) {
    if (e.keyCode == 37)
      this.otp2.nativeElement.focus();
    else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode == 39)
      this.otp4.nativeElement.focus();
  }
  public keyupOTP4(e: any) {
    if (e.keyCode == 37)
      this.otp3.nativeElement.focus();
    else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode == 39)
      this.otp5.nativeElement.focus();
  }
  public keyupOTP5(e: any) {
    if (e.keyCode == 37)
      this.otp4.nativeElement.focus();
    else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode == 39)
      this.otp6.nativeElement.focus();
  }
  public keyupOTP6(e: any) {
    if (e.keyCode == 37)
      this.otp5.nativeElement.focus();
    else if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105))
      this.btnSubmitFormOTPVerification.nativeElement.focus();
  }

  /**
   *  Method: Reset Password form
   */
  public formResetPwd = this.fb.group({ 
    password        : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(40), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,}$')]],
    confirmPassword : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(40), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,}$')]],
  }, { validator: this.g.matchPasswords('password', 'confirmPassword') });
  public get errFormResetPwd_password() {
    var msg = "";
    if (this.formResetPwd.controls['password'].touched && this.formResetPwd.controls['password'].invalid) {
      if (this.formResetPwd.controls['password'].hasError('required'))  msg = this.translate.instant('_ERROR.REQUIRED');
      if (this.formResetPwd.controls['password'].hasError('pattern'))   msg = this.translate.instant('_ERROR.INVALID');
    }
    return msg.toLowerCase();
  }
  public get errFormResetPwd_confirmPassword() {
    var msg = "";
    if (this.formResetPwd.controls['confirmPassword'].touched && this.formResetPwd.controls['confirmPassword'].invalid) {
      if (this.formResetPwd.controls['confirmPassword'].hasError('required'))          msg = this.translate.instant('_ERROR.REQUIRED');
      if (this.formResetPwd.controls['confirmPassword'].hasError('passwordMismatch'))  msg = this.translate.instant('_ERROR.PASSWORD.CRITERIA.NOTMATCH');
    }
    return msg.toLowerCase();
  }
  public submitFormResetPwd() {
    this.g.toastSuccess(this.translate.instant('SCRN_FORGOT_PASSWORD.RESET_SUCCESS'));
    this.g.redirectTo('login');
  }
}