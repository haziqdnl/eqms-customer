import { Component } from '@angular/core';
import { GeneralService } from './services/general/general.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'eqms-customer';

  constructor(private g: GeneralService) {}

  ngOnInit() { this.g.setDefaultLanguage(); }
}