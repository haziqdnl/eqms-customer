import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector    : 'app-verification',
  templateUrl : './verification.component.html',
  styleUrls   : ['./verification.component.scss']
})
export class VerificationComponent {

  constructor(
    private routeParam: ActivatedRoute,
    public  g: GeneralService
  ) {}

  ionViewWillEnter() { this.getUrlParam(); }

  /**
   *  Method: get URL param
   */
  public isTokenValid: boolean = false;
  private getUrlParam() {
    this.routeParam.queryParamMap.subscribe( paramMap => { 
      !paramMap.get('t') ? this.g.redirectBack('login') : this.isTokenValid = true;
    });
  }
}