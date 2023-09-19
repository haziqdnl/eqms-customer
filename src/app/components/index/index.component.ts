import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { interval } from 'rxjs';
import { ApiApptService } from 'src/app/api/api-appt.service';
import { ApiNewsfeedService } from 'src/app/api/api-newsfeed.service';
import { ApiOutletService } from 'src/app/api/api-outlet.service';
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
    private apiApptService: ApiApptService,
    private apiNewsfeedService: ApiNewsfeedService,
    private apiOutletService: ApiOutletService,
    private apiProfileService: ApiProfileService,
    private apiUtilityService: ApiUtilityService,
    private apiWalkInService: ApiWalkinService,
    private datePipe: DatePipe,
    private g: GeneralService,
    private ngbModal: NgbModal,
    public  router: Router,
    private titleCasePipe: TitleCasePipe,
  ) {}
  
  ngOnInit() {
    this.getLastActive();
    this.validateToken();
    this.getUrlParam();
  }

  ngOnDestroy() {
    if (typeof this.modalConfirmWalkInRef   !== 'undefined')  this.modalConfirmWalkInRef.close();
    if (typeof this.modalApptRef            !== 'undefined')  this.modalApptRef.close();
    if (typeof this.modalCancelApptRef      !== 'undefined')  this.modalCancelApptRef.close();
    if (typeof this.modalCheckInSuccessRef  !== 'undefined')  this.modalCheckInSuccessRef.close();
    
    if (this.intervalGetApptInfo)   this.intervalGetApptInfo.unsubscribe();
    if (this.intervalGetWalkInInfo) this.intervalGetWalkInInfo.unsubscribe();
  }

  /**
   *  Method: Modal
   */
  private modalConfirmWalkInRef: any;
  @ViewChild('modalConfirmWalkIn') private modalConfirmWalkIn: any;
  public  openModalConfirmWalkIn() { this.modalConfirmWalkInRef = this.ngbModal.open(this.modalConfirmWalkIn, { centered: true }); }
  /**/
  private modalApptRef: any;
  @ViewChild('modalAppt') private modalAppt: any;
  public openModalAppt() {
    this.getStateList();
    this.modalApptRef = this.ngbModal.open(this.modalAppt, { centered: true, scrollable: true, size: 'xl', backdrop : 'static', keyboard : false });
  }
  /**/
  private modalCancelApptRef: any;
  @ViewChild('modalCancelAppt') private modalCancelAppt: any;
  public  openModalCancelAppt() { this.modalCancelApptRef = this.ngbModal.open(this.modalCancelAppt, { centered: true }); }
  /**/
  private modalCheckInSuccessRef: any;
  @ViewChild('modalCheckInSuccess') private modalCheckInSuccess: any;
  public  openModalCheckInSuccess() { this.modalCheckInSuccessRef = this.ngbModal.open(this.modalCheckInSuccess, { centered: true }); }

  /**
   *  Method: Last Active
   */
  public  lastActive: any = "";
  private getLastActive() { this.lastActive = this.datePipe.transform(new Date(), 'EEEE, dd MMMM yyyy, hh:mm a'); }

  /**
   *  Method: get URL param
   */
  private getUrlParam() {
    this.routeParam.queryParamMap.subscribe( paramMap => {
      if (paramMap.get('scan') == '1')
        setTimeout( () => { this.openModalCheckInSuccess(); }, 1000);
      else if (paramMap.get('scan') == '0')
        this.g.apiRespError(JSON.parse(localStorage['eqmsCustomer_errScan']));
    });
  }

  /**
   *  Method: Validate customer/token
   */
  private validateToken() {
    console.log(this.g.getCustToken());
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
  private getProfileInfo(pid: any) {
    let request = { objRequest: { GetAllFlag: "false", ProfileID: pid } };
    this.apiProfileService.apiGetProfileInfo(request, this.g.getCustToken()).subscribe( rsp => {
      if (rsp.d.RespCode == "200")
        this.username = this.titleCasePipe.transform(rsp.d.RespData[0].Name);
      else 
        this.g.apiRespError(rsp.d);
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
  public  enableCheckIn: Boolean = false;
  public  isAppt: Boolean = false;
  private intervalGetApptInfo: any;
  private getApptInfo() {
    this.intervalGetApptInfo = interval(1000).subscribe( () => {
      this.apiApptService.apiGetAppt(this.g.getCustToken()).subscribe( rsp => {
        this.apptData = [];
        this.isAppt = false;
        if (rsp.d.RespCode == "200") {
          this.g.setCustToken(rsp.d.ExtendedToken)
          this.apptData = rsp.d.RespData;
          if (this.apptData !== '' && this.apptData !== undefined) {
            this.isAppt = this.apptData[0].ApptStat !== "COMPLETE" && this.apptData[0].ApptStat !== "NOSHOW" ? true : false;
            if ((new Date(this.apptData[0].ApptDate)).getTime() === this.g.getCurrentDateOnly().getTime())  this.enableCheckIn = true;
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
  public  isWalkIn: Boolean = false;
  private intervalGetWalkInInfo: any;
  private getWalkInInfo() {
    this.intervalGetWalkInInfo = interval(1000).subscribe( () => {
      this.apiWalkInService.apiGetWalkinByProfile(this.g.getCustToken()).subscribe( rsp => {
        this.walkInData = [];
        this.isWalkIn = false;
        if (rsp.d.RespCode == "200") {
          this.g.setCustToken(rsp.d.ExtendedToken)
          this.walkInData = rsp.d.RespData;
          if (this.walkInData !== '' && this.walkInData !== undefined)
            this.isWalkIn = (this.walkInData[0].WalkInStat !== "COMPLETE" && this.walkInData[0].WalkInStat !== "NOSHOW") ? true : false;
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
   *  Method: Get list of outlet based on the state
   */
  public selectedOutletID: any = "";
  public selectedOutletDesc: any = "";
  public outletByStateData: Array<any> = [];
  public getOutletList(sId: any) {
    this.setOutlet("", "");
    this.selectedStateID = sId;
    if (sId) {
      for (let item of this.stateOutletData) { if (item.StateID == sId) this.outletByStateData = item.OutletList; }
    }
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
    this.apptCRUD(request);
  }

  /**
   *  Method: Delete appt
   */
  public deleteAppt(){
    let request = {
      objRequest: { 
        Mode    : "DELETE",
        ApptData: {
          AgencyID: this.selectedAgencyID, 
          OutletID: this.apptData[0].OutletID, 
          ApptID  : this.apptData[0].ApptID,
        }
      }
    }
    this.apptCRUD(request);
  }

  /**
   *  Method: Appt CRUD API
   */
  private apptCRUD(r: any) {
    this.apiApptService.apiCRUD(r, this.g.getCustToken()).subscribe( rsp => {
      rsp.d.RespCode == "200" ? this.getApptInfo() : this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Appt check-in
   */
  public checkIn(t: any) {
    localStorage['eqmsCustomer_apptData'] = JSON.stringify(this.apptData);
    this.router.navigate(['checkin'], { queryParams: { t: t } });  // t: 0 = Walk-in, 1 = Appt
  }

  /**
   *  Method: Scroll to top
   */
  public  isShow: boolean = false;
  private topPosToStartShowing = 100;
  @HostListener('window:scroll') public checkScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isShow = scrollPosition >= this.topPosToStartShowing ? true : false;
  }
  public scrolltoTop() { window.scroll({ top: 0, left: 0, behavior: 'smooth' }); }
}