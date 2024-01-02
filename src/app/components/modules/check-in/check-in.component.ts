import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { BarcodeFormat, BarcodeScanner, LensFacing, StartScanOptions } from '@capacitor-mlkit/barcode-scanning';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { interval } from 'rxjs';
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
    private apiApptService: ApiApptService,
    private apiUtilityService: ApiUtilityService,
    private apiWalkInService: ApiWalkinService,
    public  g: GeneralService,
    private ngbModal: NgbModal,
    private readonly ngZone: NgZone,
  ) {}
  
  public loaded = false;
  ionViewWillEnter() {
    //  Loader
    this.g.showLoading(1000);
    setTimeout( () => { this.loaded = true }, 1000);
    this.isScannerSupportandPermission();
    this.validateToken();
  }
  ionViewWillLeave()  {
    this.loaded = false
    if (this.intervalGetApptWalkIn)                             this.intervalGetApptWalkIn.unsubscribe();
    if (typeof this.modalWalkInServiceTypeRef !== 'undefined')  this.modalWalkInServiceTypeRef.close();
    if (typeof this.modalErrorMsgRef          !== 'undefined')  this.modalErrorMsgRef.close();
    if (this.isSupported)                                       this.stopScan();
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

  /** ========================================================================================== */

  /**
   *  Method: Check device is supported and has granted permission to use the scanner
   */
  public isSupported = false;
  public isPermissionGranted = false;
  public isScannerSupportandPermission() {
    //  Check if device is supported
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
      if (this.isSupported) {
        //  Check permission access to camera
        BarcodeScanner.checkPermissions().then((result) => { this.isPermissionGranted = result.camera === 'granted'; });
        setTimeout( () => { this.startScan(); }, 250);
      }
    }).catch((err: any) => {});
  }
  /**
   *  Method: Will prompt automatically if current device has not grant permission to access camera
   */
  public async requestPermissions(): Promise<void> { await BarcodeScanner.requestPermissions(); }
  /**
   *  Method: Close and stop scanner
   */
  private async stopScan(): Promise<void> { await BarcodeScanner.stopScan(); console.log(BarcodeScanner); }
  /**
   *  Method: Open and start scanner
   */
  public formats: BarcodeFormat[] = []
  public readonly lensFacing: LensFacing = LensFacing.Back;
  @ViewChild('square') public squareElement: ElementRef<HTMLDivElement> | undefined;
  private async startScan(): Promise<void> {
    const squareElementBoundingClientRect = this.squareElement?.nativeElement.getBoundingClientRect();
    const scaledRect = squareElementBoundingClientRect ? {
      left  : squareElementBoundingClientRect.left   * window.devicePixelRatio,
      right : squareElementBoundingClientRect.right  * window.devicePixelRatio,
      top   : squareElementBoundingClientRect.top    * window.devicePixelRatio,
      bottom: squareElementBoundingClientRect.bottom * window.devicePixelRatio,
      width : squareElementBoundingClientRect.width  * window.devicePixelRatio,
      height: squareElementBoundingClientRect.height * window.devicePixelRatio,
    } : undefined;
    const detectionCornerPoints = scaledRect ? [
      [scaledRect.left                   , scaledRect.top],
      [scaledRect.left + scaledRect.width, scaledRect.top],
      [scaledRect.left + scaledRect.width, scaledRect.top + scaledRect.height,],
      [scaledRect.left                   , scaledRect.top + scaledRect.height],
    ] : undefined;

    //  Get the result of the scan
    const listener = await BarcodeScanner.addListener('barcodeScanned', async (event) => {
      this.ngZone.run(() => {
          const cornerPoints = event.barcode.cornerPoints;
          if (detectionCornerPoints && cornerPoints) {
            if (
              detectionCornerPoints[0][0] > cornerPoints[0][0] ||
              detectionCornerPoints[0][1] > cornerPoints[0][1] ||
              detectionCornerPoints[1][0] < cornerPoints[1][0] ||
              detectionCornerPoints[1][1] > cornerPoints[1][1] ||
              detectionCornerPoints[2][0] < cornerPoints[2][0] ||
              detectionCornerPoints[2][1] < cornerPoints[2][1] ||
              detectionCornerPoints[3][0] > cornerPoints[3][0] ||
              detectionCornerPoints[3][1] < cornerPoints[3][1]
            ) {
              alert(event.barcode);
              return; 
            }
          }
          listener.remove();
        });
      },
    );
    await BarcodeScanner.startScan({formats: this.formats, lensFacing: this.lensFacing});
  }

  /** ========================================================================================== */

  /**
   *  Method: Validate customer token
   */
  private intervalGetApptWalkIn: any;
  private validateToken() {
    let request = { objRequest: { Token: this.g.getCustToken() } };
    this.apiUtilityService.apiDecodeJWTToken(request).subscribe( rsp => {
      if (rsp.d.RespCode == "200")
        this.intervalGetApptWalkIn = interval(1000).subscribe( () => { this.getApptInfo(); });
      else {
        rsp.d.RespCode = '401';
        this.g.apiRespError(rsp.d);
      }
    });
  }

  /**
   *  Method: Get appt data
   */
  public  enableCheckIn: Boolean = false;
  public  msgErrCheckIn: string = "";
  public  isAppt: Boolean = false;
  private getApptInfo() {
    this.apiApptService.apiGetAppt(this.g.getCustToken()).subscribe( rsp => {
      this.isAppt = false;
      if (rsp.d.RespCode == "200") {
        this.g.setCustToken(rsp.d.ExtendedToken)
        if (rsp.d.RespData != '' && rsp.d.RespData != undefined) {
          if (rsp.d.RespData[0].AppStat != "COMPLETE" || rsp.d.RespData[0].AppStat != "NOSHOW") {
            this.isAppt = true;
            if ((new Date(rsp.d.RespData[0].ApptDate)).getTime() === this.g.getCurrentDateOnly().getTime())
              this.enableCheckIn = true;
            else {
              this.enableCheckIn = false;
              this.msgErrCheckIn = "You're only allowed to check-in on the booked date and time.";
            }
          }
          else this.getWalkInInfo();
        }
        else this.getWalkInInfo();
      }
      else this.g.apiRespError(rsp.d);
    });
  }

  /**
   *  Method: Get walk-in data
   */
  private getWalkInInfo() {
    this.apiWalkInService.apiGetWalkinByProfile(this.g.getCustToken()).subscribe( rsp => {
      if (rsp.d.RespCode == "200") {
        this.enableCheckIn = true;
        this.msgErrCheckIn = "";
        this.g.setCustToken(rsp.d.ExtendedToken);
        if (rsp.d.RespData != "" && rsp.d.RespData != undefined) {
          if (rsp.d.RespData[0].WalkInStat != "COMPLETE" && rsp.d.RespData[0].WalkInStat != "NOSHOW") {
            this.enableCheckIn = false;
            this.msgErrCheckIn = "You already checked in.";
          }
        }
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
  public  async onScanSuccess(resultString: string) {
    if (resultString !== undefined && !this.qrValue) {
      this.qrValue = resultString;
      let request = {
        objRequest  : { 
          Service   : this.isAppt ? '1' : null,
          QRCodeData: resultString 
        }
      };
      this.apiUtilityService.apiCheckInByQRCode(request, this.g.getCustToken()).subscribe( rsp => {
        this.errMsgTitle = '';
        localStorage['eqmsCustomer_scanResult'] = JSON.stringify(rsp.d);
        if      (rsp.d.RespCode == "200") this.g.redirectBack('');
        else if (rsp.d.RespCode == "444") this.openModalWalkInServiceType();
        else {
          if      (rsp.d.RespCode == "400") this.errMsgTitle = 'QR code invalid';
          else if (rsp.d.RespCode == "401") this.errMsgTitle = 'QR code expired';
          else                              this.errMsgTitle = 'Scanning failed due to unrecognized error';
          this.openModalErrorMsg();
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
    };
    this.apiUtilityService.apiCheckInByQRCode(request, this.g.getCustToken()).subscribe( rsp => {
      if (rsp.d.RespCode != "200") {
        this.errMsgTitle = 'Check-in failed! Please try again.'
        this.openModalErrorMsg();
      }
      localStorage['eqmsCustomer_scanResult'] = JSON.stringify(rsp.d);
      this.g.redirectBack('');
    });
  }

  /**
   *  Method: Set Walk-In service type
   */
  public selectedWalkInServiceType: any = '';
  public setApptServiceType(sType: any) { this.selectedWalkInServiceType = sType; }
}