import { Component } from '@angular/core';
import { BarcodeFormat, BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { TranslateService } from '@ngx-translate/core';
import { ApiUtilityService } from 'src/app/api/api-utility.service';
import { CheckInService } from 'src/app/services/check-in/check-in.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector    : 'app-check-in',
  templateUrl : './check-in.component.html',
  styleUrls   : ['./check-in.component.scss']
})
export class CheckInComponent {

  constructor(
    private apiUtilityService: ApiUtilityService,
    private checkInService: CheckInService,
    public  g: GeneralService,
    private translate: TranslateService
  ) {}
  
  public loaded = false;
  ionViewWillEnter() {
    //  Loader
    this.g.showLoading(1000);
    setTimeout( () => { this.loaded = true }, 1000);
    this.validateToken();
  }
  ionViewWillLeave()  {
    this.loaded = false;
    this.modalIsOpen = false;
    if (this.scannerData.enableScanner) this.stopScan();
  }

  /**
   *  Method: Modal
   */
  public modalMode: any = "";
  public modalTitle: any = "";
  public modalIsOpen: boolean = false;
  public openModal(open: boolean, mode: string) {
    this.modalIsOpen = open;
    if (open && mode) {
      this.modalMode = mode;
      if      (mode == "walkInServiceType") this.modalTitle = "Walk-In";
      else if (mode == "errorMsg")          this.modalTitle = this.translate.instant('ERROR');
      else                                  this.modalTitle = this.translate.instant('UNDEFINED');
      this.stopScan();
    }
    else {
      this.modalTitle = "";
      this.startScan();
    }
  }

  /**
   *  Method: Validate customer token
   */
  private validateToken() {
    this.apiUtilityService.apiDecodeJWTToken({ objRequest: { Token: this.g.getCustToken } }).subscribe( async rsp => {
      if (rsp.d.RespCode == "200")
        await this.isScannerEnabled();
      else {
        rsp.d.RespCode = '401';
        this.g.apiRespError(rsp.d);
      }
    });
  }

  /**
   *  Method: Check the scanner enablement status
   */
  private scannerData: any = {
    enableScanner     : false,
    isAppt            : false,
    isSupported       : false,
    msgDisabledScanner: "",
  };
  private async isScannerEnabled() {
    this.scannerData = await this.checkInService.isCheckInEnabled();
    if (this.scannerData.isSupported && this.scannerData.enableScanner) {
      BarcodeScanner.checkPermissions().then((result) => { this.translate.instant('SCANNER_STATUS.GRANTED.' + (result.camera === 'granted' ? 'YES' : 'NO')) });
      setTimeout( () => { this.startScan(); }, 250)
    }
    else this.g.redirectTo('');
  }

  /**
   *  Method: Request permission to use the scanner
   */
  public async requestPermissions(): Promise<void> { await BarcodeScanner.requestPermissions(); }

  /**
   *  Method: Open and start scanner
   */
  public formats: BarcodeFormat[] = []
  public readonly lensFacing: LensFacing = LensFacing.Back;
  public async startScan(): Promise<void> {
    this.g.toastInfo(this.translate.instant('SCANNER_STATUS.TURNED_ON'));
    await BarcodeScanner.addListener('barcodeScanned', async result => { this.onScanSuccess(result.barcode.rawValue.toString()); });
    await BarcodeScanner.startScan({formats: this.formats, lensFacing: this.lensFacing});
  }
  /**
   *  Method: Close and stop scanner
   */
  public async stopScan(): Promise<void> {
    this.g.toastInfo(this.translate.instant('SCANNER_STATUS.TURNED_OFF'));
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
  }

  /**
   *  Method: QR Scanner
   *  - get value from QR
   */
  public  errMsgTitle: any = "";
  private qrValue: string = "";
  public  onScanSuccess(resultString: string) {
    if (resultString !== undefined && !this.qrValue) {
      this.qrValue = resultString;
      let request = {
        objRequest  : { 
          Service   : this.scannerData.isAppt ? '1' : null,
          QRCodeData: resultString 
        }
      };
      this.apiUtilityService.apiCheckInByQRCode(request, this.g.getCustToken).subscribe( rsp => {
        this.errMsgTitle = "";
        localStorage['eqmsCustomer_scanResult'] = JSON.stringify(rsp.d);
        if      (rsp.d.RespCode == "200") this.g.redirectTo('');
        else if (rsp.d.RespCode == "444") this.openModal(true, "walkInServiceType");
        else {
          if      (rsp.d.RespCode == "400") this.errMsgTitle = this.translate.instant('SCRN_CHECKIN.ERROR.QR_INVALID');
          else if (rsp.d.RespCode == "401") this.errMsgTitle = this.translate.instant('SCRN_CHECKIN.ERROR.QR_EXPIRED');
          else                              this.errMsgTitle = this.translate.instant('SCRN_CHECKIN.ERROR.UNRECOGNIZED');
          this.openModal(true, "errorMsg");
        }
      });
    }
    else this.qrValue = "";
  }

  /**
   *  Method: Set Walk-In service type
   */
  public selectedWalkInServiceType: string = '';
  public walkIn() {
    let request = {
      objRequest: { 
        Service   : this.selectedWalkInServiceType,
        QRCodeData: this.qrValue
      }
    };
    this.apiUtilityService.apiCheckInByQRCode(request, this.g.getCustToken).subscribe( rsp => {
      if (rsp.d.RespCode != "200") {
        this.errMsgTitle = rsp.d.RespMessage;
        this.openModal(true, "errorMsg");
      }
      else {
        localStorage['eqmsCustomer_scanResult'] = JSON.stringify(rsp.d);
        this.g.redirectTo('');
      }
    });
  }
}