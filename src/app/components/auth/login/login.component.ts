import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiAuthService } from 'src/app/api/api-auth.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { GeneralService } from 'src/app/services/general/general.service';

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
    public  g: GeneralService
  ) {}

  ionViewWillEnter() { this.validateToken(); }

  /**
   *  Method: Auto login if token from previous login still valid
   */
  private validateToken() {
    if (this.g.getCustToken() != "") {
      let request = { objRequest: { Token: this.g.getCustToken() } };
      this.apiUtilityService.apiDecodeJWTToken(request).subscribe( rsp => { if (rsp.d.RespCode == "200") this.g.redirectTo(''); });
    }
  }

  /**
   *  Method: Form builder and controller
   */
  public formIdPasswordSubmitted = false;
  public get formIdPasswordControl()  { return this.formIdPassword.controls; }
  public formIdPassword: FormGroup = this.fb.group({
    id      : ['', [Validators.required, Validators.pattern('^[1-9]\\d*$')]],
    password: ['', [Validators.required]],
  });

  /**
   *  Method: Submit login form
   */
  public isIdPasswordValid: boolean = false;
  public submit() {
    let request = {
      objRequest: {
        LoginID : '+60' + this.formIdPassword.value.id,
        Password: this.formIdPassword.value.password
      }
    };
    this.apiAuthService.apiCustomerLogin(request).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.g.setCustToken(rsp.d.RespData[0].Token);
        this.g.redirectTo('');
      }
      else {
        this.g.toastError("Invalid ID/Password !");
        this.g.setCustToken("");
      }
    });
  }
}