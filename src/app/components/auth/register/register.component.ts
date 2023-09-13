import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiProfileService } from 'src/app/api/api-profile.service';
import { ApiStateService } from 'src/app/api/api-state.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector    : 'app-register',
  templateUrl : './register.component.html',
  styleUrls   : ['./register.component.scss']
})
export class RegisterComponent {

  constructor(
    private routeParam: ActivatedRoute,
    private apiProfileService: ApiProfileService,
    private apiStateService: ApiStateService,
    private fb: FormBuilder,
    public  g: GeneralService,
    public  router: Router,
    public  titleCasePipe: TitleCasePipe,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.getUrlParam();
    this.getStateList();
  }

  /**
   *  Method: get URL param
   */
  private urlParam: any;
  private getUrlParam() {
    this.routeParam.queryParamMap.subscribe(paramMap => { this.urlParam = paramMap.get('t'); });
  }

  /**
   *  Method: Form builder and control
   */
  public hidePwd: boolean = true;
  public formSubmitted = false;
  public registerForm: FormGroup = this.fb.group({
    fullname        : ['', [Validators.required,  Validators.minLength(3),  Validators.maxLength(60), Validators.pattern('^[a-zA-Z\\s\'@]+$')]],
    gender          : ['', [Validators.required]],
    identificationNo: ['', [Validators.required,  Validators.minLength(12), Validators.maxLength(12)]],
    address1        : ['', [Validators.required,  Validators.minLength(3),  Validators.maxLength(60), Validators.pattern('^[#.0-9a-zA-Z\\s,-/]+$')]],
    address2        : ['', [                      Validators.minLength(3),  Validators.maxLength(60), Validators.pattern('^[#.0-9a-zA-Z\\s,-/]+$')]],
    postcode        : ['', [Validators.required,  Validators.minLength(5),  Validators.maxLength(5),  Validators.pattern('^[0-9]{5}$')]],
    state           : ['', [Validators.required]],
    email           : ['', [Validators.required,  Validators.maxLength(30), Validators.pattern('^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$')]],
    mobileNo        : ['', [Validators.required,  Validators.minLength(9),  Validators.maxLength(12), Validators.pattern('^[1-9]\\d*$')]],
    password        : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(30), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$')]],
    confirmPassword : ['', [Validators.required,  Validators.minLength(8),  Validators.maxLength(30), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$')]],
  }, { validator: this.g.matchPasswords('password', 'confirmPassword') });
  get formControl() { return this.registerForm.controls; }

  /**
   *  Method: Submit register form
   */
  public submit() {
    this.formSubmitted = true;
    if (this.registerForm.valid) {
      let request = {
        objRequest: {
          Mode    : "CREATE",
          ProfileData : {
            Email     : this.registerForm.value.email,
            MobileNo  : '+60' + this.registerForm.value.mobileNo,
            Name      : this.registerForm.value.fullname,
            Sex       : this.registerForm.value.gender,
            Address1  : this.registerForm.value.address1,
            Address2  : this.registerForm.value.address2,
            PostCode  : this.registerForm.value.postcode,
            State     : this.registerForm.value.state,
            Password  : this.registerForm.value.password,
            IDNum     : this.registerForm.value.identificationNo,
            UniqCallID: '',
          },
        }
      }
      this.apiProfileService.apiCRUD(request, "").subscribe(rsp => {
        let status = 'success';
        if (rsp.d.RespCode == "200") {
          localStorage['eqmsCustomer_registertoken'] = JSON.stringify(this.registerForm.value);
          this.toastr.success(rsp.d.RespMessage);
          if (this.urlParam == 'adhoc')
            this.router.navigate(['register/status'], { queryParams: { is: status, t: this.urlParam } });
          else
            this.router.navigate(['register/status'], { queryParams: { is: status } });
        }
        else this.toastr.error(rsp.d.RespMessage);
      });
    }
  }

  /**
   *  Method: Get gender data
   */
  public genderList: any = [{ id: 'M', desc: 'MALE' }, { id: 'F', desc: 'FEMALE' },];
  public changeGender(e: any) { this.formControl['gender']?.setValue(e.value, { onlySelf: true }); }

  /**
   *  Method: Get state data
   */
  public  stateList: any = [];
  private getStateList() {
    this.apiStateService.apiGetComboboxListState().subscribe(rsp => {
      rsp.d.RespCode == "200" ? this.stateList = rsp.d.RespData : this.g.apiRespError(rsp.d);
    });
  }
  public changeState(e: any) { this.formControl['state']?.setValue(e.target.value, { onlySelf: true }); }

  /**
   *  Method: Back button
   */
  public back() { this.urlParam == 'adhoc' ? window.location.href = this.g.getEnvDomainUrl() + 'eqmskiosk/#/' : this.router.navigate(['login']); }
}