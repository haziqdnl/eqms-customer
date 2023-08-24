import { Component } from '@angular/core';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector    : 'app-unauthorized',
  templateUrl : './unauthorized.component.html',
  styleUrls   : ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {
  constructor(public g: GeneralService) {}
}