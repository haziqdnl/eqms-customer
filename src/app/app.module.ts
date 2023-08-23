//  Configurations & Services
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
//  Packages
import { DatePipe, HashLocationStrategy, LocationStrategy, TitleCasePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ToastrModule } from 'ngx-toastr';
//  Services
import { AppConfigService } from './services/app-config/app-config.service';
import { LoaderInterceptor } from './services/loader/loader.interceptor';
//  Components: Misc Modules
import { LoaderComponent } from './services/loader/loader.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';
import { UnauthorizedComponent } from './components/error/unauthorized/unauthorized.component';
//  Components: Auth Modules
import { LoginComponent } from './components/auth/login/login.component';
//  Components: Layout Modules
import { HeaderComponent } from './components/shared/header/header.component';
import { LayoutComponent } from './components/layout/layout.component';
import { IndexComponent } from './components/index/index.component';
//  Components: Main Modules
import { CheckInComponent } from './components/modules/check-in/check-in.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { RegisterStatusComponent } from './components/auth/register-status/register-status.component';
import { VerificationComponent } from './components/auth/verification/verification.component';

@NgModule({
  declarations: [
    AppComponent,
    //  Components: Misc Modules
    LoaderComponent,
    UnauthorizedComponent,
    NotFoundComponent,
    //  Components: Auth Modules
    RegisterComponent,
    RegisterStatusComponent,
    LoginComponent,
    //  Components: Layout Modules
    HeaderComponent,
    LayoutComponent,
    IndexComponent,
    //  Components: Main Modules
    CheckInComponent,
    VerificationComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    JwtModule.forRoot({ config: { tokenGetter: tokenGetter, }, }),
    NgbModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    ZXingScannerModule
  ],
  providers: [
    DatePipe,
    TitleCasePipe,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor,    multi: true },
    { provide: LocationStrategy,  useClass: HashLocationStrategy },
    {
      provide: APP_INITIALIZER, multi: true, deps: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => { return () => { return appConfigService.loadAppConfig(); }; }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(faIcon: FaIconLibrary) { faIcon.addIconPacks(fas); }
}
export function tokenGetter() { return localStorage.getItem('jtwToken'); }