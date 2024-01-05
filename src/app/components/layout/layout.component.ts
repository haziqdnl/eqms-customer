import { Component } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import Integer from '@zxing/library/esm/core/util/Integer';
import { Subscription, interval } from 'rxjs';
import { CheckInService } from 'src/app/services/check-in/check-in.service';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  
  constructor(
    private checkInService: CheckInService,
    private g: GeneralService,
    private jwtHelper: JwtHelperService,
  ) {}

  ionViewWillLeave()  { this.destroy(); }
  ngOnDestroy()       { this.destroy(); }

  private destroy() {
    this.intervalIsTokenExpired.unsubscribe();
    this.intervalIsCheckInEnabled.unsubscribe();
  }
  
  /**
   * Method: Validate JWT token every 2 minutes
   */
  private intervalIsTokenExpired: Subscription = interval(120000).subscribe( () => {
    this.jwtHelper.isTokenExpired(this.g.getCustToken()) ? this.g.redirectBack('login') : console.log('Token validated');
  });

  /**
   *  Method: Check the scanner enablement status
   */
  public scannerData: any = {
    
    isAppt            : false,
    isSupported       : false,
    msgDisabledScanner: "",
  };
  public a: any = 0;
  private intervalIsCheckInEnabled: Subscription = interval(1000).subscribe( async () => {
    this.scannerData = await this.checkInService.isCheckInEnabled();
  });
}