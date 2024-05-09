import { Component } from '@angular/core';
import { GeneralService } from './services/general/general.service';
import { OnesignalService } from './services/onesignal/onesignal.service';
//import OneSignal from 'onesignal-cordova-plugin';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private g: GeneralService, private oneSignal: OnesignalService) {
    this.oneSignal.init();
  }

  ngOnInit() { this.g.setDefaultLanguage(); }
}