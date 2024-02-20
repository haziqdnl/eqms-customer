import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { ApiProfileService } from 'src/app/api/api-profile.service';
import { ApiStateService } from 'src/app/api/api-state.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  constructor(
    private apiProfileService: ApiProfileService,
    private apiStateService: ApiStateService,
    private apiUtilityService: ApiUtilityService,
    private fb: FormBuilder,
    public  g: GeneralService,
    private translate: TranslateService
  ) {}
  
  ionViewWillEnter() { this.validateToken(); }

  /**
   *  Method: Modal
   */
  public modalMode: string = "";
  public modalTitle: string = "";
  public modalIsOpen: boolean = false;
  public openModal(open: boolean, mode: string) {
    this.validateToken();
    this.modalIsOpen = open;
    this.modalMode = mode;

    if (open) {
      if (mode == "0")  this.modalTitle = this.translate.instant('SCRN_PROFILE.MODAL.EDIT_PROFILE');
      if (mode == "1")  this.modalTitle = this.translate.instant('SCRN_PROFILE.MODAL.RENAME_UCID');
      if (mode == "2")  this.modalTitle = this.translate.instant('SCRN_PROFILE.MODAL.EDIT_PICTURE');
      if (mode == "3")  this.modalTitle = this.translate.instant('CHANGE_PASSWORD');
    } 
    else {
      if (mode == "3")  this.formChangePwd.reset();
    }
  }

  /**
   *  Method: Validate customer/token
   */
  private validateToken() {
    this.apiUtilityService.apiDecodeJWTToken({ objRequest: { Token: this.g.getCustToken } }).subscribe( rsp => {
      if (rsp.d.RespCode == "200")
        this.getStateList(rsp.d.RespData[0].pid);
      else {
        rsp.d.RespCode = "401";
        this.g.apiRespError(rsp.d);
      }
    });
  }

  /**
   *  Method: Get state list
   */
  private getStateList(pid: any) {
    this.apiStateService.apiGetComboboxListState().subscribe(rsp => {
      if (rsp.d.RespCode == "200") {
        this.stateList = rsp.d.RespData;
        this.getProfileInfo(pid);
      }
      else this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Get customer profile
   */
  public  profileData: any = {};
  private getProfileInfo(pid: any) {
    this.apiProfileService.apiGetProfileInfo({ objRequest: { GetAllFlag: false, ProfileID: pid } }, this.g.getCustToken).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.g.setCustToken(rsp.d.ExtendedToken);
        this.profileData = rsp.d.RespData[0];
        let stateId = "";
        this.stateList.forEach( (e: any) => { if (e.StateSDesc == this.profileData.State) stateId = e.StateID; });
        this.formEditInfo.patchValue({
          fullname: this.profileData.Name,
          gender  : this.profileData.Sex,
          address1: this.profileData.Address1,
          address2: this.profileData.Address2,
          postcode: this.profileData.PostCode,
          state   : stateId,
        });
        this.formEditUCID.patchValue({ uniqCallID: this.profileData.UniqCallID });
      }
      else this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Edit info form
   */
  public formEditInfo: FormGroup = this.fb.group({
    fullname        : ['', [Validators.required,  Validators.minLength(3),  Validators.maxLength(80), Validators.pattern('^[a-zA-Z\\s\'@]+$')]],
    gender          : ['', [Validators.required]],
    address1        : ['', [Validators.required,  Validators.minLength(3),  Validators.maxLength(80), Validators.pattern('^[#.0-9a-zA-Z\\s,-/]+$')]],
    address2        : ['', [                      Validators.minLength(3),  Validators.maxLength(80), Validators.pattern('^[#.0-9a-zA-Z\\s,-/]+$')]],
    postcode        : ['', [Validators.required,  Validators.minLength(5),  Validators.maxLength(5),  Validators.pattern('^[0-9]{5}$')]],
    state           : ['', [Validators.required]],
  });
  public get errFormEditInfo_fullname() {
    var msg = "";
    if (this.formEditInfo.controls['fullname'].touched && this.formEditInfo.controls['fullname'].invalid) {
      if (this.formEditInfo.controls['fullname'].hasError('required'))   msg = '_ERROR.REQUIRED';
      if (this.formEditInfo.controls['fullname'].hasError('pattern'))    msg = '_ERROR.INVALID';
      if (this.formEditInfo.controls['fullname'].hasError('minlength'))  msg = '_ERROR.MINLENGTH';
      if (this.formEditInfo.controls['fullname'].hasError('maxlength'))  msg = '_ERROR.MAXLENGTH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }
  public get errFormEditInfo_gender() {
    var msg = "";
    if (this.formEditInfo.controls['gender'].touched && this.formEditInfo.controls['gender'].invalid)
      if (this.formEditInfo.controls['gender'].hasError('required')) msg = '_ERROR.REQUIRED';
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }
  public get errFormEditInfo_address1() {
    var msg = "";
    if (this.formEditInfo.controls['address1'].touched && this.formEditInfo.controls['address1'].invalid) {
      if (this.formEditInfo.controls['address1'].hasError('required'))   msg = '_ERROR.REQUIRED';
      if (this.formEditInfo.controls['address1'].hasError('pattern'))    msg = '_ERROR.INVALID';
      if (this.formEditInfo.controls['address1'].hasError('minlength'))  msg = '_ERROR.MINLENGTH';
      if (this.formEditInfo.controls['address1'].hasError('maxlength'))  msg = '_ERROR.MAXLENGTH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }
  public get errFormEditInfo_address2() {
    var msg = "";
    if (this.formEditInfo.controls['address2'].touched && this.formEditInfo.controls['address2'].invalid) {
      if (this.formEditInfo.controls['address2'].hasError('pattern'))    msg = '_ERROR.INVALID';
      if (this.formEditInfo.controls['address2'].hasError('minlength'))  msg = '_ERROR.MINLENGTH';
      if (this.formEditInfo.controls['address2'].hasError('maxlength'))  msg = '_ERROR.MAXLENGTH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }
  public get errFormEditInfo_postcode() {
    var msg = "";
    if (this.formEditInfo.controls['postcode'].touched && this.formEditInfo.controls['postcode'].invalid) {
      if (this.formEditInfo.controls['postcode'].hasError('required'))   msg = '_ERROR.REQUIRED';
      if (this.formEditInfo.controls['postcode'].hasError('pattern'))    msg = '_ERROR.INVALID';
      if (this.formEditInfo.controls['postcode'].hasError('minlength'))  msg = '_ERROR.MINLENGTH';
      if (this.formEditInfo.controls['postcode'].hasError('maxlength'))  msg = '_ERROR.MAXLENGTH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }
  public get errFormEditInfo_state() {
    var msg = "";
    if (this.formEditInfo.controls['state'].touched && this.formEditInfo.controls['state'].invalid)
      if (this.formEditInfo.controls['state'].hasError('required')) msg = '_ERROR.REQUIRED';
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }

  /**
   *  Method: Form unique call ID
   */
  public formEditUCID = this.fb.group({ uniqCallID: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30), Validators.pattern('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d\\(\\)\\*\\s]{5,30}$')]] });
  public get errFormUniqCallId() {
    var msg = "";
    if (this.formEditUCID.controls['uniqCallID'].touched && this.formEditUCID.controls['uniqCallID'].invalid) {
      if (this.formEditUCID.controls['uniqCallID'].hasError('required'))  msg = '_ERROR.REQUIRED';
      if (this.formEditUCID.controls['uniqCallID'].hasError('pattern'))   msg = '_ERROR.INVALID';
      if (this.formEditUCID.controls['uniqCallID'].hasError('minlength')) msg = '_ERROR.MINLENGTH';
      if (this.formEditUCID.controls['uniqCallID'].hasError('maxlength')) msg = '_ERROR.MAXLENGTH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }

  /**
   *  Method: Change password form
   */
  public formChangePwd: FormGroup = this.fb.group({
    password        : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(40), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,40}$')]],
    confirmPassword : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(40), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,40}$')]],
  }, { validator: this.g.matchPasswords('password', 'confirmPassword') });
  public get errFormChangePwd_password() {
    var msg = "";
    if (this.formChangePwd.controls['password'].touched && this.formChangePwd.controls['password'].invalid) {
      if (this.formChangePwd.controls['password'].hasError('required'))  msg = '_ERROR.REQUIRED';
      if (this.formChangePwd.controls['password'].hasError('pattern'))   msg = '_ERROR.INVALID';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }
  public get errFormChangePwd_confirmPassword() {
    var msg = "";
    if (this.formChangePwd.controls['confirmPassword'].touched && this.formChangePwd.controls['confirmPassword'].invalid) {
      if (this.formChangePwd.controls['confirmPassword'].hasError('required'))          msg = '_ERROR.REQUIRED';
      if (this.formChangePwd.controls['confirmPassword'].hasError('passwordMismatch'))  msg = '_ERROR.PASSWORD.CRITERIA.NOTMATCH';
    }
    return msg ? this.translate.instant(msg).toLowerCase() : "";
  }

  /**
   *  Method: Submit edited info and change password
   */
  public async submitForm() {

    if (this.modalMode == '0' || this.modalMode == '1') {
      var ucid: any = this.profileData.UniqCallID;
      //  check if the new UCID is already exist
      if (this.modalMode == '1') {
        if (this.formEditUCID.value.uniqCallID != ucid) {
          var rsp = await lastValueFrom(this.apiProfileService.apiCheckExists({ objRequest: { Mode: 'UNIQCALLID', SearchValue: this.formEditUCID.value.uniqCallID } }));
          if (rsp.d.RespCode == "200") {
            if (rsp.d.RespData[0].Status === "TRUE")  this.g.toastError(this.translate.instant('SCRN_REGISTER.VERIFY.UCID'));
            else                                      ucid = this.formEditUCID.value.uniqCallID;
          }
          else this.g.apiRespError(rsp.d);
        }
      }

      let request = {
        objRequest: {
          Mode    : "UPDATE",
          ProfileData : {
            IDNum     : this.profileData.IDNum,
            Email     : this.profileData.Email,
            MobileNo  : this.profileData.MobileNo,
            Name      : this.formEditInfo.value.fullname.toUpperCase(),
            Sex       : this.formEditInfo.value.gender,
            Address1  : this.formEditInfo.value.address1.toUpperCase(),
            Address2  : this.formEditInfo.value.address2.toUpperCase(),
            PostCode  : this.formEditInfo.value.postcode,
            State     : this.formEditInfo.value.state,
            UniqCallID: ucid.toUpperCase(),
            Password  : this.profileData.Password,
          },
        }
      }
      console.log(request.objRequest.ProfileData);
      // this.apiProfileService.apiCRUD(request, "").subscribe(rsp => {
      //   if (rsp.d.RespCode == "200") {
      //     this.g.toastSuccess(rsp.d.RespMessage);
        this.openModal(false, '');
        this.validateToken();
      //   }
      //   else this.g.toastError(rsp.d.RespMessage);
      // });
    }
  }

  /**
   *  Method: Get gender data
   */
  public genderList: any = [{ id: 'M', desc: 'MALE' }, { id: 'F', desc: 'FEMALE' },];
  public changeGender(val: any) { this.formEditInfo.controls['gender']?.setValue(val, { onlySelf: true }); }

  /**
   *  Method: Get state data
   */
  public stateList: any = [];
  public changeState(val: any) { this.formEditInfo.controls['state']?.setValue(val, { onlySelf: true }); }

  /**
   *  Method: Get available profile images
   */
  private urlSvgRepo: string = "https://www.svgrepo.com/show/";
  public  availableProfileImg: any = [
    this.urlSvgRepo + "530182/crab.svg",
    this.urlSvgRepo + "530183/elk.svg",
    this.urlSvgRepo + "530184/jellyfish.svg",
    this.urlSvgRepo + "530185/penguin.svg",
    this.urlSvgRepo + "530189/shrimp.svg",
    this.urlSvgRepo + "530190/rabbit.svg",
    this.urlSvgRepo + "530194/raccoon.svg",
    this.urlSvgRepo + "530196/crocodile.svg",
    this.urlSvgRepo + "530197/hedgehog.svg",
    this.urlSvgRepo + "530198/fox.svg",
  ];
}