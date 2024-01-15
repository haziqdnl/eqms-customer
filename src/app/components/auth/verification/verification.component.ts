import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiProfileService } from 'src/app/api/api-profile.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector    : 'app-verification',
  templateUrl : './verification.component.html',
  styleUrls   : ['./verification.component.scss']
})
export class VerificationComponent {

  constructor(
    private routeParam: ActivatedRoute,
    private alertCtrl: AlertController,
    private apiProfileService: ApiProfileService,
    private apiUtilityService: ApiUtilityService,
    public  g: GeneralService,
    private fb: FormBuilder,
  ) {}

  public registerData: any = {};
  ionViewWillEnter() { 
    if (localStorage['eqmsCustomer_registerData'] === undefined || localStorage['eqmsCustomer_registerData'] === "") 
      this.g.redirectBack('login');
    else {
      this.registerData = JSON.parse(localStorage['eqmsCustomer_registerData']);
      this.getUrlParam();
    }
  }
  ionViewWillLeave() {}

  /**
   *  Method: get URL param
   */
  public urlParamType: any;
  private getUrlParam() {
    this.routeParam.queryParamMap.subscribe( paramMap => { this.urlParamType = paramMap.get('t'); });
  }

  /**
   *  Method: Resend OTP
   */
  public async resendOTP() {
    const alert = await this.alertCtrl.create({
      header  : 'Confirm resend OTP?',
      buttons : [
        { text: 'Cancel', role: 'cancel', cssClass: 'text-primary', handler: () => {} },
        {
          text: 'Yes', role: 'confirm', cssClass: 'text-primary',
          handler: () => {
            let request = { objRequest: { Email: this.registerData.Email } };
            this.apiUtilityService.SendOTPEmail(request).subscribe(rsp => {
              if (rsp.d.RespCode == "200") {
                this.registerData.OTP = rsp.d.RespData[0].OTP;
                localStorage['eqmsCustomer_registerData'] = JSON.stringify(this.registerData);
                this.g.toastSuccess(rsp.d.RespData[0].Status);
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
   *  Method: Form mobile no.
   */
  public formOTPVerificationSubmitted = false;
  public get formOTPVerificationCtrl() { return this.formOTPVerification.controls; }
  public formOTPVerification = this.fb.group({ 
    otp1: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
    otp2: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
    otp3: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
    otp4: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
    otp5: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
    otp6: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]{1}$')]],
  });
  public submitFormOTPVerification() {
    this.formOTPVerificationSubmitted = true;
    if (this.formOTPVerification.valid) {
      let otpCombine = `${this.formOTPVerification.value.otp1}${this.formOTPVerification.value.otp2}${this.formOTPVerification.value.otp3}${this.formOTPVerification.value.otp4}${this.formOTPVerification.value.otp5}${this.formOTPVerification.value.otp6}`
      if (otpCombine == this.registerData.OTP) {
        let request = {
          objRequest: {
            Mode    : "CREATE",
            ProfileData : {
              Email     : this.registerData.Email,
              MobileNo  : this.registerData.MobileNo,
              Name      : this.registerData.Name,
              Sex       : this.registerData.Sex,
              Address1  : '',
              Address2  : '',
              PostCode  : '',
              State     : '',
              Password  : this.registerData.Password,
              IDNum     : this.registerData.IDNum,
              UniqCallID: this.registerData.UniqCallID,
            },
          }
        };
        this.apiProfileService.apiCRUD(request, "").subscribe(rsp => {
          if (rsp.d.RespCode == "200") {
            this.g.toastSuccess(rsp.d.RespMessage);
            this.g.redirectTo(`register/status?is=success` + (this.urlParamType == 'adhoc' ? `&t=${this.urlParamType}` : ''));
          }
          else this.g.toastError(rsp.d.RespMessage);
        });
      }
      else this.g.toastError("Invalid OTP code!")
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
}