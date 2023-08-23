import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, interval } from 'rxjs';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector    : 'app-header',
  templateUrl : './header.component.html',
  styleUrls   : ['./header.component.scss']
})
export class HeaderComponent {

  isNavCollapsed: boolean = true;
  
  constructor(
    private g: GeneralService,
    private jwtHelper: JwtHelperService,
    private ngbModal: NgbModal,
    public  router: Router,
  ) {}

  ngOnDestroy() {
    if (typeof this.modalLogoutRef !== 'undefined') this.modalLogoutRef.close();
  }

  /**
   *  Method: Modal
   */
  private modalLogoutRef: any;
  @ViewChild('modalLogout') private modalLogout : any;
  public openModalLogout() { this.modalLogoutRef = this.ngbModal.open(this.modalLogout, { centered: true }); }

  /**
   *  Method: Validate JWT token every 2 minutes (120000 ms)
   */
  private subs: Subscription = interval(120000).subscribe( v => {
    if (this.jwtHelper.isTokenExpired(this.g.getCustToken()))
      this.router.navigate(['login']);
  });

  /**
   *  Method: To scroll to a section in the layout child
   */
  public scrollTo(element: any): void {
    (document.getElementById(element) as HTMLElement).scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

  public logout() { this.g.endSession(); }
}