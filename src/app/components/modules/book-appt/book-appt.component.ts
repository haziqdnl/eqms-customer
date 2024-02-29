import { Component, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { interval } from 'rxjs';
import { ApiApptService } from 'src/app/api/api-appt.service';
import { ApiOutletService } from 'src/app/api/api-outlet.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { ApiWalkinService } from 'src/app/api/api-walkin.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-book-appt',
  templateUrl: './book-appt.component.html',
  styleUrls: ['./book-appt.component.scss']
})
export class BookApptComponent {

  constructor(
    private apiApptService: ApiApptService,
    private apiOutletService: ApiOutletService,
    private apiUtilityService: ApiUtilityService,
    private apiWalkInService: ApiWalkinService,
    public  g: GeneralService,
    private translate: TranslateService
  ) {} 
  
  public loaded = false;
  ionViewWillEnter() {
    this.g.showLoading(1000);
    setTimeout( () => { this.loaded = true }, 1000);
    this.validateToken(); 
  }
  ionViewWillLeave()  { this.destroy(); }
  ngOnDestroy()       { this.destroy(); }

  /**
   *  Method: Destroy the page content and functions
   */
  private destroy() {
    this.loaded = false
    if (this.intervalGetApptInfo)   this.intervalGetApptInfo.unsubscribe();
    if (this.intervalGetWalkInInfo) this.intervalGetWalkInInfo.unsubscribe();
    this.getOutletList("");
  }

