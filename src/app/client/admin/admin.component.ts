import { Component, Optional } from '@angular/core';

import { NetcamService } from '../../services/netcam.service';
import * as Global from '../../global';

@Component({
  selector: 'admin-component',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
  ],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './admin.component.css' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  // Set our default values
  ReqURL : any;
  AdminData : any;

  // TypeScript public modifiers
  IsUser : any;
  IsServer : any;
  selectedValue: any;

  DisplayList = [
    {value: 'User', status: 'Connected User'},
    {value: 'Server', status: 'Server Status'}
  ];

  lstUser = [
    {icolor: '', icon: '', text: 'Icon', cols: 1, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'User Name', cols: 2, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'Auth', cols: 1, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'Host Name', cols: 2, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'Country', cols: 2, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'Session Started', cols: 3, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'Transfer rate', cols: 2, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'Web #', cols: 1, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'WCF #', cols: 1, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'Web file', cols: 3, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'WCF Command', cols: 3, rows: 1, color: 'lightblue'},
    {icolor: '', icon: '', text: 'Data Transfered', cols: 2, rows: 1, color: 'lightblue'},
  ];

  lstStatus = [
    {text: 'Server CPU', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Free HDD', cols: 1, rows: 1, color: 'lightblue'},
    {text: 'Connected', cols: 1, rows: 1, color: 'lightblue'},
    {text: '', cols: 1, rows: 1, color: '#eeeeee'},
    {text: '', cols: 1, rows: 1, color: '#eeeeee'},
    {text: '', cols: 1, rows: 1, color: '#eeeeee'}
  ];
  
  constructor(private netcamService: NetcamService) {

  }

  ngOnInit() {
        
      this.onConnectedUser();
      this.onServerStatus();
    
  }
  ngAfterViewInit(){
    this.selectedValue = this.DisplayList[0].value;
    this.IsServer = 'none';
    // this.GetCameraInfo();
  }
  ngOnDestroy(){
  }

  onSelected(){
    console.log(this.selectedValue);
    if (this.selectedValue == "Server")
    {
      this.IsUser = 'none';
      this.IsServer = 'block';
    }
    else if(this.selectedValue == "User"){
      this.IsUser = 'block';
      this.IsServer = 'none';
    }
  }
  onServerStatus(){
    //http://127.0.0.1:8100/Json/GetProcessInfo?authToken=97c03388-5898-48bd-b561-b721f0a5f426
    //http://127.0.0.1:8100/Json/GetServiceStatus?authToken=97c03388-5898-48bd-b561-b721f0a5f426
    // this.ReqURL = Globals.g_Url + "/Json/GetProcessInfo?authToken=" + Globals.g_SessionToken;
    // console.log(this.ReqURL);
    // this._http.get(this.ReqURL).map(data => data.json()).subscribe((data) => {
    //   if (data != undefined){
    //     // console.log(data);
    //     this.lstStatus[3].text = data.CPU;
    //   }
    // });
    // this.ReqURL = Globals.g_Url + "/Json/GetServiceStatus?authToken=" + Globals.g_SessionToken;
    // console.log(this.ReqURL);
    // this._http.get(this.ReqURL).map(data => data.json()).subscribe((data) => {
    //   if (data != undefined){
    //     // console.log(data);
    //     this.lstStatus[4].text = Math.round(data.FreeDiskSpace*1/1024/1024/1024) + 'GB';
    //     this.lstStatus[5].text = data.ConnectedUsers;
    //   }
    // });
  }
  onConnectedUser(){
    //http://127.0.0.1:8100/Json/GetConnectedUsers?authToken=7d870987-55f6-48da-b996-57f2b310cab4
    // this.ReqURL = Globals.g_Url + "/Json/GetConnectedUsers?authToken=" + Globals.g_SessionToken;
    //   console.log(this.ReqURL);
    //   this._http.get(this.ReqURL).map(data => data.json()).subscribe((data) => {
    //     if (data != undefined){
    //       console.log(data);
    //       this.AdminData = data;
    //       // console.log(this.AdminData);
    //       for (var i = 0; i < this.AdminData.length; i ++){
    //         var lstUserDetail = [
    //           {icolor: '', icon: '', text: '', cols: 1, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 2, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 1, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 2, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 2, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 3, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 2, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 1, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 1, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 3, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 3, rows: 1, color: '#eeeeee'},
    //           {icolor: '', icon: '', text: '', cols: 2, rows: 1, color: '#eeeeee'},
    //         ];
    //         var image = Globals.g_Url + "/UserIcons/" + this.AdminData[i].UserIcon;
    //         lstUserDetail[0].icon = image;
    //         lstUserDetail[1].text = this.AdminData[i].UserName;
    //         lstUserDetail[2].text = this.AdminData[i].AuthenticationMode;
    //         lstUserDetail[3].text = this.AdminData[i].HostName;
    //         lstUserDetail[4].text = this.AdminData[i].CountryName;
    //         lstUserDetail[5].text = this.AdminData[i].SessionStarted.substring(0, 19).replace('T', ' ');
    //         lstUserDetail[6].text = this.AdminData[i].TransferRate;
    //         lstUserDetail[7].text = this.AdminData[i].NumWebRequests;
    //         lstUserDetail[8].text = this.AdminData[i].NumWCFRequests;
    //         lstUserDetail[9].text = this.AdminData[i].LastWebFile;
    //         lstUserDetail[10].text = this.AdminData[i].LastWCFCommand;
    //         lstUserDetail[11].text = this.AdminData[i].BytesTransfered;
    //         for (var j = 0; j < 12; j ++){
    //           this.lstUser[this.lstUser.length] = lstUserDetail[j];
    //         }
    //       }
    //     }
    //     else
    //     {
    //       this.parentRouter.navigate(['login']);
    //     }
    //   });
  }

  
}
