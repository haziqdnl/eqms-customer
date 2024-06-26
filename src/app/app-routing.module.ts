//  Packages
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//  Components: Misc Modules
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { SupportComponent } from './components/support/support.component';
import { NotFoundComponent } from './components/error/not-found/not-found.component';
import { UnauthorizedComponent } from './components/error/unauthorized/unauthorized.component';
//  Components: Auth Modules
import { RegisterComponent } from './components/auth/register/register.component';
import { RegisterStatusComponent } from './components/auth/register-status/register-status.component';
import { VerificationComponent } from './components/auth/verification/verification.component';
import { LoginComponent } from './components/auth/login/login.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
//  Components: Main Modules
import { LayoutComponent } from './components/layout/layout.component';
import { IndexComponent } from './components/index/index.component';
import { CheckInComponent } from './components/modules/check-in/check-in.component';
import { CheckInRedirectComponent } from './components/modules/check-in-redirect/check-in-redirect/check-in-redirect.component';
import { BookApptComponent } from './components/modules/book-appt/book-appt.component';
import { ProfileComponent } from './components/modules/profile/profile.component';
import { AccountDeletionComponent } from './components/auth/account-deletion/account-deletion.component';

const appName = "EQMS Customer";
const routes: Routes = [
  /**
   *  Components: Auth Modules
   */
  {
    path     : 'register', 
    component: RegisterComponent, 
    title    : `${appName} | Register`
  },
  {
    path     : 'register/verification', 
    component: VerificationComponent, 
    title    : `${appName} | Verification`
  },
  {
    path     : 'register/status', 
    component: RegisterStatusComponent, 
    title    : `${appName} | Register`
  },
  {
    path     : 'login', 
    component: LoginComponent, 
    title    : `${appName} | Login`
  },
  {
    path     : 'reset-password', 
    component: ResetPasswordComponent, 
    title    : `${appName} | Reset Password`
  },
  {
    path     : 'account-deletion', 
    component: AccountDeletionComponent, 
    title    : `${appName} | Account Deletion Request`
  },
  /**
   *  Components: Main Modules
   */
  {
    path     : '', 
    component: LayoutComponent,
    children : [
      {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'home'
      },
      {
        path     : 'home',
        component: IndexComponent,
        title    : `${appName} | Home`
      },
      {
        path     : 'book-appt',
        component: BookApptComponent,
        title    : `${appName} | Book Appointment`
      },
      {
        path     : 'checkinredirect', 
        component: CheckInRedirectComponent, 
        title    : `${appName} | Check-In`
      },
      {
        path     : 'profile', 
        component: ProfileComponent, 
        title    : `${appName} | Profile`
      },
    ]
  },
  {
    path     : 'checkin',
    component: CheckInComponent,
    title    : `${appName} | Check-In`
  },
  /**
   *  Components: Misc Modules
   */
  {
    path     : 'privacy-policy',
    component: PrivacyPolicyComponent,
    title    : `${appName} | Privacy Policy`
  },
  {
    path     : 'support',
    component: SupportComponent,
    title    : `${appName} | Support`
  },
  {
    path     : 'error/401',
    component: UnauthorizedComponent,
    title    : `${appName} | Unauthorized`
  },
  {
    path     : 'error/404',
    component: NotFoundComponent,
    title    : `${appName} | Not Found`
  },
  { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }