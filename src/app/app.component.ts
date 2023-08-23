import { Component } from '@angular/core';
declare let AOS: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'eqms-customer';
  
  ngOnInit () { AOS.init(); }
}