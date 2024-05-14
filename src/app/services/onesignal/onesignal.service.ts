import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OneSignal } from 'onesignal-ngx';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OnesignalService {

  constructor(
    private http: HttpClient,
    private oneSignal: OneSignal
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
    await this.oneSignal.init({ appId: this.getAppId });
    //await this.oneSignal.Notifications.requestPermission();
    //this.oneSignal.Notifications.addEventListener('click', async (e:any) => { console.log("Notification clicked"); });
  }

  /**
   *  Method: Set external ID for user that login with the current subscribed device
   */
  public async setExternalId(id: any) { await this.oneSignal.login(id); }

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