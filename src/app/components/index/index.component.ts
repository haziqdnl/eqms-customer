import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonContent } from '@ionic/angular';
import { interval } from 'rxjs';
import { ApiApptService } from 'src/app/api/api-appt.service';
import { ApiNewsfeedService } from 'src/app/api/api-newsfeed.service';
import { ApiProfileService } from 'src/app/api/api-profile.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { ApiWalkinService } from 'src/app/api/api-walkin.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector    : 'app-index',
  templateUrl : './index.component.html',
  styleUrls   : ['./index.component.scss']
})
export class IndexComponent {

  constructor(
    private routeParam: ActivatedRoute,
    private alertController: AlertController,
    private apiApptService: ApiApptService,
    private apiNewsfeedService: ApiNewsfeedService,
    private apiProfileService: ApiProfileService,
    private apiUtilityService: ApiUtilityService,
    private apiWalkInService: ApiWalkinService,
    public  g: GeneralService,
    public  http: HttpClient,
  ) {}
  
  ionViewWillEnter() {
    this.validateToken();
    this.getUrlParam();

    /** */
    this.g.createNotification("Test", "Test body", 0);
    console.log("Popout notification");
    //this.g.vibrate();
  }
  ionViewWillLeave()  { this.destroy() }
  ngOnDestroy()       { this.destroy() }

  private destroy() {
    if (this.alertLogout)         this.alertLogout.dismiss();
    if (this.alertCheckInSuccess) this.alertCheckInSuccess.dismiss();
    if (this.alertCancelAppt)     this.alertCancelAppt.dismiss();
    
    if (this.intervalGetApptInfo)   this.intervalGetApptInfo.unsubscribe();
    if (this.intervalGetWalkInInfo) this.intervalGetWalkInInfo.unsubscribe();
  }

  /**
   *  Method: get URL param
   */
  private getUrlParam() {
    this.routeParam.queryParamMap.subscribe( paramMap => {
      if (paramMap.get('scan') == '1')
        setTimeout( () => { this.openAlertCheckInSuccess(); }, 1000);
      else if (paramMap.get('scan') == '0')
        this.g.apiRespError(JSON.parse(localStorage['eqmsCustomer_errScan']));
    });
  }

  /**
   *  Method: Validate customer/token
   */
  private validateToken() {
    let request = { objRequest: { Token: this.g.getCustToken() } };
    this.apiUtilityService.apiDecodeJWTToken(request).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.getProfileInfo(rsp.d.RespData[0].pid);
        this.getNewsFeed();
        this.getApptInfo();
        this.getWalkInInfo();
      }
      else {
        rsp.d.RespCode = "401";
        this.g.apiRespError(rsp.d);
      }
    });
  }

  /**
   *  Method: Get customer profile
   */
  public  username = "";
  public  uniqCallID = "";
  private getProfileInfo(pid: any) {
    let request = { objRequest: { GetAllFlag: "false", ProfileID: pid } };
    this.apiProfileService.apiGetProfileInfo(request, this.g.getCustToken()).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.username   = rsp.d.RespData[0].Name;
        this.uniqCallID = rsp.d.RespData[0].UniqCallID;
      }
      else this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Get News Feed
   */
  public  newsFeedData: any = [];
  private getNewsFeed() {
    this.apiNewsfeedService.apiGetCustNewsfeedInfo(this.g.getCustToken()).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.g.setCustToken(rsp.d.ExtendedToken)
        this.newsFeedData = rsp.d.RespData;
      }
      else this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Get appt data
   */
  private selectedAgencyID: any = "39";
  public  apptData: any = [];
  private intervalGetApptInfo: any;
  private getApptInfo() {
    this.intervalGetApptInfo = interval(1000).subscribe( () => {
      this.apiApptService.apiGetAppt(this.g.getCustToken()).subscribe( rsp => {
        this.apptData = [];
        if (rsp.d.RespCode == "200") {
          this.g.setCustToken(rsp.d.ExtendedToken);
          if (rsp.d.RespData != "" && rsp.d.RespData != null) {
            rsp.d.RespData.forEach( (e: any) => {
              if (e.AppStat != "COMPLETE" && e.AppStat != "NOSHOW") this.apptData.push(e)
            });
          }
        }
        else this.g.apiRespError(rsp.d);
      });
    });
  }

  /**
   *  Method: Get walk-in data
   */
  public  walkInData: any = [];
  private intervalGetWalkInInfo: any;
  private getWalkInInfo() {
    this.intervalGetWalkInInfo = interval(1000).subscribe( () => {
      this.apiWalkInService.apiGetWalkinByProfile(this.g.getCustToken()).subscribe( rsp => {
        this.walkInData = [];
        if (rsp.d.RespCode == "200") {
          this.g.setCustToken(rsp.d.ExtendedToken);
          if (rsp.d.RespData != "" && rsp.d.RespData != null) {
            rsp.d.RespData.forEach( (e: any) => {
              if (e.WalkInStat != "COMPLETE" && e.WalkInStat != "NOSHOW") this.walkInData.push(e)
            });
          }
        }
        else this.g.apiRespError(rsp.d);
      });
    });
  }

  /**
   *  Method: Alert logout
   */
  private alertLogout: any;
  public  async openAlertLogout() {
    this.alertLogout = await this.alertController.create({
      header    : 'Confirm logout?',
      buttons   : [
        {
          text: 'No', role: 'cancel', cssClass: 'text-primary',
          handler: () => {},
        },
        {
          text: 'Yes', role: 'confirm', cssClass: 'text-danger',
          handler: () => { this.g.endSession(); },
        },
      ],
    });
    await this.alertLogout.present();
  }
  
  /**
   *  Method: Alert check-in success
   */
  private alertCheckInSuccess: any;
  public  async openAlertCheckInSuccess() {
    this.alertCheckInSuccess = await this.alertController.create({
      message : `<h4 class="fw-bold text-success">Check-In Successful</h4><p class="m-0 mt-2">Please wait at the waiting area. We'll call and serve you in a few minutes.</p>`,
      buttons : [{ text: 'OK', role: 'confirm' }],
    });
    await this.alertCheckInSuccess.present();
  }
  
  /**
   *  Method: Alert cancel appointment
   */
  private alertCancelAppt: any;
  public  async openAlertCancelAppt() {
    this.alertCancelAppt = await this.alertController.create({
      header    : 'Confirm cancel appointment?',
      buttons   : [
        {
          text: 'No', role: 'cancel', cssClass: 'text-primary',
          handler: () => {},
        },
        {
          text: 'Yes', role: 'confirm', cssClass: 'text-danger',
          handler: () => {
            let request = {
              objRequest: { 
                Mode    : "DELETE",
                ApptData: {
                  AgencyID: this.selectedAgencyID, 
                  OutletID: this.apptData[0].OutletID, 
                  ApptID  : this.apptData[0].ApptID,
                }
              }
            };
            this.apiApptService.apiCRUD(request, this.g.getCustToken()).subscribe( rsp => {
              rsp.d.RespCode == "200" ? this.getApptInfo() : this.g.apiRespError(rsp.d);
            });
          },
        },
      ],
    });
    await this.alertCancelAppt.present();
  }

  /**
   *  Method: Scroll to top
   */
  @ViewChild(IonContent) content!: IonContent;
  public scrollToTop() { this.content.scrollToTop(500); }
}