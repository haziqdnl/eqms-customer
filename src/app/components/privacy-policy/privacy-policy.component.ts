import { Component } from '@angular/core';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  constructor(public g: GeneralService) {}
}