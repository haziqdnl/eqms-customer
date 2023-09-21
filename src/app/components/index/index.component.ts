import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, HostListener, ViewChild } from '@angular/core';
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
    if (typeof this.modalCancelApptRef      !== 'undefined')  this.modalCancelApptRef.close();
    if (typeof this.modalCheckInSuccessRef  !== 'undefined')  this.modalCheckInSuccessRef.close();
    
    if (this.intervalGetApptInfo)   this.intervalGetApptInfo.unsubscribe();
    if (this.intervalGetWalkInInfo) this.intervalGetWalkInInfo.unsubscribe();
  }

  /**
   *  Method: Modal
   */
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
    this.apiApptService.apiCRUD(request, this.g.getCustToken()).subscribe( rsp => {
      rsp.d.RespCode == "200" ? this.getApptInfo() : this.g.apiRespError(rsp.d);
    });
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