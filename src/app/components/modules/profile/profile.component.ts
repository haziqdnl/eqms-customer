import { Component } from '@angular/core';
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
    public  g: GeneralService,
  ) {}
  
  ionViewWillEnter() {
    this.validateToken();
  }

  ionViewWillLeave() {}

  /**
   *  Method: Validate customer/token
   */
  private validateToken() {
    let request = { objRequest: { Token: this.g.getCustToken() } };
    this.apiUtilityService.apiDecodeJWTToken(request).subscribe( rsp => {
      if (rsp.d.RespCode == "200")
          this.getProfileInfo(rsp.d.RespData[0].pid);
      else {
        rsp.d.RespCode = "401";
        this.g.apiRespError(rsp.d);
      }
    });
  }

  /**
   *  Method: Get customer profile
   */
  public  profileData: any = {};
  private getProfileInfo(pid: any) {
    let request = { objRequest: { GetAllFlag: "false", ProfileID: pid } };
    this.apiProfileService.apiGetProfileInfo(request, this.g.getCustToken()).subscribe( rsp => {
      if (rsp.d.RespCode == "200")
        this.profileData = rsp.d.RespData[0];
      else 
        this.g.apiRespError(rsp.d);
    });
  }
}