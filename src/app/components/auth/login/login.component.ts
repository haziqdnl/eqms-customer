import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
    private g: GeneralService,
    public  router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.validateToken();
  }

  /**
   *  Method: Auto login if token from previous login still valid
   */
  private validateToken() {
    if (this.g.getCustToken() != "") {
      let request = { objRequest: { Token: this.g.getCustToken() } };
      this.apiUtilityService.apiDecodeJWTToken(request).subscribe( rsp => {
        if (rsp.d.RespCode == "200")  this.router.navigate(['']);
      });
    }
  }

  /**
   *  Method: Submit login form
   */
  public submit(loginForm: NgForm) {
    let request = {
      objRequest: {
        LoginID   : loginForm.form.get("loginId")?.value,
        Password  : loginForm.form.get("password")?.value
      }
    };
    this.apiAuthService.apiCustomerLogin(request).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.g.setCustToken(rsp.d.RespData[0].Token);
        this.router.navigate(['']);
      }
      else {
        this.toastr.error("Invalid ID/Password !");   
        this.g.setCustToken("");
      }
    });
  }
}