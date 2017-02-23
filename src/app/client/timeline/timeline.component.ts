import { Component, Optional } from '@angular/core';
import { Ng2DatetimePickerModule,Ng2Datetime } from 'ng2-datetime-picker';
import { Ng2PaginationModule } from 'ng2-pagination';

import { Observable, Subscription} from 'rxjs/Rx';

import { SecurityContext} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { NetcamService, SessionInfo } from '../../services/netcam.service';

import * as Global from '../../global';

declare var d3:any;
declare var eventDrops:any;

@Component({
  selector: 'timeline-component',  // <home></home>
  providers: [],
  styleUrls: [ './timeline.component.css' ],
  templateUrl: './timeline.component.html'
})
export class TimelineComponent {

  timeStamp : any;
  duration: any;
  previewImage : string = undefined;
  videoSource : string = undefined;
  videoPoster : string = undefined;
  videoObjectId : any;
  
  constructor(private netcamService: NetcamService) {
  }

  ngOnInit() {    
  }
  ngAfterViewInit(){
    var curTime = new Date();
    var curTmp = curTime.getFullYear() + "/" + (curTime.getMonth() + 1) + "/" + curTime.getDate();

    var startDt = new Date(curTmp).getTime();
    var endDt = new Date(curTmp).getTime() + 86400000;    
    
    // for the list of cameras
    this.netcamService.GetTimelineForPeriod(-1, 99999, startDt, endDt)
      .then(data => {
        if (Global.consoleDebug) { console.log('[TIMELINE] GetTimelineForPeriod: ' + this.netcamService.timelineItems) }
        if (this.netcamService.timelineItems != undefined){
          let data = this.netcamService.timelineItems;
          this.InitChart(data.data, this.netcamService.sessionInfo);
        }

      }, err => {
        if (Global.consoleDebug) { console.log('[TIMELINE] GetTimelineForPeriod Error: ' + err) }
      });
  }
  ngOnDestroy(){
  }
  
  InitChart(data, sessionInfo){
    var startTime = new Date().getTime() - 86400000*1;
    var endTime = new Date().getTime();

    for (var item of data) {
        for (var attr of item.attributes) {
            attr.date = new Date(attr.date);
        }
    }

    var color = d3.scale.category20();
    var timelineContent = document.getElementById('ncs-timeline');
    var parentWidth = timelineContent.offsetWidth;
    var lastHoverId = -1;
    var lastRect = null;

    var parentScope = this;
    
    var eventDropConfig = {
          start: new Date(0),
          end: new Date(),
          minScale: 0,
          maxScale: Infinity,
          width: parentWidth, //1000,
          margin: {
              top: 60,
              left: 150,
              bottom: 20,
              right: 20
          },
          locale: null,
          axisFormat: null,
          tickFormat: [
              [".%L", function(d) { return d.getMilliseconds(); }],
              [":%S", function(d) { return d.getSeconds(); }],
              ["%I:%M", function(d) { return d.getMinutes(); }],
              ["%I %p", function(d) { return d.getHours(); }],
              ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
              ["%b %d", function(d) { return d.getDate() != 1; }],
              ["%B", function(d) { return d.getMonth(); }],
              ["%Y", function() { return true; }]
          ],
          eventHover: function(obj, event) {
            
              if (lastHoverId != obj.__data__.id) {
                  var srcUrl = sessionInfo.serverUrl + "/Library/Thumb/" + obj.__data__.id + ".jpg?authToken=" + sessionInfo.sessionToken;

                  lastHoverId = obj.__data__.id

                  parentScope.timeStamp = obj.__data__.date;
                  parentScope.duration = (obj.__data__.duration / 1000).toFixed(1);
                  parentScope.previewImage = srcUrl;
                  parentScope.videoObjectId = undefined;
                  parentScope.videoPoster = undefined;
                  parentScope.videoSource = undefined;

                  if (lastRect != null) {
                      d3.select(lastRect).classed("hover", false);
                  }

                  d3.select(obj).classed("hover", true);
                  lastRect = obj;
              }
          },
          eventHoverLeave: function() {
          },
          eventClick: function(obj) {
              var srcUrl = sessionInfo.serverUrl + "/Library/Thumb/" + obj.__data__.id + ".jpg?authToken=" + sessionInfo.sessionToken;
              var vSrcUrl = sessionInfo.serverUrl + "/Library/" + obj.__data__.id + ".mp4?authToken=" + sessionInfo.sessionToken;

              var videoObjectId = "videoObject_" + obj.__data__.id + "_html5_api";

              parentScope.previewImage = undefined;
              parentScope.videoPoster = srcUrl;
              parentScope.videoSource = vSrcUrl;
              parentScope.videoObjectId = videoObjectId;
          },
          eventZoom: null,
          // eventClick: function(obj) {
          //     console.log("C: " + JSON.stringify(obj));
  
          //     var videoDiv = $('#ncs-timeline-preview');
          //     // same as divToolTip !

          //     var videoObjectId = "videoObject_" + obj.__data__.id;
          //     var videoPlayerView = new directory.VideoPlayerView({
          //         posterURL: directory.getLibraryURL(obj.__data__.id, 1, true),
          //         sourceURL: directory.getLibraryURL(obj.__data__.id, 0, false),
          //         videoId: videoObjectId,
          //         mode: 'html5'
          //     });

          //     // with autoplay :)
          //     videoDiv.html(videoPlayerView.render(true, true).el);
          // },
          hasDelimiter: true,
          hasTopAxis: true,
          hasBottomAxis: function(data) {
              return data.length >= 10;
          },
          eventLineColor: 'black',
          eventColor: null
      };

      var eventDropsChart = d3.chart.eventDrops(eventDropConfig)
          .eventLineColor(function(datum, index) {
              return color(index);
          })
          .start(new Date(startTime))
          .end(new Date(endTime));

      var element = d3.select(timelineContent).datum(data);
      // draw the chart
      console.log(element);
      eventDropsChart(element);
  }
  
 
}
