import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import OneSignalMobile from 'onesignal-cordova-plugin';
import { OneSignal } from 'onesignal-ngx';
import { lastValueFrom } from 'rxjs';
import { GeneralService } from '../general/general.service';

@Injectable({ providedIn: 'root' })
export class OnesignalService {

  constructor(
    private g: GeneralService,
    private http: HttpClient,
    private OneSignalWeb: OneSignal
  ) {}

  /**
   *  Method: Get OneSignal App ID
   */
  public get getAppId() { return "4df23032-35d9-42b0-b50e-c2bb7c4491f7"; }
  /**
   *  Method: Get OneSignal API Key
   */
  public get getApiKey() { return "ZDM0YTUxYjAtNDdiNy00YzNiLTk4OWEtYmRhOWYwMmM3ODJm"; }

  /**
   *  Method: Initlize OneSignal connection
   */
  public async init() { 
    if (this.g.isMobile) {
      OneSignalMobile.Debug.setLogLevel(6);
      OneSignalMobile.initialize(this.getAppId);
      OneSignalMobile.Notifications.addEventListener('click', async (e) => { console.log("Notification Clicked : " + e.notification); })
      OneSignalMobile.Notifications.requestPermission(true).then((success: Boolean) => { console.log("Notification permission: " + success); })
    }
    else {
      this.OneSignalWeb.init({ appId: this.getAppId });
      //this.oneSignal.Notifications.addEventListener('click', async (e:any) => { console.log("Notification clicked"); });
      this.OneSignalWeb.Notifications.requestPermission();
    }
  }

  /**
   *  Method: Set external ID for user that login with the current subscribed device
   */
  public async setExternalId(id: any) { this.g.isMobile ? OneSignalMobile.login(id) : this.OneSignalWeb.login(id); }

  /**
   *  Method: OneSignal API to create push notification
   */
  public async createPushNotification(msg: string, id: any) {
    await lastValueFrom(
      this.http.post(
        'https://api.onesignal.com/notifications', 
        {
          app_id: this.getAppId,
          include_aliases: { external_id: [id]},
          target_channel: "push",
          contents: { "en": msg },
        },
        { 'headers': { 'content-type': 'application/json', 'Authorization': `Basic ${this.getApiKey}` } })
    );
  }
}