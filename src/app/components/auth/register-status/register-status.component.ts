import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeneralService } from 'src/app/services/general/general.service';
import { TranslateService } from '@ngx-translate/core';

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
    public translate: TranslateService
  ) {}

  ionViewWillEnter() {
    if (localStorage['eqmsCustomer_registerData'] == '') this.g.redirectBack('login');
    this.getUrlParam();
  }

  ionViewWillLeave() { localStorage['eqmsCustomer_registerData'] = ''; }

  /**
   *  Method: get URL param
   */
  public urlParamStatus: any;
  public urlParamType: any;
  public btnBackText: any = this.translate.instant('REGISTER_STATUS.REG_BACK_TO_LOGIN');
  private getUrlParam() {
    this.routeParam.queryParamMap.subscribe( paramMap => {
      this.urlParamStatus = paramMap.get('is');
      this.urlParamType   = paramMap.get('t');
    });

    if (this.urlParamStatus != 'success' && this.urlParamStatus != 'exist' && this.urlParamStatus != 'unverified')  this.g.redirectBack('login');
    if (this.urlParamType   == 'adhoc')                                                                             this.btnBackText = this.translate.instant('REGISTER_STATUS.REG_BACK');
  }

  /**
   *  Method: Back Button
   */
  public back() { this.urlParamType == 'adhoc' ? window.location.href = this.g.getEnvDomainUrl + 'eqmskiosk/#/' : this.g.redirectBack('login'); }
}