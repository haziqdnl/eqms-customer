import { Component } from '@angular/core';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-check-in-redirect',
  templateUrl: './check-in-redirect.component.html',
  styleUrls: ['./check-in-redirect.component.scss']
})
export class CheckInRedirectComponent {
  constructor(public  g: GeneralService) {}
  ionViewWillEnter()  { this.g.redirectTo('checkin'); }
}