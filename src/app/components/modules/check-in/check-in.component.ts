import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiApptService } from 'src/app/api/api-appt.service';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { ApiWalkinService } from 'src/app/api/api-walkin.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector    : 'app-check-in',
  templateUrl : './check-in.component.html',
  styleUrls   : ['./check-in.component.scss']
})
export class CheckInComponent {

  constructor(
    private routeParam: ActivatedRoute,
    private apiApptService: ApiApptService,
    private apiUtilityService: ApiUtilityService,
    private apiWalkInService: ApiWalkinService,
    public  g: GeneralService,
    private ngbModal: NgbModal,
    public  router: Router,
  ) {}
  
  ngOnInit() { this.validateToken(); }

  ngOnDestroy() {
    if (typeof this.modalWalkInServiceTypeRef !== 'undefined')  this.modalWalkInServiceTypeRef.close();
    if (typeof this.modalErrorMsgRef          !== 'undefined')  this.modalErrorMsgRef.close();
  }

  /**
   *  Method: Modal
   */
  private modalWalkInServiceTypeRef: any;
  @ViewChild('modalWalkInServiceType') private modalWalkInServiceType: any;
  public openModalWalkInServiceType() { this.modalWalkInServiceTypeRef = this.ngbModal.open(this.modalWalkInServiceType, { centered: true, keyboard: false, backdrop: 'static' }); }
  /**/
  private modalErrorMsgRef: any;
  @ViewChild('modalErrorMsg') private modalErrorMsg: any;
  public openModalErrorMsg() { this.modalErrorMsgRef = this.ngbModal.open(this.modalErrorMsg, { centered: true, keyboard: false, backdrop: 'static' }); }

  /**
   *  Method: Validate customer token
   */
  private validateToken() {
    let request = { objRequest: { Token: this.g.getCustToken() } };
    this.apiUtilityService.apiDecodeJWTToken(request).subscribe( rsp => {
      if (rsp.d.RespCode == "200")
        this.getWalkInInfo()
      else {
        rsp.d.RespCode = '401';
        this.g.apiRespError(rsp.d);
      }
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
        this.g.setCustToken(rsp.d.ExtendedToken)
        if (rsp.d.RespData !== '' && rsp.d.RespData !== undefined) {
          this.enableCheckIn = false;
          this.msgErrCheckIn = "You already checked in.";
        }
        else this.getApptInfo();
      }
      else this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Get appt data
   */
  public  isAppt: Boolean = false;
  public  enableCheckIn: Boolean = false;
  public  msgErrCheckIn: string = "";
  private getApptInfo() {
    this.apiApptService.apiGetAppt(this.g.getCustToken()).subscribe( rsp => {
      this.isAppt = false;
      if (rsp.d.RespCode == "200") {
        this.g.setCustToken(rsp.d.ExtendedToken)
        if (rsp.d.RespData !== '' && rsp.d.RespData !== undefined) {
          this.isAppt = true;
          if ((new Date(rsp.d.RespData[0].ApptDate)).getTime() === this.g.getCurrentDateOnly().getTime())
            this.enableCheckIn = true;
          else {
            this.enableCheckIn = false;
            this.msgErrCheckIn = "You're only allowed to check-in on the booked date and time.";
          }
        }
        else this.enableCheckIn = true;
      }
      else this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: QR Scanner
   *  - get value from QR
   */
  public  errMsgTitle: any = '';
  private qrValue: string = "";
  public  onCodeResult(resultString: string) {
    if (resultString !== undefined && !this.qrValue) {
      this.qrValue = resultString;
      let request = {
        objRequest  : { 
          Service   : this.isAppt ? '1' : null,
          QRCodeData: resultString 
        }
      }
      this.apiUtilityService.apiCheckInByQRCode(request, this.g.getCustToken()).subscribe( rsp => {
        this.errMsgTitle = '';
        if (rsp.d.RespCode == "200") 
          this.router.navigate([''], { queryParams: { scan: '1' } });
        else if (rsp.d.RespCode == "400") {
          this.errMsgTitle = rsp.d.RespMessage;
          this.openModalErrorMsg();
        }
        else if (rsp.d.RespCode == "444") this.openModalWalkInServiceType();
        else {
          localStorage['eqmsCustomer_errScan'] = JSON.stringify(rsp.d);
          this.router.navigate([''], { queryParams: { scan: '0' } });
        }
      });
    }
    else this.qrValue = "";
  }

  /**
   *  Method: Set Walk-In service type
   */
  public walkIn() {
    let request = {
      objRequest: { 
        Service   : this.selectedWalkInServiceType,
        QRCodeData: this.qrValue
      }
    }
    this.apiUtilityService.apiCheckInByQRCode(request, this.g.getCustToken()).subscribe( rsp => {
      if (rsp.d.RespCode == "200")
        this.router.navigate([''], { queryParams: { scan: '1' } });
      else {
        rsp.d.RespMessage = rsp.d.RespMessage.includes('Bad Request') ? 'Check-in failed! Please try again.' : '';
        localStorage['eqmsCustomer_errScan'] = JSON.stringify(rsp.d);
        this.router.navigate([''], { queryParams: { scan: '0' } });
      }
    });
  }

  /**
   *  Method: Set Walk-In service type
   */
  public selectedWalkInServiceType: any = '';
  public setApptServiceType(sType: any) { this.selectedWalkInServiceType = sType; }
}