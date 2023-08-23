//  Packages
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//  Components: Misc Modules
import { NotFoundComponent } from './components/error/not-found/not-found.component';
import { UnauthorizedComponent } from './components/error/unauthorized/unauthorized.component';
//  Components: Auth Modules
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
//  Components: Main Modules
import { LayoutComponent } from './components/layout/layout.component';
import { IndexComponent } from './components/index/index.component';
import { CheckInComponent } from './components/modules/check-in/check-in.component';
import { RegisterStatusComponent } from './components/auth/register-status/register-status.component';
import { VerificationComponent } from './components/auth/verification/verification.component';

const appName = "EQMS Customer";
const routes: Routes = [
  /** ========================
   *  Components: Auth Modules
   *  ========================
   */
  { 
    path: 'login', 
    component: LoginComponent, 
    title: `${appName} | Login`
  },
  { 
    path: 'register', 
    component: RegisterComponent, 
    title: `${appName} | Register`
  },
  { 
    path: 'register/status', 
    component: RegisterStatusComponent, 
    title: `${appName} | Register`
  },
  { 
    path: 'verification', 
    component: VerificationComponent, 
    title: `${appName} | Verification`
  },
  /** ========================
   *  Components: Main Modules
   *  ========================
   */
  { 
    path: '', 
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: IndexComponent,
        title: `${appName} | Home`
      },
    ]
  },
  { 
    path: 'checkin', 
    component: CheckInComponent, 
    title: `${appName} | Check-In`
  },
  /** ========================
   *  Components: Misc Modules
   *  ========================
   */
  {
    path: 'error/401',
    component: UnauthorizedComponent,
    title: `${appName} | Unauthorized`
  },
  {
    path: 'error/404',
    component: NotFoundComponent,
    title: `${appName} | Not Found`
  },
  { path: '**', redirectTo: 'error/404', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }