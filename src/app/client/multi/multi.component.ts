import { Component, Optional } from '@angular/core';

import { ClientComponent } from '../client.component';
import { NetcamService } from '../../services/netcam.service';
import * as Global from '../../global';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'multi-component',
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./multi.component.css'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './multi.component.html'
})
export class MultiComponent {
  currentPage: number = 0;
  isPrev: boolean = false;
  isNext: boolean = false;

  showDisplayPopup: boolean = false;
  displayMode: number = -1;

  cameraImagesReferences = []; //0..12 x Images URLs references (no ?uniq=)
  cameraImages = [];           //0..12 x Images URLs rendered in the view (with ?uniq=)
  cameraLoadErrors = [];       //load error counters

  selectedModeImage: any;

  DisplayPerMode = [1, 2, 3, 4, 6, 8, 9, 12, 6, 8];
  ModeImages = [
    { value: '1', imageUrl: "./images/icons/1.png" },
    { value: '2', imageUrl: "./images/icons/2.png" },
    { value: '3', imageUrl: "./images/icons/3.png" },
    { value: '4', imageUrl: "./images/icons/4.png" },
    { value: '5', imageUrl: "./images/icons/5.png" },
    { value: '6', imageUrl: "./images/icons/6.png" },
    { value: '7', imageUrl: "./images/icons/7.png" },
    { value: '8', imageUrl: "./images/icons/8.png" },
    { value: '9', imageUrl: "./images/icons/9.png" },
    { value: '10', imageUrl: "./images/icons/10.png" }
  ];

  constructor(private netcamService: NetcamService, 
              private clientComponent: ClientComponent) {
  }

  // ng Events
  ngOnInit() {
    this.netcamService.GetCameras()
      .then(data => {
        if (Global.consoleDebug) { console.log('[MULTI] GetCameras') }

        if (this.netcamService.videoSources != null && this.netcamService.videoSources.length > 0) {
          this.onDisplayModeChange(3);
        }
      }, err => {
        if (Global.consoleDebug) { console.log('[MULTI] GetCameras Error: ' + err) }
      });
  }
  ngAfterViewInit() {

  }
  ngOnDestroy() {
  }

  onDefocus(event) {
    if (event.target.className != "for-select") {
      this.showDisplayPopup = false;
    }
  }
  onOpenPopup() {
    this.showDisplayPopup = !this.showDisplayPopup;
  }
  onDisplayModeChange(nIndex) {
    this.selectedModeImage = this.ModeImages[nIndex].imageUrl;

    if (nIndex != this.displayMode) {

      if (Global.consoleDebug) { console.log('[MULTI] onDisplayModeChange to ' + nIndex); }

      this.displayMode = nIndex;

      this.ResetCameraImages();

      this.RefreshCameraImages();
    }
  }
  onCameraImageLoaded(nIndex, failed = false) {
    if (this.cameraLoadErrors[nIndex] < 3) {

      if (!failed) {
        this.cameraLoadErrors[nIndex] = 0;
      }

      if (this.cameraImagesReferences[nIndex] != '') {
        var rand = Math.random();
        var uniq = 'uniq=' + rand;

        setTimeout(() => {
          this.cameraImages[nIndex] = this.cameraImagesReferences[nIndex] + '&' + uniq;
        }, 40);

      }
    }
    else {
      this.cameraImages[nIndex] = "./images/offline.jpg";
    }
  }
  onCameraImageError(nIndex) {
    if (Global.consoleDebug) { console.log('[MULTI] onCameraImageError... (' + this.cameraLoadErrors + ')'); }

    this.cameraLoadErrors[nIndex]++;

    this.onCameraImageLoaded(nIndex, true);
  }
  onZoom(nIndex : number)
  {
    var streamUrl =  this.cameraImagesReferences[nIndex];

    if (Global.consoleDebug) { console.log('[MULTI] onZoom for #' + nIndex + ' (' + streamUrl + ')'); }

    this.clientComponent.ShowFullscreenStream(nIndex, streamUrl);
  }  
  onPrev() {
    this.currentPage--;
    this.RefreshCameraImages();
  }
  onNext() {
    this.currentPage++;
    this.RefreshCameraImages();
  }

  ResetCameraImages() {
    for (var i = 0; i < 12; i++) {
      // reset all references
      this.cameraImagesReferences[i] = "";

      // reset the images displayed (to loading)
      this.cameraLoadErrors[i] = 0;
    }
  }
  RefreshCameraImages() {
    if (this.netcamService.videoSources != undefined) {

      var numDisplayed = this.DisplayPerMode[this.displayMode];

      if (this.currentPage > (this.netcamService.videoSources.length - numDisplayed)) {
        this.currentPage = (this.netcamService.videoSources.length - numDisplayed);
      }

      if (this.currentPage < 0) {
        this.currentPage = 0;
      }

      var currentIdx = 0;

      for (var i = 0; i < this.netcamService.videoSources.length; i++) {

        var src = this.netcamService.GetStreamUrl(this.netcamService.videoSources[i].Id, 'Jpeg');

        if (i >= this.currentPage && currentIdx < numDisplayed) {
          var rand = Math.random();
          var uniq = 'uniq=' + rand;

          if (this.cameraImagesReferences[currentIdx] == "") {
            this.cameraImages[currentIdx] = "./images/loading.jpg" + '?' + uniq;
          }
          else {
            this.cameraImages[currentIdx] = this.cameraImagesReferences[currentIdx] + '&' + uniq;
          }

          this.cameraImagesReferences[currentIdx] = src;

          currentIdx++;
        }

      }
      this.UpdateButtonState();
    }
  }

  UpdateButtonState() {
    if (this.netcamService.videoSources != undefined) {
      var numDisplayed = this.DisplayPerMode[this.displayMode];

      this.isNext = this.currentPage < (this.netcamService.videoSources.length - numDisplayed);
      this.isPrev = this.currentPage > 0;
    }
  }
}