  /**
   *  Method: Validate customer/token
   */
  private validateToken() {
    this.apiUtilityService.apiDecodeJWTToken({ objRequest: { Token: this.g.getCustToken } }).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
          this.getApptInfo();
          this.getWalkInInfo();
          this.getStateList();
      }
      else {
        rsp.d.RespCode = "401";
        this.g.apiRespError(rsp.d);
      }
    });
  }

  /**
   *  Method: Get appt data
   */
  public  isAppt: Boolean = false;
  private intervalGetApptInfo: any;
  private getApptInfo() {
    this.intervalGetApptInfo = interval(1000).subscribe( () => {
      this.apiApptService.apiGetAppt(this.g.getCustToken).subscribe( rsp => {
        this.isAppt = false;
        if (rsp.d.RespCode == "200") {
          this.g.setCustToken(rsp.d.ExtendedToken);
          if (rsp.d.RespData == "" || rsp.d.RespData == undefined)
            this.isAppt = false;
          else
            this.isAppt = (rsp.d.RespData[0].AppStat == "COMPLETE" || rsp.d.RespData[0].AppStat == "NOSHOW") ? false : true;
        }
        else this.g.apiRespError(rsp.d);
      });
    });
  }

  /**
   *  Method: Get walk-in data
   */
  public  isWalkIn: Boolean = false;
  private intervalGetWalkInInfo: any;
  private getWalkInInfo() {
    this.intervalGetWalkInInfo = interval(1000).subscribe( () => {
      this.apiWalkInService.apiGetWalkinByProfile(this.g.getCustToken).subscribe( rsp => {
        this.isWalkIn = false;
        if (rsp.d.RespCode == "200") {
          this.g.setCustToken(rsp.d.ExtendedToken);
          if (rsp.d.RespData == "" || rsp.d.RespData == undefined)
            this.isWalkIn = false;
          else
            this.isWalkIn = (rsp.d.RespData[0].WalkInStat == "COMPLETE" || rsp.d.RespData[0].WalkInStat == "NOSHOW") ? false : true;
        }
        else this.g.apiRespError(rsp.d);
      });
    });
  }

  /**
   *  Method: Get list of state
   */
  public  selectedStateID: any = "";
  public  stateOutletData: Array<any> = [];
  private getStateList() {
    this.apiOutletService.apiGetListOutletByState().subscribe( rsp => {
      rsp.d.RespCode == "200" ? this.stateOutletData = rsp.d.RespData : this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Get available time of appt based on the selected date
   */
  @ViewChild(IonContent) content: IonContent | undefined;
  public apptTimeList: Array<any> = [];
  public getApptTime(dData:any, dDisp:any) {
    this.content?.scrollToBottom(500);
    this.setApptDate(dData, dDisp)
    this.apiApptService.apiGetApptTime({ objRequest: { OutletID: this.selectedOutletID, ApptDate: dData } }, this.g.getCustToken).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.setApptTime("", "");
        this.apptTimeList = rsp.d.RespData;
      }
      else this.g.apiRespError(rsp.d);
    });
  }
  
  /**
   *  Method: Get list of outlet based on the state
   */
  public selectedOutletID: any = "";
  public selectedOutletDesc: any = "";
  public outletByStateData: Array<any> = [];
  public getOutletList(sId: any) {
    this.setOutlet("", "");
    this.selectedStateID = sId;
    if (sId)  for (let item of this.stateOutletData) { if (item.StateID == sId) this.outletByStateData = item.OutletList; }
  }

  /**
   *  Method: Get available date of appt
   */
  public apptDateList: Array<any> = [];
  public getApptDates(oData: any) {
    let arr = oData.split('|');
    this.setOutlet(arr[0], arr[1]); 
    this.apiApptService.apiGetApptDates({ objRequest: { OutletID: arr[0], DaysInAdvanced: "7" } }, this.g.getCustToken).subscribe( rsp => {
      rsp.d.RespCode == "200" ? this.apptDateList = rsp.d.RespData : this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Set outlet
   */
  private setOutlet(oId: any, oDesc: any) {
    this.setApptDate("", "");
    this.selectedOutletID = oId;
    this.selectedOutletDesc = oDesc;
  }

  /**
   *  Method: Set appt date
   */
  public  selectedDate_Data: any = "";
  public  selectedDate_Disp: any = "";
  private setApptDate(dData: any, dDisp: any) {
    this.setApptTime("", "");
    this.selectedDate_Data = dData;
    this.selectedDate_Disp = dDisp;
  }

  /**
   *  Method: Set appt time
   */
  public selectedTime_Data: any = "";
  public selectedTime_Disp: any = "";
  public setApptTime(tData: any, tDisp: any) {
    this.content?.scrollToBottom(500);
    this.setApptServiceType("");
    this.selectedTime_Data = tData;
    this.selectedTime_Disp = tDisp;
  }

  /**
   *  Method: Set appt service type
   */
  public selectedServiceType_Data: any = "";
  public selectedServiceType_Disp: any = "";
  public setApptServiceType(sType: any) {
    this.content?.scrollToBottom(500);
    this.selectedServiceType_Data = sType;
    if (sType != "") {
      if      (sType == '0') this.selectedServiceType_Disp = this.translate.instant('REDEMPTION');
      else if (sType == '1') this.selectedServiceType_Disp = this.translate.instant('PAWN');
      else                   this.selectedServiceType_Disp = this.translate.instant('PAYMENT');
    }
    else this.selectedServiceType_Disp = "";
  }

  public enableSelectApptDate()     { return this.selectedOutletID ? true : false; }
  public enableSelectApptTime()     { return this.selectedOutletID && this.selectedDate_Data ? true : false; }
  public enableSelectServiceType()  { return this.selectedOutletID && this.selectedDate_Data && this.selectedTime_Data ? true : false; }
  public enableConfirmation()       { return this.selectedOutletID && this.selectedDate_Data && this.selectedTime_Data && this.selectedServiceType_Data ? true : false; }

  /**
   *  Method: Create appt
   */
  private selectedAgencyID: any = "39";
  public createAppt() {
    let request = {
      objRequest: { 
        Mode    : "CREATE",
        ApptData: {
          AgencyID: this.selectedAgencyID, 
          OutletID: this.selectedOutletID,
          ApptDate: this.selectedDate_Data, 
          ApptTime: this.selectedTime_Data, 
          Service : this.selectedServiceType_Data,
        }
      }
    };
    this.apiApptService.apiCRUD(request, this.g.getCustToken).subscribe(rsp => { rsp.d.RespCode == "200" ? this.g.redirectBack('') : this.g.apiRespError(rsp.d); });
  }
}