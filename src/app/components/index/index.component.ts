import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController, IonContent } from '@ionic/angular';
import { interval } from 'rxjs';
import { ApiApptService } from 'src/app/api/api-appt.service';
import { ApiNewsfeedService } from 'src/app/api/api-newsfeed.service';
import { ApiProfileService } from 'src/app/api/api-profile.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { ApiWalkinService } from 'src/app/api/api-walkin.service';
import { CheckInService } from 'src/app/services/check-in/check-in.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { TranslateService } from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector    : 'app-index',
  templateUrl : './index.component.html',
  styleUrls   : ['./index.component.scss']
})
export class IndexComponent {

  constructor(
    private alertController: AlertController,
    private apiApptService: ApiApptService,
    private apiNewsfeedService: ApiNewsfeedService,
    private apiProfileService: ApiProfileService,
    private apiUtilityService: ApiUtilityService,
    private apiWalkInService: ApiWalkinService,
    private checkInService: CheckInService,
    private sanitizer: DomSanitizer,
    public  g: GeneralService,
    private titleCase: TitleCasePipe,
    private translate: TranslateService
  ) {}
  
  public urlCurentGoldMarketPrice = this.sanitizer.bypassSecurityTrustResourceUrl("https://arxonline.com.my/rms.tawaruq/EIS/rate.php");
  public loaded = false;
  ionViewWillEnter() {
    this.g.showLoading(1000);
    setTimeout( () => { this.loaded = true }, 1000);
    this.validateToken();
    this.getUrlParam();
  }
  ionViewWillLeave()  { this.destroyPage(); }
  ngOnDestroy()       { this.destroyPage(); }

  /**
   *  Method: Destroy the page content and functions
   */
  private destroyPage() {
    this.loaded = false
    if (this.alertLogout)               this.alertLogout.dismiss();
    if (this.alertCheckInSuccess)       this.alertCheckInSuccess.dismiss();
    if (this.alertCancelAppt)           this.alertCancelAppt.dismiss();
    if (this.intervalGetApptInfo)       this.intervalGetApptInfo.unsubscribe();
    if (this.intervalGetWalkInInfo)     this.intervalGetWalkInInfo.unsubscribe();
    if (this.intervalIsCheckInEnabled)  this.intervalIsCheckInEnabled.unsubscribe();
  }

  /**
   *  Method: Validate customer/token
   */
  private validateToken() {
    this.apiUtilityService.apiDecodeJWTToken({ objRequest: { Token: this.g.getCustToken } }).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.getProfileInfo(rsp.d.RespData[0].pid);
        this.getNewsFeed();
        this.getApptInfo();
        this.getWalkInInfo();
        this.isCheckInEnabled();
      }
      else {
        rsp.d.RespCode = "401";
        this.g.apiRespError(rsp.d);
      }
    });
  }

  /**
   *  Method: get URL param
   */
  private getUrlParam() {
    if (localStorage['eqmsCustomer_scanResult'] != "" && localStorage['eqmsCustomer_scanResult'] != undefined) {
      let data = JSON.parse(localStorage['eqmsCustomer_scanResult']);
      if (data.RespCode == "200") setTimeout( () => { this.openAlertCheckInSuccess(); }, 1000);
      localStorage['eqmsCustomer_scanResult'] = "";
    }
  }

  /**
   *  Method: Get customer profile
   */
  public  username = "";
  public  uniqCallID = "";
  private getProfileInfo(pid: any) {
    this.apiProfileService.apiGetProfileInfo({ objRequest: { GetAllFlag: false, ProfileID: pid } }, this.g.getCustToken).subscribe( rsp => {
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
    this.apiNewsfeedService.apiGetCustNewsfeedInfo(this.g.getCustToken).subscribe( rsp => {
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
  public  apptData: any = [];
  private intervalGetApptInfo: any;
  private getApptInfo() {
    this.intervalGetApptInfo = interval(1000).subscribe( () => {
      this.apiApptService.apiGetAppt(this.g.getCustToken).subscribe( rsp => {
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
      this.apiWalkInService.apiGetWalkinByProfile(this.g.getCustToken).subscribe( rsp => {
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
   *  Method: Check the check-in scanner enablement status
   */
  public checkInData: any = {
    enableScanner     : false,
    isAppt            : false,
    isSupported       : false,
    msgDisabledScanner: "",
  };
  private intervalIsCheckInEnabled: any;
  private isCheckInEnabled() {
    this.intervalIsCheckInEnabled = interval(1000).subscribe( async () => { 
      this.checkInData = await this.checkInService.isCheckInEnabled(); 
    });
  }

  /**
   *  Method: Alert logout
   */
  private alertLogout: any;
  public  async openAlertLogout() {
    this.alertLogout = await this.alertController.create({
      header    : this.translate.instant('SCRN_HOME.ALERT.LOGOUT'),
      buttons   : [
        { text: this.translate.instant('NO'),   role: 'cancel',   cssClass: 'text-primary', handler: () => {} },
        { text: this.translate.instant('YES'),  role: 'confirm',  cssClass: 'text-danger',  handler: () => { this.g.endSession(); } },
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
      message : `<h4 class="fw-bold text-success">${this.titleCase.transform(this.translate.instant('SCRN_HOME.CHECKIN_SUCCESS'))}</h4>
                <p class="m-0 mt-2">${this.translate.instant('SCRN_HOME.WAIT_MSG')}</p>`,
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
      header    : this.translate.instant('SCRN_HOME.ALERT.APPT_CANCEL'),
      buttons   : [
        { text: this.translate.instant('NO'),   role: 'cancel',   cssClass: 'text-primary', handler: () => {} },
        {
          text: this.translate.instant('YES'),  role: 'confirm',  cssClass: 'text-danger',
          handler: () => {
            let request = {
              objRequest: { 
                Mode    : "DELETE",
                ApptData: {
                  AgencyID: this.apptData[0].AgencyID,
                  OutletID: this.apptData[0].OutletID, 
                  ApptID  : this.apptData[0].ApptID,
                }
              }
            };
            this.apiApptService.apiCRUD(request, this.g.getCustToken).subscribe( rsp => {
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