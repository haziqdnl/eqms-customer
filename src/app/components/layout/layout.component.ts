import { Component } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subscription, interval } from 'rxjs';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  
  constructor(
    private g: GeneralService,
    private jwtHelper: JwtHelperService,
  ) {}
  
  /**
   * Method: Validate JWT token every 2 minutes (120000 ms)
   */
  private subs: Subscription = interval(120000).subscribe( v => {
    this.jwtHelper.isTokenExpired(this.g.getCustToken()) ? this.g.redirectBack('login') : console.log('Token validated');
  });
}