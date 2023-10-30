import { TitleCasePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiProfileService } from 'src/app/api/api-profile.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { GeneralService } from 'src/app/services/general/general.service';

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
    public  titleCasePipe: TitleCasePipe,
  ) { }

  ionViewWillEnter() { this.getUrlParam(); }

  /**
   *  Method: get URL param
   */
  private urlParam: any;
  private getUrlParam() { this.routeParam.queryParamMap.subscribe(paramMap => { this.urlParam = paramMap.get('t'); }); }

  /**
   *  Method: Form basic profile info
   */
  @ViewChild('btnNextBasicInfo') private btnNextBasicInfo: any;
  public formRegisterBasicInfoSubmitted = false;
  public get formRegisterBasicInfoCtrl() { return this.formRegisterBasicInfo.controls; }
  public formRegisterBasicInfo = this.fb.group({ 
    fullname        : ['', [Validators.required,  Validators.minLength(3),  Validators.maxLength(60), Validators.pattern('^[a-zA-Z\\s\'@]+$')]],
    gender          : ['', [Validators.required]],
    identificationNo: ['', [Validators.required,  Validators.minLength(12), Validators.maxLength(12)]]
  });
  public submitFormRegisterBasicInfo() {
    this.formRegisterBasicInfoSubmitted = true;
    if (this.formRegisterBasicInfo.valid) {
      let request = { objRequest: { Mode: "NRIC", SearchValue: this.formRegisterBasicInfo.value.identificationNo } };
      this.apiProfileService.apiCheckExists(request).subscribe(rsp => {
        if (rsp.d.RespCode == "200")
          rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError("An account already registered with this NRIC number") : this.btnNextBasicInfo.nativeElement.click();
        else this.g.toastError(rsp.d.RespMessage)
      });
    }
  }
  /**
   *  Method: Get gender data
   */
  public genderList: any = [{ id: 'M', desc: 'MALE' }, { id: 'F', desc: 'FEMALE' },];
  public changeGender(e: any) { this.formRegisterBasicInfoCtrl['gender']?.setValue(e.value, { onlySelf: true }); }

  /**
   *  Method: Form email
   */
  @ViewChild('btnNextEmail') private btnNextEmail: any;
  public formRegisterEmailSubmitted = false;
  public get formRegisterEmailCtrl() { return this.formRegisterEmail.controls; }
  public formRegisterEmail = this.fb.group({ email: ['', [Validators.required,  Validators.maxLength(30), Validators.pattern('^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$')]] });
  public submitFormRegisterEmail() {
    this.formRegisterEmailSubmitted = true;
    if (this.formRegisterEmail.valid) {
      let request = { objRequest: { Mode: "EMAIL", SearchValue: this.formRegisterEmail.value.email } };
      this.apiProfileService.apiCheckExists(request).subscribe(rsp => {
        if (rsp.d.RespCode == "200")
          rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError("An account already registered with this email") : this.btnNextEmail.nativeElement.click();
        else this.g.toastError(rsp.d.RespMessage)
      });
    }
  }

  /**
   *  Method: Form mobile no.
   */
  @ViewChild('btnNextMobileNo') private btnNextMobileNo: any;
  public formRegisterMobileNoSubmitted = false;
  public get formRegisterMobileNoCtrl() { return this.formRegisterMobileNo.controls; }
  public formRegisterMobileNo = this.fb.group({ mobileNo: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(12), Validators.pattern('^[1-9]\\d*$')]], });
  public submitFormRegisterMobileNo() {
    this.formRegisterMobileNoSubmitted = true;
    if (this.formRegisterMobileNo.valid) {
      let request = { objRequest: { Mode: "MOBILENO", SearchValue: '+60' + this.formRegisterMobileNo.value.mobileNo } };
      this.apiProfileService.apiCheckExists(request).subscribe(rsp => {
        if (rsp.d.RespCode == "200")
          rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError("An account already registered with this mobile number") : this.btnNextMobileNo.nativeElement.click();
        else this.g.toastError(rsp.d.RespMessage)
      });
    }
  }

  /**
   *  Method: Form unique call ID
   */
  public isCustom: boolean = true;
  @ViewChild('btnNextUniqCallId') private btnNextUniqCallId: any;
  public formRegisterUniqCallIdSubmitted = false;
  public get formRegisterUniqCallIdCtrl() { return this.formRegisterUniqCallId.controls; }
  public formRegisterUniqCallId = this.fb.group({ uniqCallID: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[A-Z\\d]{5,20}$')]] });
  public submitFormRegisterUniqCallId() {
    this.formRegisterUniqCallIdSubmitted = true;
    if (this.formRegisterUniqCallId.valid) {
      let request = { objRequest: { Mode: "UNIQCALLID", SearchValue: this.formRegisterUniqCallId.value.uniqCallID } };
      this.apiProfileService.apiCheckExists(request).subscribe(rsp => {
        if (rsp.d.RespCode == "200")
          rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError("The unique call ID is not available") : this.btnNextUniqCallId.nativeElement.click();
        else this.g.toastError(rsp.d.RespMessage)
      });
    }
  }
  public onChangeOptionUniqCallId(e: any) {
    this.isCustom = e.value == "1" ? true : false; 
    this.formRegisterUniqCallId.setValue({ uniqCallID: this.isCustom ? "" : "DEFAULT123" });
  }

  /**
   *  Method: Form password
   */
  @ViewChild('btnNextPassword') private btnNextPassword: any;
  public formRegisterPasswordSubmitted = false;
  public get formRegisterPasswordCtrl() { return this.formRegisterPassword.controls; }
  public formRegisterPassword = this.fb.group({ 
    password        : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(30), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,}$')]],
    confirmPassword : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(30), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,}$')]],
  }, { validator: this.g.matchPasswords('password', 'confirmPassword') });
  public async submitFormRegisterPassword() {
    this.formRegisterPasswordSubmitted = true;
    if (this.formRegisterPassword.valid) {
      const alert = await this.alertCtrl.create({
        header    : 'Please ensure all details are correct.',
        message   : 'We\'ll send an OTP verification to the provided email address.',
        buttons   : [
          {
            text: 'Cancel', role: 'cancel', cssClass: 'text-primary',
            handler: () => {},
          },
          {
            text: 'Proceed', role: 'confirm', cssClass: 'text-primary',
            handler: () => {
              this.g.toastSuccess("Sending OTP verification...");
              let request = { objRequest: { Email: this.formRegisterEmail.value.email } };
              this.apiUtilityService.SendOTPEmail(request).subscribe(rsp => {
                if (rsp.d.RespCode == "200") {
                  localStorage['eqmsCustomer_registerData'] = JSON.stringify({
                    Email     : this.formRegisterEmail.value.email,
                    MobileNo  : '+60' + this.formRegisterMobileNo.value.mobileNo,
                    Name      : this.formRegisterBasicInfo.value.fullname,
                    Sex       : this.formRegisterBasicInfo.value.gender,
                    Password  : this.formRegisterPassword.value.password,
                    IDNum     : this.formRegisterBasicInfo.value.identificationNo,
                    UniqCallID: this.formRegisterUniqCallId.value.uniqCallID == "DEFAULT123" ? '' : this.formRegisterUniqCallId.value.uniqCallID,
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
  public back() { this.urlParam == 'adhoc' ? window.location.href = this.g.getEnvDomainUrl() + 'eqmskiosk/#/' : this.g.redirectBack('login'); }
}