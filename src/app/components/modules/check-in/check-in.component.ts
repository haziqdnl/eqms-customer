import { Component } from '@angular/core';
import { BarcodeFormat, BarcodeScanner, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';
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
    private alertController: AlertController,
    private apiUtilityService: ApiUtilityService,
    private checkInService: CheckInService,
    public  g: GeneralService,
    private translate: TranslateService
  ) {}
  
  public loaded = false;
  ionViewWillEnter() {
    this.g.showLoading(1000);
    setTimeout( () => { this.loaded = true }, 1000);
    this.validateToken();
  }
  ionViewWillLeave()  {
    this.loaded = false;
    this.modalIsOpen = false;
    if (this.scannerData.enableScanner) this.stopScan();
    if (this.alertErrorScan)            this.alertErrorScan.dismiss();
  }

  /**
   *  Method: Modal
   */
  public modalMode: any = "";
  public modalTitle: any = "";
  public modalIsOpen: boolean = false;
  public openModal(open: boolean, mode: string) {
    this.modalIsOpen = open;
    this.modalMode = mode;
    if (open)
      this.modalTitle = mode == "0" ? "Walk-In" : this.translate.instant('UNDEFINED');
    else {
      this.modalTitle = "";
      this.startScan();
    }
  }
  
  /**
   *  Method: Alert check-in success
   */
  private alertErrorScan: any;
  public  async openAlertErrorScan(msg: any) {
    this.alertErrorScan = await this.alertController.create({
      message: `<h4 class="m-0 fw-bold text-danger">${this.translate.instant('ERROR')}</h4><p class="m-0 mt-2">${msg}</p>`,
      buttons: [{ text: 'OK', role: 'confirm' }],
    });
    await this.alertErrorScan.present();
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
      setTimeout(() => { this.startScan(); }, 250);
    }
    else this.g.redirectTo('', '');
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
  private qrValue: string = "";
  public  onScanSuccess(resultString: string) {
    if (resultString !== undefined) {
      this.qrValue = resultString;
      this.stopScan();
      this.apiUtilityService.apiCheckInByQRCode({
        objRequest  : { 
          Service   : this.scannerData.isAppt ? '1' : null,
          QRCodeData: resultString 
        }
      }, this.g.getCustToken).subscribe( rsp => {
        localStorage['eqmsCustomer_scanResult'] = JSON.stringify(rsp.d);
        if      (rsp.d.RespCode == "200")   this.g.redirectTo('', '');
        else if (rsp.d.RespCode == "444")   this.openModal(true, '0');
        else {
          if      (rsp.d.RespCode == "400") this.openAlertErrorScan(this.translate.instant('SCRN_CHECKIN.ERROR.QR_INVALID'));
          else if (rsp.d.RespCode == "401") this.openAlertErrorScan(this.translate.instant('SCRN_CHECKIN.ERROR.QR_EXPIRED'));
          else                              this.openAlertErrorScan(this.translate.instant('SCRN_CHECKIN.ERROR.UNRECOGNIZED'));
          this.startScan();
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
    this.apiUtilityService.apiCheckInByQRCode({
      objRequest  : { 
        Service   : this.selectedWalkInServiceType,
        QRCodeData: this.qrValue
      }
    }, this.g.getCustToken).subscribe( rsp => {
      if (rsp.d.RespCode != "200")
        this.openAlertErrorScan(rsp.d.RespMessage);
      else {
        localStorage['eqmsCustomer_scanResult'] = JSON.stringify(rsp.d);
        this.g.redirectTo('', '');
      }
    });
  }
}