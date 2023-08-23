import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector    : 'app-check-in',
  templateUrl : './check-in.component.html',
  styleUrls   : ['./check-in.component.scss']
})
export class CheckInComponent {

  constructor(
    private routeParam: ActivatedRoute,
    private apiUtilityService: ApiUtilityService,
    public  g: GeneralService,
    private ngbModal: NgbModal,
    public  router: Router,
  ) {}
  
  ngOnInit() {
    this.validateToken();
  }

  ngOnDestroy() {
    if (typeof this.modalWalkInServiceTypeRef !== 'undefined')  this.modalWalkInServiceTypeRef.close();
    if (typeof this.modalErrorMsgRef          !== 'undefined')  this.modalErrorMsgRef.close();
    localStorage.removeItem('eqmsCustomer_apptData');
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
        this.validateIsAppt();
      else {
        rsp.d.RespCode = '401';
        this.g.apiRespError(rsp.d);
      }
    });
  }

  /**
   *  Method: 
   */
  private isAppt: Boolean = false;
  private validateIsAppt() {
    this.routeParam.queryParamMap.subscribe( paramMap => {
      if      (paramMap.get('t') == '0' && localStorage['eqmsCustomer_apptData'] === '""' && localStorage['eqmsCustomer_apptData'] !== undefined) {}
      else if (paramMap.get('t') == '1' && localStorage['eqmsCustomer_apptData'] !== '""' && localStorage['eqmsCustomer_apptData'] !== undefined) {
        JSON.parse(localStorage['eqmsCustomer_apptData']).forEach( (e: any) => {
          if ((new Date(e.ApptDate)).getTime() === this.g.getCurrentDateOnly().getTime()) this.isAppt = true;
        });
      }
      else this.router.navigate(['']);
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
      console.log(resultString);
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
      console.log(this.selectedWalkInServiceType);
      console.log(this.qrValue);
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

  /**
   * Method: Reload camera/scanner
   */
  public reloadCamera() { window.location.reload(); }
}