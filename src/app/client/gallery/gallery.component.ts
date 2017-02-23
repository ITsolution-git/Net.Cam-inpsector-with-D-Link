import { Component, Optional } from '@angular/core';
import { Ng2DatetimePickerModule, Ng2Datetime } from 'ng2-datetime-picker';
import { Ng2PaginationModule } from 'ng2-pagination';

import { Observable, Subscription } from 'rxjs/Rx';

import { ClientComponent } from '../client.component';
import { NetcamService } from '../../services/netcam.service';

import * as Global from '../../global';

@Component({
  selector: 'gallery-component',  // <home></home>
  providers: [],
  styleUrls: ['./gallery.component.css'],
  templateUrl: './gallery.component.html'
})
export class GalleryComponent {
  columnList = [2,3,4,5];

  page: number = 1;
  numCol: number = 4;
  colWidth: string = "100%";

  dataRows: any[];

  sourceId: number = -1;

  startDate: any;
  endDate: any;

  videoSources: any[];

  // TypeScript public modifiers
  constructor(private netcamService: NetcamService,
    private clientComponent: ClientComponent) {
    Ng2Datetime.weekends = [];
    Ng2Datetime.months = [
      { fullName: 'January', shortName: 'January' },
      { fullName: 'February', shortName: 'February' },
      { fullName: 'March', shortName: 'March' },
      { fullName: 'April', shortName: 'April' },
      { fullName: 'May', shortName: 'May' },
      { fullName: 'June', shortName: 'June' },
      { fullName: 'July', shortName: 'July' },
      { fullName: 'August', shortName: 'August' },
      { fullName: 'September', shortName: 'September' },
      { fullName: 'October', shortName: 'October' },
      { fullName: 'November', shortName: 'November' },
      { fullName: 'December', shortName: 'December' }
    ];
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    var curTime = new Date();
    var curTmp = curTime.getFullYear() + "/" + (curTime.getMonth() + 1) + "/" + curTime.getDate();

    var startDt = new Date(curTmp).getTime();
    var endDt = new Date(curTmp).getTime() + 86400000;

    this.onSetDatePicker(startDt, endDt);
    //this.showPlayer = false;
    this.sourceId = -1;

    this.refreshLibraryContent(startDt);

    // for the list of cameras
    this.netcamService.GetCameras()
      .then(data => {
        if (Global.consoleDebug) { console.log('[GALLERY] GetCameras: ' + this.netcamService.videoSources) }

        if (this.netcamService.videoSources != undefined) {
          this.videoSources = [];
          this.videoSources.push({ Id: -1, SourceName: 'All Sources' });

          this.netcamService.videoSources.forEach((value, key) => {
            this.videoSources.push(this.netcamService.videoSources[key])
          });
        }

      }, err => {
        if (Global.consoleDebug) { console.log('[GALLERY] GetCameras Error: ' + err) }
      });
  }
  ngOnDestroy() {
  }

  refreshLibraryContent(date) {
    var startDate = new Date(date).getTime() + 0;
    var endDate = new Date(date).getTime() + 86400000;

    this.netcamService.GetItemsForPeriod(this.sourceId, 99999, -1, startDate, endDate)
      .then(data => {
        if (Global.consoleDebug) { console.log('[GALLERY] GetItemsForPeriod') }

        if (this.netcamService.libraryItems != null && this.netcamService.libraryItems.length > 0) {

          if (Global.consoleDebug) { console.log('[GALLERY] Num Items ' + this.netcamService.libraryItems.length) }
          var numLines = Math.ceil(this.netcamService.libraryItems.length / this.numCol);
         
          if (Global.consoleDebug) { console.log('[GALLERY] Num Lines ' + numLines) }

          this.colWidth = (100 / this.numCol) + '%';

          // wipe the collection
          this.dataRows = [];
          var dataLine: any[] = [];

          this.netcamService.libraryItems.forEach((value, key) => {
            dataLine.push(key);

            if (dataLine.length >= this.numCol) {
              // push this line
              this.dataRows.push(dataLine);
              dataLine = [];
            }
          });

          if (dataLine.length > 0) {
            // push the incomplete line
            this.dataRows.push(dataLine);
          }

        }
      }, err => {
        if (Global.consoleDebug) { console.log('[GALLERY] GetItemsForPeriod Error: ' + err) }
      });
  }

  onShowFullScreenVideoPlayer(itemId: number, posterUrl: string, movieUrl: string) {
    this.clientComponent.ShowFullScreenVideoPlayer(itemId, posterUrl, movieUrl);
  }

  onSourceChange() {
    this.refreshLibraryContent(this.startDate);
  }
  onStartDateChange(startTime) {
    this.startDate = startTime;
    this.onSourceChange();
  }

  // onStopDateChange(endTime) {
  //   this.endDate = endTime;
  //   this.onSourceChange();
  // }

  onSetDatePicker(start, end) {
    var startDt = new Date(start);
    var endDt = new Date(end);

    var sY = startDt.getFullYear();
    var sM = ((startDt.getMonth() + 1) < 10 ? '0' : '') + (startDt.getMonth() + 1);
    var sD = (startDt.getDate() < 10 ? '0' : '') + startDt.getDate();
    var strStart = sY + '-' + sM + '-' + sD;

    var eY = endDt.getFullYear();
    var eM = ((endDt.getMonth() + 1) < 10 ? '0' : '') + (endDt.getMonth() + 1);
    var eD = (endDt.getDate() < 10 ? '0' : '') + endDt.getDate();
    var strEnd = eY + '-' + eM + '-' + eD;

    this.startDate = strStart;
    this.endDate = strEnd;
  }

}
