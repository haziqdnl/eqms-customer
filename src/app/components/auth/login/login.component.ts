import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
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
    public  g: GeneralService,
    public translate: TranslateService
  ) {}

  ngOnInit() { this.validateToken(); }
  ionViewWillLeave() { this.formIdPassword.reset(); }

  /**
   *  Method: Auto login if token from previous login still valid
   */
  public defaultLang = this.g.getTokenDefaultLanguage();
  private validateToken() {
    if (this.g.getCustToken()) {
      this.apiUtilityService.apiDecodeJWTToken({ objRequest: { Token: this.g.getCustToken() } }).subscribe( rsp => { if (rsp.d.RespCode == "200") this.g.redirectTo(''); });
    }
  }

  /**
   *  Method: Form builder and controller
   */
  public formIdPasswordSubmitted = false;
  public get formIdPasswordControl()  { return this.formIdPassword.controls; }
  public formIdPassword = this.fb.group({
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
        this.g.toastError(this.translate.instant('LOGIN.INVALID_LOGIN'));
        this.g.setCustToken("");
      }
    });
  }
}