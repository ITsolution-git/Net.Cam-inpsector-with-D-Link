import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { Routes, Router } from '@angular/router';

import * as Global from '../global';

import * as moment from 'moment';

import 'rxjs/Rx';

/*
  Generated class for the Netcam provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

export class ServerInfo {
  username: string;
  password: string;
  host: string;
  port: string;
  useHTTPS: boolean;
}

@Injectable()
export class SessionInfo {
  public isLogged: boolean = false;
  public canPtz: boolean = false;
  public serverUrl: string;
  public sessionToken: string;
  public permToken: string;
}

@Injectable()
export class NetcamService {
  videoSources: any[];

  libraryItems: any[];
  libraryItemInfos: any[];
  libraryInfo: any;
  timelineItems: any;

  eventLogs: any[];
  connectedUsers: any[];
  processInfo: any;

  constructor(private http: Http,
    public sessionInfo: SessionInfo,
    public router: Router) {
    if (Global.consoleDebug) { console.log('New Instance of Netcam Service'); }

    this.ResetSession();

    this.libraryInfo = {
      lastLibraryId: -1,
      sourceFilter: -1,
      libraryPeriodStart: undefined,
      libraryPeriodEnd: undefined,
      libraryLoading: false,
      numItems: 0,
      noMoreItemsAvailable: false
    };
  }

  public ResetSession() {
    this.sessionInfo.isLogged = false;
    this.sessionInfo.permToken = undefined;
    this.sessionInfo.sessionToken = undefined;
    this.sessionInfo.serverUrl = undefined;
  }

  public RedirectLogin(sender) {
    if (Global.consoleDebug) { console.log('RedirectLogin from ' + sender); }
    this.ResetSession();

    this.router.navigate(['login']);

    //  let alert = this.alertCtrl.create({
    //       title: this.translate.instant('txtLoginRequired'),
    //       subTitle: this.translate.instant('txtSessionTimedOut'),
    //       buttons: [{text:'OK',
    //           handler: () => {
    //               this.appCtrl.getRootNav().setRoot(LoginViewPage); 
    //           }
    //         }]
    //     });
    //     alert.present();

    //this.isLogin = false;
    // let confirm = this.alertCtrl.create({
    //   title:this.translate.instant('txtLoginRequired'),
    //   // message: this.translate.instant('txtDeleteServerConfirmation')+ server.name + '?',
    //   subTitle: this.translate.instant('txtSessionTimedOut'),
    //   buttons: [

    //     {
    //       text: 'OK',
    //       handler: () => {
    //           this.appCtrl.getRootNav().setRoot(RedirectViewPage); 
    //         //   this.nav.push(LoginViewPage);
    //       }
    //     }
    //   ]
    // });
    // confirm.present();
  };

  public GetToken(serverInfo: ServerInfo, deviceToken: string): Promise<any> {
    let postData =
      {
        username: serverInfo.username,
        password: serverInfo.password,
        deviceToken: deviceToken
      };

    let httpPrefix = 'http';
    if (serverInfo.useHTTPS) {
      httpPrefix = 'https';
    }

    this.ResetSession();

    this.sessionInfo.serverUrl = httpPrefix + '://' + serverInfo.host + ':' + serverInfo.port;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/GetToken'; // + queryParams;

    if (Global.consoleDebug) { console.log('[NETCAM] GetToken: ' + JSON.stringify(jsonCommand)); }

    return new Promise((resolve, reject) => {
      this.http.post(jsonCommand, JSON.stringify(postData))
        .map(res => res.json())
        .toPromise()
        .then(data => {
          if (Global.consoleDebug) { console.log('[NETCAM] GetToken: ' + JSON.stringify(data)); }

          if (data !== undefined) {
            if (data.IsAuthenticated === true) {
              this.sessionInfo.sessionToken = data.SessionToken;
              this.sessionInfo.permToken = data.PermToken;

              var canPtz = false;
              if (data.Roles !== undefined) {
                data.Roles.forEach((value, key) => {
                  if (value.Name == "Administrator" || value.Name == "Control PTZ") {
                    canPtz = true;
                  }
                });
              }
              this.sessionInfo.canPtz = canPtz;
              this.sessionInfo.isLogged = true;

              if (Global.consoleDebug) { console.log('[NETCAM] Login Success: ' + this.sessionInfo.sessionToken); }

              resolve(data);
            }
            else {
              if (Global.consoleDebug) { console.log('[NETCAM] Login Failed: ' + data.FailedLoginMessage); }
              reject(data.FailedLoginMessage || 'Authentication Error');
            }
          }
        }, err => {
          if (Global.consoleDebug) { console.log('[NETCAM] Login Error: ' + JSON.stringify(err)); }

          var errorMsg = 'Unknown Error';
          switch (err.status) {
            case 0:
              errorMsg = 'Connection refused';
              break;
            case 404:
              errorMsg = 'Method not found';
              break;
            default:
              errorMsg += " (" + status + ")";
          }

          reject(errorMsg);
        }
        );
    });
  }

  public VerifyToken(): Promise<any> {
    let queryParams = 'token=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/VerifyToken?' + queryParams;

    if (Global.consoleDebug) { console.log('[NETCAM] VerifyToken: ' + JSON.stringify(jsonCommand)); }

    return this.http.post(jsonCommand, queryParams)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        // TODO: Handle
        if (Global.consoleDebug) { console.log('[NETCAM] VerifyToken: ' + JSON.stringify(data)); }
        if (data !== undefined) {
        }
      });
  }

  public RegisterDevice(deviceName: string, operatingSystem: string, deviceToken: string, enablePush: boolean): Promise<any> {
    let queryParams = 'device=' + encodeURIComponent(deviceName) + '&operatingSystem=' + encodeURIComponent(operatingSystem) + '&deviceToken=' + deviceToken + '&enablePush=' + enablePush + '&authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/RegisterDevice?' + queryParams;

    if (Global.consoleDebug) { console.log('[NETCAM] RegisterDevice: ' + JSON.stringify(jsonCommand)); }

    return this.http.post(jsonCommand, queryParams)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        // TODO: Handle
        if (Global.consoleDebug) { console.log('[NETCAM] RegisterDevice: ' + JSON.stringify(data)); }
        if (data !== undefined) {
        }
      });
  }

  public GetCameras(): Promise<any> {
    let queryParams = 'authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/GetCameras?' + queryParams;

    if (Global.consoleDebug) { console.log('[NETCAM] GetCameras: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        var sourceId = 0;
        if (Global.consoleDebug) { console.log('[NETCAM] GetCameras: ' + JSON.stringify(data)); }
        if (data !== undefined) {
          this.videoSources = data;
          data.forEach((value, key) => {
            var imageCommand = this.sessionInfo.serverUrl + '/Jpeg/' + value.Id + '?' + queryParams;
            data[key].ImageUrl = imageCommand;
            data[key].InternalId = sourceId;

            var features = '';
            if (value.Status) {
              //  if (value.Status.HasPTZ) {
              //      features += this.translate.instant('txtPanAndTilt');
              //  }
              if (value.Status.HasAudio) {
                //  if (features.length > 0){
                //      features += ', ';
                //  }
                //  features += this.translate.instant('txtAudio');
                var audioCommand = this.sessionInfo.serverUrl + '/Audio/' + key + '?' + queryParams;
                data[key].AudioUrl = audioCommand;
              }
              else {
                data[key].AudioUrl = undefined;
              }
              //if (value.Status.IsMotionDetector) {
              // if (features.length > 0){
              //     features += ', ';
              // }
              //features +=this.translate.instant('txtMotionDetection');
              //}
              // if (value.Status.IsAudioDetector) {
              //     if (features.length > 0){
              //         features += ', ';
              //     }
              //     features +=this.translate.instant('txtAudioDetection');
              // }

              // if (value.Status.IsRecording) {
              //     if (features.length > 0){
              //         features += ', ';
              //     }
              //    features +=this.translate.instant('txtRecording');
              // }
            }
            data[key].Features = features;
            sourceId++;
          });
        }
        this.videoSources = data;
      }, err => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetCameras Failed: ' + err); }

        this.RedirectLogin("GetCameras");
      });
  }

  public SendPTZCommand(sourceId: number, direction: string): Promise<any> {
    let queryParams = 'sourceId=' + sourceId + '&x=' + 0 + '&y=' + 0 + '&command=' + direction + '&authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/SendPTZCommandJson?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] SendPTZCommand: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] SendPTZCommand: ' + JSON.stringify(data)); }
        if (data !== undefined) {
        }
      });
  }

  public GetLastItems(sourceId: number, nbRecords: number): Promise<any> {
    let queryParams = 'sourceId=' + sourceId + '&numRecords=' + nbRecords + '&authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/GetLastItems?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] GetLastItems: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetLastItems: ' + JSON.stringify(data)); }
        if (data !== undefined) {
          this.fillMissingLibraryInfo(data);
          if (Global.consoleDebug) { console.log('[NETCAM] GetLastItems [Filled]: ' + JSON.stringify(data)); }
        }
      }, err => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetLastItems Failed: ' + err); }

        this.RedirectLogin("GetLastItems");
      });
  }

  public GetItemsForPeriod(sourceId: number, nbRecords: number, lastItemId: number, startDate: number, endDate: number): Promise<any> {
    let nowTZ = new Date();
    let now = new Date(nowTZ.getFullYear(), nowTZ.getMonth(), nowTZ.getDate(), nowTZ.getHours(), nowTZ.getMinutes(), 0);

    let oneHour = 1000 * 60 * 60;
    if (startDate === undefined) {
      startDate = now.getTime() - (oneHour * 24 * 5);
    }

    if (endDate === undefined) {
      // now +5 minutes
      endDate = now.getTime() + (60000 * 5);
    }

    let queryParams = 'sourceId=' + sourceId + '&startDate=' + startDate + '&endDate=' + endDate + '&numRecords=' + nbRecords + '&lastItemId=' + lastItemId + '&authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/GetItemsForPeriod?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] GetItemsForPeriod: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetItemsForPeriod: ' + JSON.stringify(data)); }

        if (data !== undefined) {
          this.libraryInfo.lastLibraryId = this.fillMissingLibraryInfo(data);
          if (Global.consoleDebug) { console.log('[NETCAM] GetItemsForPeriod [Filled]: ' + JSON.stringify(data)); }

          this.libraryItems = data;
          this.libraryInfo.numItems = data.length;
        }
      }, err => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetItemsForPeriod Failed: ' + err); }

        this.RedirectLogin("GetItemsForPeriods");
      });
  }

  public GetItemInfosForPeriod(sourceId: number, deltaMinutes: number): Promise<any> {
    // rounds to the next HH
    var oneHour = 1000 * 60 * 60;
    var date = new Date();  //or use any other date
    var nowRounded = new Date(Math.ceil(date.getTime() / oneHour) * oneHour);

    var dayBefore = new Date();
    dayBefore.setTime(nowRounded.getTime() - (oneHour * 24 * 5));

    var queryParams = 'sourceId=' + sourceId + '&startDate=' + dayBefore.getTime() + '&endDate=' + nowRounded.getTime() + '&deltaMinutes=' + deltaMinutes + '&authToken=' + this.sessionInfo.sessionToken;
    var jsonCommand = this.sessionInfo.serverUrl + '/Json/GetItemInfosForPeriod?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] GetItemInfosForPeriod: ' + JSON.stringify(jsonCommand)); }

    // returns a promise {allows to override .then()}!
    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetItemInfosForPeriod: ' + JSON.stringify(data)); }

        if (data !== undefined) {
          this.fillMissingLibraryInfo(data);
          if (Global.consoleDebug) { console.log('[NETCAM] GetItemInfosForPeriod [Filled]: ' + JSON.stringify(data)); }

          this.libraryItemInfos = data;
        }
      }, err => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetItemInfosForPeriod Failed: ' + err); }

        this.RedirectLogin("GetItemInfosForPeriod");
      });
  }

  public GetTimelineForPeriod(sourceId: number, nbRecords: number, startDate: number, endDate: number): Promise<any> {
    let nowTZ = new Date();
    let now = new Date(nowTZ.getFullYear(), nowTZ.getMonth(), nowTZ.getDate(), nowTZ.getHours(), nowTZ.getMinutes(), 0);

    let oneHour = 1000 * 60 * 60;
    if (startDate === undefined) {
      startDate = now.getTime() - (oneHour * 24 * 5);
    }

    if (endDate === undefined) {
      // now +1 hour by default
      endDate = now.getTime() + (60000 * 60);
    }

    let queryParams = 'sourceId=' + sourceId + '&startDate=' + startDate + '&endDate=' + endDate + '&numRecords=' + nbRecords + '&authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/GetTimelineForPeriod?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] GetTimelineForPeriod: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetTimelineForPeriod: ' + JSON.stringify(data)); }

        if (data !== undefined) {
          this.timelineItems = data;
        }
      }, err => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetTimelineForPeriod Failed: ' + err); }

        this.RedirectLogin("GetTimelineForPeriod");
      });
  }

  public GetConnectedUsers(): Promise<any> {
    let queryParams = 'authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/GetConnectedUsers?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] GetConnectedUsers: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetConnectedUsers: ' + JSON.stringify(data)); }

        if (data !== undefined) {
          this.connectedUsers = data;
        }

      }, err => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetConnectedUsers Failed: ' + err); }

        this.RedirectLogin("GetConnectedUsers");
      });
  }

  public GetEventLogs(nbRecords: number, minCrit: number): Promise<any> {
    let queryParams = 'numRecords=' + nbRecords + "&minCrit=" + minCrit + '&authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/GetEventLogs?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] GetEventLogs: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetEventLogs: ' + JSON.stringify(data)); }

        if (data !== undefined) {
          this.eventLogs = data;
        }
      }, err => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetEventLogs Failed: ' + err); }

        this.RedirectLogin("GetEventLogs");
      });
  }

  public GetProcessInfo(): Promise<any> {
    let queryParams = 'authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/GetProcessInfo?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] GetProcessInfo: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] GetProcessInfoà: ' + JSON.stringify(data)); }

        if (data !== undefined) {
          this.processInfo = data;
        }
      }, err => {
        this.RedirectLogin("GetProcessInfo");
      });
  }

  public StartStopRecording(sourceId: number, enabled: boolean): Promise<any> {
    let queryParams = 'sourceId=' + sourceId + '&enabled=' + enabled + '&authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/StartStopRecording?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] StartStopRecording: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] StartStopRecording: ' + JSON.stringify(data)); }

        if (data !== undefined) {
        }
      });
  }

  public StartStopMotionDetector(sourceId: number, enabled: boolean): Promise<any> {
    let queryParams = 'sourceId=' + sourceId + '&enabled=' + enabled + '&authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/StartStopMotionDetector?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] StartStopMotionDetector: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] StartStopMotionDetector: ' + JSON.stringify(data)); }

        if (data !== undefined) {
        }
      });
  }

  public StartStopAudioDetector(sourceId: number, enabled: boolean): Promise<any> {
    let queryParams = 'sourceId=' + sourceId + '&enabled=' + enabled + '&authToken=' + this.sessionInfo.sessionToken;
    let jsonCommand = this.sessionInfo.serverUrl + '/Json/StartStopAudioDetector?' + queryParams;
    if (Global.consoleDebug) { console.log('[NETCAM] StartStopAudioDetector: ' + JSON.stringify(jsonCommand)); }

    return this.http.get(jsonCommand)
      .map(res => res.json())
      .toPromise()
      .then(data => {
        if (Global.consoleDebug) { console.log('[NETCAM] StartStopAudioDetector: ' + JSON.stringify(data)); }

        if (data !== undefined) {
        }
      });
  }

  /* HELPERS */

  // streamMode: Jpeg, Mjpeg, Motion, Live, Audio, Library, Library/Thumb
  public GetStreamUrl(sourceId: number, streamMode: string) {
    var rand = Math.random();
    var uniq = "&uniq=" + rand;
    if (streamMode == 'Live') uniq = "";

    return this.sessionInfo.serverUrl + "/" + streamMode + "/" + sourceId + "?authToken=" + this.sessionInfo.sessionToken + uniq;
  }

  public FormatDate(dateStr: string): string {
    if (typeof moment === 'undefined') {
      return dateStr;
    }
    else {
      let date = moment(dateStr).format('Do MMMM YYYY, HH:mm:ss');
      return date;
    }
  }

  // Add the ImageUrl / MovieUrl fields to the library items
  // used by GetLastItems, GetItemsForPeriod
  private fillMissingLibraryInfo(data): number {
    var highestId = -1;

    data.forEach((value, key) => {
      let authParams = 'authToken=' + this.sessionInfo.sessionToken;

      let imageCommand = this.sessionInfo.serverUrl + '/Library/Thumb/' + value.Id + '?' + authParams;
      let movieCommand = this.sessionInfo.serverUrl + '/Library/' + value.Id + '?' + authParams;

      data[key].ImageUrl = imageCommand;
      data[key].MovieUrl = movieCommand;
      data[key].RelativeId = key;
      data[key].TimeStampStr = this.FormatDate(data[key].TimeStamp);
      if (data[key].Id > highestId) {
        highestId = data[key].Id;
      }
    });

    return highestId;
  }

}
