import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import { LocalStorageService } from 'angular-2-local-storage';

import { ServerInfo, NetcamService } from '../services/netcam.service';
import * as Global from '../global';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [NetcamService]
})
export class LoginComponent implements OnInit {
  // TypeScript public modifiers
  isLocal: boolean = false;
  serverInfo: ServerInfo = new ServerInfo();
  savePassword: boolean = false;

  constructor(private netcamService: NetcamService,
    private localStorageService: LocalStorageService,
    private parentRouter: Router) {
    parentRouter.events.subscribe((val) => this.onChanged(val));
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.LoadFromStorage()
  }

  onChanged(val) {
    if (val.url.toLowerCase().indexOf("islocal=true") > -1) {
      this.isLocal = true;
    }
    else {
      this.isLocal = false;
    }

    this.LoadFromStorage();
  }

  LoadFromStorage() {
    // default values
    this.serverInfo.host = "127.0.0.1";
    this.serverInfo.port = "8100";
    this.serverInfo.username = "admin";
    this.serverInfo.password = "1234";
    this.serverInfo.useHTTPS = false;
    this.savePassword = false;

    // local storage loading
    var host = this.localStorageService.get<string>('host');
    var port = this.localStorageService.get<string>('port');
    var username = this.localStorageService.get<string>('username');
    var password = this.localStorageService.get<string>('password');
    var useHTTPS = this.localStorageService.get<boolean>('useHTTPS');
    var savePassword = this.localStorageService.get<boolean>('savePassword');

    if ((host != '') && (host != null)) this.serverInfo.host = host;
    if ((port != '') && (port != null)) this.serverInfo.port = port;
    if ((username != '') && (username != null)) this.serverInfo.username = username;
    if ((password != '') && (password != null)) this.serverInfo.password = password;
    if (useHTTPS != null) this.serverInfo.useHTTPS = useHTTPS;
    if (savePassword != null) this.savePassword = savePassword;
  }

  SaveToStorage() {
    this.localStorageService.set('host', this.serverInfo.host);
    this.localStorageService.set('port', this.serverInfo.port);
    this.localStorageService.set('username', this.serverInfo.username);

    if (this.savePassword) {
      this.localStorageService.set('password', this.serverInfo.password);
    }
    else {
      this.localStorageService.set('password', null);
    }

    this.localStorageService.set('useHTTPS', this.serverInfo.useHTTPS);
    this.localStorageService.set('savePassword', this.savePassword);
  }

  Login(event) {
    if (this.isLocal) {
      this.serverInfo.host = window.location.hostname;
      this.serverInfo.port = window.location.port;
    }

    this.netcamService.GetToken(this.serverInfo, "web-client")
      .then(data => {
        if (data !== undefined) {
          if (data.IsAuthenticated === true) {
            this.SaveToStorage();
            this.parentRouter.navigate(['client']);
          }
        }
      }, error => {
        alert('Login failed with error: ' + error);;
        if (Global.consoleDebug) { console.log('[LOGIN] Login Error2: ' + error); }
      });
  }
}
