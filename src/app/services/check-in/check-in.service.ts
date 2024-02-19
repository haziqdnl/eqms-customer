import { Injectable } from '@angular/core';
import { ApiApptService } from 'src/app/api/api-appt.service';
import { GeneralService } from '../general/general.service';
import { ApiWalkinService } from 'src/app/api/api-walkin.service';
import { lastValueFrom } from 'rxjs';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class CheckInService {

  /**
   *  Data Model: Check-In
   */
  private checkInData = {
    enableScanner     : false,
    isAppt            : false,
    isSupported       : false,
    msgDisabledScanner: "",
  };

  constructor(
    private apiApptService: ApiApptService,
    private apiWalkInService: ApiWalkinService,
    private g: GeneralService,
    private translate: TranslateService
  ) { }

  /**
   *  Method: Main method to enable/disable the check-in scanner
   */
  public async isCheckInEnabled() {
    this.checkInData = {
      enableScanner     : false,
      isAppt            : false,
      isSupported       : false,
      msgDisabledScanner: "",
    }
    await this.isScannerSupported();
    if (this.checkInData.isSupported) await this.isApptBooked()
    return                            this.checkInData;
  }

  /**
   *  Method: Check if the current device platform is supported to use the scanner
   */
  private async isScannerSupported() {
    await BarcodeScanner.isSupported().then((result) => { this.checkInData.isSupported = true; })
      .catch((err: any) => {
        this.checkInData.isSupported        = false;
        this.checkInData.msgDisabledScanner = this.translate.instant('SCANNER_STATUS.UNSUPPORTED');
      });
  }

  /**
   *  Method: Check if already book for an appointment
   */
  private async isApptBooked() {
    var rsp = await lastValueFrom(this.apiApptService.apiGetAppt(this.g.getCustToken));
    if (rsp.d.RespCode == "200") {
      this.g.setCustToken(rsp.d.ExtendedToken);
      if (rsp.d.RespData != '' && rsp.d.RespData != undefined) {
        if (rsp.d.RespData[0].AppStat != "COMPLETE" || rsp.d.RespData[0].AppStat != "NOSHOW") {
          this.checkInData.isAppt = true;
          //  Check if the booked appointment is the current datetime
          if ((new Date(rsp.d.RespData[0].ApptDate)).getTime() === this.g.getCurrentDateOnly().getTime()) {
            this.checkInData.enableScanner = true;
            this.checkInData.msgDisabledScanner = this.translate.instant('SCANNER_STATUS.APPT_ENABLED');
          }
          else {
            this.checkInData.enableScanner = false;
            this.checkInData.msgDisabledScanner = this.translate.instant('SCANNER_STATUS.APPT_DISABLED');
          }
        }      
        else await this.isWalkedIn();
      }
      else await this.isWalkedIn();
    }
    else this.g.apiRespError(rsp.d);
  }

  /**
   *  Method: Check if already scanned for walk-in
   */
  private async isWalkedIn() {
    var rsp = await lastValueFrom(this.apiWalkInService.apiGetWalkinByProfile(this.g.getCustToken));
    this.checkInData.enableScanner = true;
    this.checkInData.msgDisabledScanner = this.translate.instant('SCANNER_STATUS.WALKIN_ENABLED');
    if (rsp.d.RespCode == "200") {
      this.g.setCustToken(rsp.d.ExtendedToken);
      if (rsp.d.RespData != "" && rsp.d.RespData != undefined) {
        if (rsp.d.RespData[0].WalkInStat != "COMPLETE" && rsp.d.RespData[0].WalkInStat != "NOSHOW") {
          this.checkInData.enableScanner = false;
          this.checkInData.msgDisabledScanner = this.translate.instant('SCANNER_STATUS.CHECKED_IN');
        }
      }
    }
    else this.g.apiRespError(rsp.d);
  }
}