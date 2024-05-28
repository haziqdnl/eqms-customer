import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { ApiProfileService } from 'src/app/api/api-profile.service';
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
    private apiUtilityService: ApiUtilityService,
    private fb: FormBuilder,
    public  g: GeneralService,
    private translate: TranslateService
  ) {}
  
  public loaded = false;
  ionViewWillEnter() {
    this.g.showLoading(1000);
    setTimeout( () => { this.loaded = true }, 1000);
    this.validateToken();
  }

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
    if (open && mode == "0") this.modalTitle = this.translate.instant('SCRN_PROFILE.MODAL.EDIT_PROFILE');
    if (open && mode == "1") this.modalTitle = this.translate.instant('SCRN_PROFILE.MODAL.RENAME_UCID');
    if (open && mode == "2") this.modalTitle = this.translate.instant('SCRN_PROFILE.MODAL.EDIT_PICTURE');
    if (open && mode == "3") this.modalTitle = this.translate.instant('CHANGE_PASSWORD');
    else this.formChangePwd.reset();
  }

  /**
   *  Method: Validate customer/token and get profile data
   */
  public  profileData: any = {};
  private validateToken() {
    this.apiUtilityService.apiDecodeJWTToken({ objRequest: { Token: this.g.getCustToken } }).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.apiProfileService.apiGetProfileInfo({ objRequest: { GetAllFlag: false, ProfileID: rsp.d.RespData[0].pid } }, this.g.getCustToken).subscribe( rsp => {
          if (rsp.d.RespCode == "200") {
            this.g.setCustToken(rsp.d.ExtendedToken);
            this.profileData = rsp.d.RespData[0];
            this.formEditInfo.patchValue({ fullname  : this.profileData.Name       });
            this.formEditUCID.patchValue({ uniqCallID: this.profileData.UniqCallID });
          }
          else this.g.apiRespError(rsp.d);
        });
      }
      else {
        rsp.d.RespCode = "401";
        this.g.apiRespError(rsp.d);
      }
    });
  }

  /**
   *  Method: Edit info form
   */
  public formEditInfo = this.fb.group({ fullname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80), Validators.pattern('^[a-zA-Z\\s\'@]+$')]] });
  public get errFormEditInfo_fullname() { return this.g.getFormErrMsg(this.formEditInfo.controls['fullname']);  }

  /**
   *  Method: Form unique call ID
   */
  public formEditUCID = this.fb.group({ uniqCallID: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30), Validators.pattern('^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d\\(\\)\\*\\s]{5,30}$')]] });
  public get errFormEditUCID() { return this.g.getFormErrMsg(this.formEditUCID.controls['uniqCallID']); }

  /**
   *  Method: Change password form
   */
  public formChangePwd = this.fb.group({
    password       : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(40), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,40}$')]],
    confirmPassword: ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(40), Validators.pattern('^(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[!@#$%^&*a-zA-Z\\d]{8,40}$')]],
  }, { validator: this.g.matchPasswords('password', 'confirmPassword') });
  public get errFormChangePwd_password()        { return this.g.getFormErrMsg(this.formChangePwd.controls['password']); }
  public get errFormChangePwd_confirmPassword() { return this.g.getFormErrMsg(this.formChangePwd.controls['confirmPassword']); }

  /**
   *  Method: Submit edited info and change password
   */
  public async submitForm() {
    var ucid: any = this.profileData.UniqCallID;
    
    if (this.modalMode == '1') {
      if (this.formEditUCID.value.uniqCallID != ucid) {
        //  check if the new UCID is already exist
        var rsp = await lastValueFrom(this.apiProfileService.apiCheckExists({ objRequest: { Mode: 'UNIQCALLID', SearchValue: this.formEditUCID.value.uniqCallID } }));
        if (rsp.d.RespCode == "200")
          rsp.d.RespData[0].Status === "TRUE" ? this.g.toastError(this.translate.instant('SCRN_REGISTER.VERIFY.UCID')) : ucid = this.formEditUCID.value.uniqCallID;
        else
          this.g.apiRespError(rsp.d);
      }
    }

    let request: any = {
      objRequest    : {
        Mode        : "UPDATE",
        ProfileData : { 
          ProfileID : this.profileData.ProfileID,
          Email     : this.profileData.Email,
          Name      : this.formEditInfo.value.fullname?.toUpperCase(),
          UniqCallID: ucid.toUpperCase()
        }
      }
    };
    this.apiProfileService.apiCRUD(request, this.g.getCustToken).subscribe(rsp => {
      if (rsp.d.RespCode == "200") {
        this.g.toastSuccess(rsp.d.RespMessage);
        this.openModal(false, '');
        this.validateToken();
      }
      else this.g.toastError(rsp.d.RespMessage);
    });
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
/** ========== Scrapped code ==========
 *  * Statements in validateToken()
 *  this.getStateList(rsp.d.RespData[0].pid);
 *  * Statements in getProfileInfo()
 *  let stateId = "";
 *  this.stateList.forEach( (e: any) => { if (e.StateSDesc == this.profileData.State) stateId = e.StateID; });
 *  * Attributess FormEditInfo
 *  gender  : ['', [Validators.required]]
 *  address1: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80), Validators.pattern('^[#.0-9a-zA-Z\\s,-/]+$')]]
 *  address2: ['', [                     Validators.minLength(3), Validators.maxLength(80), Validators.pattern('^[#.0-9a-zA-Z\\s,-/]+$')]]
 *  postcode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5),  Validators.pattern('^[0-9]{5}$')]]
 *  state   : ['', [Validators.required]],
 *  * Methods for FormEditInfo control
 *  public get errFormEditInfo_gender()   { return this.g.getFormErrMsg(this.formEditInfo.controls['gender']);    }
 *  public get errFormEditInfo_address1() { return this.g.getFormErrMsg(this.formEditInfo.controls['address1']);  }
 *  public get errFormEditInfo_address2() { return this.g.getFormErrMsg(this.formEditInfo.controls['address2']);  }
 *  public get errFormEditInfo_postcode() { return this.g.getFormErrMsg(this.formEditInfo.controls['postcode']);  }
 *  public get errFormEditInfo_state()    { return this.g.getFormErrMsg(this.formEditInfo.controls['state']);     }
 *  * Attributes in objRequest.ProfileData
 *  Sex     : this.formEditInfo.value.gender
 *  IDNum   : this.profileData.IDNum
 *  Address1: this.formEditInfo.value.address1?.toUpperCase()
 *  Address2: this.formEditInfo.value.address2?.toUpperCase()
 *  PostCode: this.formEditInfo.value.postcode
 *  State   : this.formEditInfo.value.state
 *  * Attributes in formEditInfo.patchValue
 *  gender  : this.profileData.Sex
 *  address1: this.profileData.Address1
 *  address2: this.profileData.Address2
 *  postcode: this.profileData.PostCode
 *  state   : stateId,
 *  * Methods for gender control
 *  public genderList: any = [{ id: 'M', desc: this.translate.instant('MALE') }, { id: 'F', desc: this.translate.instant('FEMALE') }];
 *  public changeGender(val: any) { this.formEditInfo.controls['gender']?.setValue(val, { onlySelf: true }); }
 *  * Methods for state control
 *  public stateList: any = [];
 *  public changeState(val: any) { this.formEditInfo.controls['state']?.setValue(val, { onlySelf: true }); }
 *  * Method to get state list
 *  private getStateList(pid: any) {
 *    this.apiStateService.apiGetComboboxListState().subscribe(rsp => {
 *      if (rsp.d.RespCode == "200")  this.stateList = rsp.d.RespData;
 *      else                          this.g.apiRespError(rsp.d);
 *    });
 *  }
 * */