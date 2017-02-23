import { Component } from '@angular/core';
import { NetcamService } from './services/netcam.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [NetcamService]
})
export class AppComponent {

  constructor(private netcamService: NetcamService) { 
    console.log('Netcam Service ready [App]...');
  }
  
}
