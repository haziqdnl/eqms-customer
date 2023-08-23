import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector    : 'app-verification',
  templateUrl : './verification.component.html',
  styleUrls   : ['./verification.component.scss']
})
export class VerificationComponent {

  constructor(
    private routeParam: ActivatedRoute,
    public router: Router,
  ) {}

  ngOnInit() {
    this.getUrlParam();
  }

  ngOnDestroy() {}

  /**
   *  Method: get URL param
   */
  public isTokenValid: boolean = false;
  private getUrlParam() {
    this.routeParam.queryParamMap.subscribe( paramMap => { 
      if (!paramMap.get('t')) 
        this.router.navigate(['login'])
      else 
        this.isTokenValid = true;
    });
  }
}