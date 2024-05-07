import { Component } from '@angular/core';
import { GeneralService } from './services/general/general.service';
//import OneSignal from 'onesignal-cordova-plugin';
import { OneSignal } from 'onesignal-ngx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private g: GeneralService, private oneSignal: OneSignal) {
    let oneSignalId = this.g.isMobile ? "4df23032-35d9-42b0-b50e-c2bb7c4491f7" : "a8673750-2107-45e1-9424-76b1e3a6a2c2";

    this.oneSignal.init({ appId: oneSignalId });

    this.oneSignal.Notifications.addEventListener('click', async (e:any) => {
      let clickData = await e.notification;
      console.log("Notification Clicked : " + clickData);
    });

    this.oneSignal.Notifications.requestPermission().then( (e:any) => {
      console.log("Notification permission granted " + e);
    });

    // Remove this method to stop OneSignal Debugging
    //OneSignal.Debug.setLogLevel(6)
    
    // if (this.g.isMobile) {
    //   OneSignal.initialize("4df23032-35d9-42b0-b50e-c2bb7c4491f7");

    //   OneSignal.Notifications.addEventListener('click', async (e:any) => {
    //     let clickData = await e.notification;
    //     console.log("Notification Clicked : " + clickData);
    //   });

    //   OneSignal.Notifications.requestPermission(true).then((success: Boolean) => {
    //     console.log("Notification permission granted " + success);
    //   });
    // }
  }

  ngOnInit() { this.g.setDefaultLanguage(); }
}