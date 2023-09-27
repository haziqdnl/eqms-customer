import { Component } from '@angular/core';
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
    private g: GeneralService,
  ) {} 
  
  ionViewWillEnter() { this.validateToken(); }

  /**
   *  Method: Validate customer/token
   */
  private validateToken() {
    let request = { objRequest: { Token: this.g.getCustToken() } };
    this.apiUtilityService.apiDecodeJWTToken(request).subscribe( rsp => {
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
  private selectedAgencyID: any = "39";
  public  isAppt: Boolean = false;
  private getApptInfo() {
    this.apiApptService.apiGetAppt(this.g.getCustToken()).subscribe( rsp => {
      this.isAppt = false;
      if (rsp.d.RespCode == "200") {
        this.g.setCustToken(rsp.d.ExtendedToken);
        this.isAppt = rsp.d.RespData !== '' && rsp.d.RespData !== undefined;
      }
      else this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Get walk-in data
   */
  public  isWalkIn: Boolean = false;
  private getWalkInInfo() {
    this.apiWalkInService.apiGetWalkinByProfile(this.g.getCustToken()).subscribe( rsp => {
      this.isWalkIn = false;
      if (rsp.d.RespCode == "200") {
        this.g.setCustToken(rsp.d.ExtendedToken);
        this.isWalkIn = rsp.d.RespData !== '' && rsp.d.RespData !== undefined;
      }
      else this.g.apiRespError(rsp.d);
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
  public apptTimeList: Array<any> = [];
  public getApptTime(dData:any, dDisp:any) {
    this.setApptDate(dData, dDisp)
    let request = { objRequest: {  OutletID: this.selectedOutletID, ApptDate: dData } }
    this.apiApptService.apiGetApptTime(request, this.g.getCustToken()).subscribe( rsp => {
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
    let request = { objRequest: {  OutletID: arr[0], DaysInAdvanced: "7" } };
    this.apiApptService.apiGetApptDates(request, this.g.getCustToken()).subscribe( rsp => {
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
    this.selectedServiceType_Data = sType;
    this.selectedServiceType_Disp = sType != "" ? sType == '0' ? 'Redemption' : 'Pawn' : "";
  }

  public enableSelectApptDate()     { return this.selectedOutletID ? true : false; }
  public enableSelectApptTime()     { return this.selectedOutletID && this.selectedDate_Data ? true : false; }
  public enableSelectServiceType()  { return this.selectedOutletID && this.selectedDate_Data && this.selectedTime_Data ? true : false; }
  public enableConfirmation()       { return this.selectedOutletID && this.selectedDate_Data && this.selectedTime_Data && this.selectedServiceType_Data ? true : false; }

  /**
   *  Method: Create appt
   */
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
    this.apiApptService.apiCRUD(request, this.g.getCustToken()).subscribe( rsp => {
      rsp.d.RespCode == "200" ? this.g.redirectBack('') : this.g.apiRespError(rsp.d);
    });
  }
}