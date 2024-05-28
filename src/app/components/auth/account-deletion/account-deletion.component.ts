import { Component } from '@angular/core';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-account-deletion',
  templateUrl: './account-deletion.component.html',
  styleUrls: ['./account-deletion.component.scss']
})
export class AccountDeletionComponent {

  constructor(public g: GeneralService) {}

  /**
   *  Method: Submit account deletion form
   */
  public submitted: boolean = false;
  public submit() { setTimeout( () => { this.submitted = true; }, 3000); }

  /**
   *  Method: Create mailto template
   */
  public get mailto() {
    let s = "ARX EQMS Customer Account Deletion Request";
    let b = "Dear admin,%0D%0A%0D%0ARegistered email address:%0D%0ARegistered phone no.:%0D%0AReason for account deletion:%0D%0A%0D%0AThank you";
    return `mailto:haziqdnl73@gmail.com?subject=${s}&body=${b}`;
  }
}