//  Configurations & Services
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
//  Packages
import { DatePipe, HashLocationStrategy, LocationStrategy, TitleCasePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ToastrModule } from 'ngx-toastr';
//  Services
import { LoaderInterceptor } from './services/loader/loader.interceptor';
//  Components: Misc Modules
import { LoaderComponent } from './services/loader/loader.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';
import { UnauthorizedComponent } from './components/error/unauthorized/unauthorized.component';
//  Components: Auth Modules
import { RegisterComponent } from './components/auth/register/register.component';
import { RegisterStatusComponent } from './components/auth/register-status/register-status.component';
import { VerificationComponent } from './components/auth/verification/verification.component';
import { LoginComponent } from './components/auth/login/login.component';
//  Components: Layout Modules
import { LayoutComponent } from './components/layout/layout.component';
import { IndexComponent } from './components/index/index.component';
//  Components: Main Modules
import { CheckInComponent } from './components/modules/check-in/check-in.component';
import { IonicModule } from '@ionic/angular';
import { BookApptComponent } from './components/modules/book-appt/book-appt.component';
import { ProfileComponent } from './components/modules/profile/profile.component';

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
    VerificationComponent,
    LoginComponent,
    //  Components: Layout Modules
    LayoutComponent,
    IndexComponent,
    //  Components: Main Modules
    CheckInComponent,
    BookApptComponent,
    ProfileComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    IonicModule.forRoot({ mode: 'ios', innerHTMLTemplatesEnabled: true }),
    JwtModule.forRoot({ config: { tokenGetter: tokenGetter, }, }),
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPasswordStrengthModule.forRoot(),
    MatSelectModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTooltipModule,
    NgbModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    ZXingScannerModule,
  ],
  providers: [
    DatePipe,
    TitleCasePipe,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor,    multi: true },
    { provide: LocationStrategy,  useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(faIcon: FaIconLibrary) { faIcon.addIconPacks(fas); }
}
export function tokenGetter() { return localStorage.getItem('jtwToken'); }