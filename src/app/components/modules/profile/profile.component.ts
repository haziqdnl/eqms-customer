import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    public  g: GeneralService
  ) {}
  
  ionViewWillEnter() { this.validateToken(); }

  ionViewWillLeave() {}

  /**
   *  Method: Validate customer/token
   */
  private validateToken() {
    let request = { objRequest: { Token: this.g.getCustToken() } };
    this.apiUtilityService.apiDecodeJWTToken(request).subscribe( rsp => {
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
    let request = { objRequest: { GetAllFlag: "false", ProfileID: pid } };
    this.apiProfileService.apiGetProfileInfo(request, this.g.getCustToken()).subscribe( rsp => {
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
      }
      else this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Edit info form
   */
  public formEditInfoSubmitted = false;
  public get formEditInfoControl() { return this.formEditInfo.controls; }
  public formEditInfo: FormGroup = this.fb.group({
    fullname        : ['', [Validators.required,  Validators.minLength(3),  Validators.maxLength(60), Validators.pattern('^[a-zA-Z\\s\'@]+$')]],
    gender          : ['', [Validators.required]],
    address1        : ['', [Validators.required,  Validators.minLength(3),  Validators.maxLength(60), Validators.pattern('^[#.0-9a-zA-Z\\s,-/]+$')]],
    address2        : ['', [                      Validators.minLength(3),  Validators.maxLength(60), Validators.pattern('^[#.0-9a-zA-Z\\s,-/]+$')]],
    postcode        : ['', [Validators.required,  Validators.minLength(5),  Validators.maxLength(5),  Validators.pattern('^[0-9]{5}$')]],
    state           : ['', [Validators.required]],
  });
  public submitEditInfo() {
    this.formEditInfoSubmitted = true;
    if (this.formEditInfo.valid) {
      let request = {
        objRequest: {
          Mode    : "UPDATE",
          ProfileData : {
            Email     : this.profileData.Email,
            MobileNo  : this.profileData.MobileNo,
            Name      : this.formEditInfo.value.fullname,
            Sex       : this.formEditInfo.value.gender,
            Address1  : this.formEditInfo.value.address1,
            Address2  : this.formEditInfo.value.address2,
            PostCode  : this.formEditInfo.value.postcode,
            State     : this.formEditInfo.value.state,
            Password  : this.profileData.Password,
            IDNum     : this.profileData.IDNum,
            UniqCallID: this.profileData.UniqCallID,
          },
        }
      }
      console.log(request);
      // this.apiProfileService.apiCRUD(request, "").subscribe(rsp => {
      //   if (rsp.d.RespCode == "200") {
      //     this.g.toastSuccess(rsp.d.RespMessage);
      //   }
      //   else this.g.toastError(rsp.d.RespMessage);
      // });
    }
  }

  /**
   *  Method: Change password form
   */
  public formChangePwdSubmitted = false;
  public get formChangePwdControl() { return this.formChangePwd.controls; }
  public formChangePwd: FormGroup = this.fb.group({
    password        : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(30), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')]],
    confirmPassword : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(30), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')]],
  }, { validator: this.g.matchPasswords('password', 'confirmPassword') });
  public submitChangePwd() {
    this.formChangePwdSubmitted = true;
    if (this.formChangePwd.valid) {
      let request = {
        objRequest: {
          Mode    : "UPDATE",
          ProfileData : {
            ProfileID : '',
            Password  : this.formChangePwd.value.password,
          },
        }
      };
      console.log(request);
      // this.apiProfileService.apiCRUD(request, "").subscribe(rsp => {
      //   if (rsp.d.RespCode == "200") {
      //     this.g.toastSuccess(rsp.d.RespMessage);
      //   }
      //   else this.g.toastError(rsp.d.RespMessage);
      // });
    }
  }

  /**
   *  Method: Get gender data
   */
  public genderList: any = [{ id: 'M', desc: 'MALE' }, { id: 'F', desc: 'FEMALE' },];
  public changeGender(e: any) { this.formEditInfoControl['gender']?.setValue(e.value, { onlySelf: true }); }

  /**
   *  Method: Get state data
   */
  public  stateList: any = [];
  public changeState(e: any) { this.formEditInfoControl['state']?.setValue(e.value, { onlySelf: true }); }

  /**
   *  Method: Modal
   *  - Modal mode: 
   *    0 = Edit Info,
   *    1 = Rename UniqCallId
   *    2 = Change Profile Picture
   *    3 = Change Password
   */
  public modeModal: string = "";
  public titleModal: string = "";
  public isOpenModalEditProfile: boolean = false;
  public openCloseModalEditProfile(open: boolean, mode: string) {
    this.validateToken();
    this.isOpenModalEditProfile = open;
    this.modeModal = mode;

    if (open) {
      if (mode == "0")  this.titleModal = "Edit Profile";
      if (mode == "1")  this.titleModal = "Rename Unique Call ID";
      if (mode == "2")  this.titleModal = "Change Profile Picture";
      if (mode == "3")  this.titleModal = "Change Password";
    } 
    else {
      if (mode == "3")  this.formChangePwd.reset();
    }
  }

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