import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector    : 'app-register-status',
  templateUrl : './register-status.component.html',
  styleUrls   : ['./register-status.component.scss']
})
export class RegisterStatusComponent {

  constructor(
    private routeParam: ActivatedRoute,
    private g: GeneralService,
    public  location: Location,
    public  router: Router,
  ) {}

  ngOnInit() {
    if (localStorage['eqmsCustomer_registertoken'] == '') this.router.navigate(['register']);
    this.getUrlParam();
  }

  ngOnDestroy() {
    localStorage['eqmsCustomer_registertoken'] = '';
  }

  /**
   *  Method: get URL param
   */
  public urlParamStatus: any;
  public urlParamType: any;
  public  btnBackText: any = "Back to Login";
  private getUrlParam() {
    this.routeParam.queryParamMap.subscribe( paramMap => {
      this.urlParamStatus = paramMap.get('is');
      this.urlParamType   = paramMap.get('t');
    });

    if (this.urlParamStatus != 'success' && this.urlParamStatus != 'exist' && this.urlParamStatus != 'unverified')  this.router.navigate(['register']);
    if (this.urlParamType   == 'adhoc')                                                                             this.btnBackText = "Back";
  }

  /**
   *  Method: Back Button
   */
  public back() { this.urlParamType == 'adhoc' ? window.location.href = this.g.getEnvDomainUrl() + 'eqmskiosk/#/' : this.router.navigate(['login']); }
}