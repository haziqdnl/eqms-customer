import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
    
    private appConfig: any;
    constructor(private http: HttpClient) { }
    
    public loadAppConfig() {
        return this.http.get('assets/config.json').toPromise().then(data => { this.appConfig = data; });
    }
    
    get apiBaseUrl() { return environment.apiUrl; }
}