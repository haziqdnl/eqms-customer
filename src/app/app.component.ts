import { Component } from '@angular/core';
import { GeneralService } from './services/general/general.service';
import OneSignal from 'onesignal-cordova-plugin';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private g: GeneralService) {
    // Remove this method to stop OneSignal Debugging
    OneSignal.Debug.setLogLevel(6)
    
    // Replace YOUR_ONESIGNAL_APP_ID with your OneSignal App ID
    OneSignal.initialize("4df23032-35d9-42b0-b50e-c2bb7c4491f7");

    OneSignal.Notifications.addEventListener('click', async (e:any) => {
      let clickData = await e.notification;
      console.log("Notification Clicked : " + clickData);
    })

    OneSignal.Notifications.requestPermission(true).then((success: Boolean) => {
      console.log("Notification permission granted " + success);
    })
  }

  ngOnInit() { this.g.setDefaultLanguage(); }
}