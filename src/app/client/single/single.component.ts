import { Component, Optional } from '@angular/core';

import { NetcamService } from '../../services/netcam.service';
import * as Global from '../../global';

declare var soundManager: any;

@Component({
  selector: 'single-component',  // <home></home>
  providers: [],
  styleUrls: ['./single.component.css'],
  templateUrl: './single.component.html'
})
export class SingleComponent {
  // Set our default values
  videojs: any;

  // if we don't show camera image, we show live stream
  showCameraImage: any;

  cameraLoadErrors: number = 0;
  cameraImage: any;

  audioPlayer: any;
  
  livePoster: any;
  liveStream: any;

  sourceId: any;

  modeId: any;
  modes = [
    { Id: 'Jpeg', visible: true },
    { Id: 'Mjpeg', visible: true },
    { Id: 'Motion', visible: true },
    { Id: 'Live', visible: true }
  ];

  hasAudio: boolean;
  hasPTZ: boolean;
  isRecording: boolean = false;
  isMotion: boolean = false;

  audioPlaying: boolean = false;

  // TypeScript public modifiers
  constructor(private netcamService: NetcamService) {
  }

  // ng Events
  ngOnInit() {
    // by default jpeg mode
    this.showCameraImage = true;

    this.netcamService.GetCameras()
      .then(data => {
        //var src = data; // this.netcamService.videoSources;

        if (Global.consoleDebug) { console.log('[SINGLE] GetCameras') }

        if (this.netcamService.videoSources != null && this.netcamService.videoSources.length > 0) {
          this.modeId = this.modes[0].Id;
          this.sourceId = this.netcamService.videoSources[0].Id;
          this.onSourceChange();
        }

      }, err => {
        if (Global.consoleDebug) { console.log('[SINGLE] GetCameras Error: ' + err) }
      });
  }
  ngAfterViewInit() {

  }
  // View methods
  ngOnDestroy() {
    if (this.audioPlayer) {

      if (Global.consoleDebug) { console.log('OnDestroy::Destroying aPlayer') }

      soundManager.pause();
      soundManager.unload('aPlayer');
      soundManager.destroySound('aPlayer');

      this.audioPlayer = null;
    }
  }

  onCameraImageLoaded(failed = false) {
    if (this.cameraLoadErrors < 3) {

      if (!failed) {
        this.cameraLoadErrors = 0;
      }

      setTimeout(() => {
        this.DisplayStream(this.sourceId, this.modeId);
      }, 40);
    }
    else {
      this.cameraImage = "./images/offline.jpg";
    }
  }
  onCameraImageError() {
    if (Global.consoleDebug) { console.log('onCameraImageError... (' + this.cameraLoadErrors + ')') }

    this.cameraLoadErrors++;

    this.onCameraImageLoaded(true);
  }
  onPause() {
    this.videojs = document.getElementById("videojs");

    if (this.videojs != null) {
      if (this.videojs.paused) {
        this.videojs.play();
      } else {
        this.videojs.pause();
      }
    }
  }
  onSourceChange() {
    this.modeId = this.modes[0].Id;
    this.cameraImage = "";

    this.cameraLoadErrors = -1; // will reset to loading image

    this.RefreshSourceVariables(this.sourceId);
    this.DisplayStream(this.sourceId, this.modeId);
    this.StartStopAudio(this.sourceId, this.modeId != "Live");
  }
  onModeChange() {
    this.cameraLoadErrors = -1; // will reset to loading image

    this.cameraImage = "";
    this.DisplayStream(this.sourceId, this.modeId);

    if (this.modeId == "Live") {
      // stop audio
      this.StartStopAudio(this.sourceId, false);
    }
  }
  onRecord() {
    var enabled = this.isRecording;
    this.netcamService.StartStopRecording(this.sourceId, enabled);

    this.isRecording = enabled;
  }
  onMotion() {
    // no need to invert this, the model is automatically updated
    var enabled = this.isMotion;
    this.netcamService.StartStopMotionDetector(this.sourceId, enabled);    

    this.modes[2].visible = enabled;
  }
  onMute() {
    this.StartStopAudio(this.sourceId, this.audioPlaying);
  }
  onPTZ(direction) {
    this.netcamService.SendPTZCommand(this.sourceId, direction);
  }

  // Internal methods
  RefreshSourceVariables(srcValue) {
    if (this.netcamService.videoSources != undefined) {
      for (var each of this.netcamService.videoSources) {
        if (each.Id == srcValue) {
          this.hasAudio = each.Status.HasAudio;
          this.hasPTZ = each.Status.HasPTZ;
          this.isMotion = each.Status.IsMotionDetector;
          this.isRecording = each.Status.IsRecording;

          // Hide Motion mode if motion not running
          this.modes[2].visible = this.isMotion;
          
          break;
        }
      }
    }
  }
  DisplayStream(sourceId, streamMode) {
    var targetImage = this.netcamService.GetStreamUrl(sourceId, streamMode);

    if (streamMode == 'Live') {
      this.livePoster = this.netcamService.GetStreamUrl(sourceId, 'Jpeg');

      this.liveStream = targetImage;
      this.cameraImage = "";

      this.showCameraImage = false;
    }
    else {
      this.liveStream = "";
      this.showCameraImage = true;

      // -1 errors means not tried yet
      if (this.cameraLoadErrors == -1) {
        // Display Loading and reset error counter
        this.cameraImage = "./images/loading.jpg";
        this.cameraLoadErrors = 0;
      }
      else {
        this.cameraImage = targetImage;
      }
    }
  }
  StartStopAudio(srcVal, enabled) {
    // we always destroy if it exists
    if (this.audioPlayer) {
      if (Global.consoleDebug) { console.log('[SINGLE] Destroying Audio Player'); }

      soundManager.pause();
      soundManager.unload('aPlayer');
      soundManager.destroySound('aPlayer');
      this.audioPlayer = null;
    }

    if (enabled) {
      if (!this.hasAudio) {
        if (Global.consoleDebug) { console.log('[SINGLE] Audio is not available for this source'); }
      }
      else {
        var rand = Math.random();
        var uniq = "uniq=" + rand;

        var targetAudioUrl = this.netcamService.videoSources[this.sourceId].AudioUrl + "&" + uniq;

        this.audioPlayer = soundManager.createSound({
          id: 'aPlayer',
          url: targetAudioUrl
        });

        if (this.audioPlayer) {
          this.audioPlayer.play();
        }

        if (Global.consoleDebug) { console.log('[SINGLE] New Instance of Audio Player'); }
      }
    }

    this.audioPlaying = enabled;
  }

}
