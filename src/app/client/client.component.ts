import { Component, OnInit } from '@angular/core';

import { NgModule } from '@angular/core';
import { Routes, Router } from '@angular/router';

// import { SecurityContext } from '@angular/core';
// import { DomSanitizer } from '@angular/platform-browser';

import { ServerInfo, NetcamService } from '../services/netcam.service';

import * as Global from '../global';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})

export class ClientComponent implements OnInit {

  fullScreenVisible: boolean = false;
  fullScreenReference: string;
  fullScreenImage: string;
  fullScreenLoadError: number = 0;

  videoPlayerMovieUrl: string;
  videoPlayerPoster: string;
  videoPlayerVisible: boolean = false;

  // TypeScript public modifiers
  constructor(private netcamService: NetcamService,
              public router: Router
  ) { }

  ngOnInit() {
    if (!this.netcamService.sessionInfo.isLogged) {
      if (Global.consoleDebug) { console.log('[Client] No session found. Redirecting to login') }

      this.router.navigate(['login']);
    }
  }

  onLogout() {
      this.netcamService.RedirectLogin('User');      
  }

  navigateTo(targetRoute : string)
  {
      this.router.navigate([targetRoute]);
  }

  ShowFullscreenStream(nIndex: number, streamUrl: string) {
    this.fullScreenVisible = true;

    this.fullScreenLoadError = 0;
    this.fullScreenReference = streamUrl;
    this.fullScreenImage = "./images/loading.jpg";

    if (Global.consoleDebug) { console.log('ShowFullScreenStream... (' + this.fullScreenImage + ')') }
  }

  onHideFullScreenStream() {
    this.fullScreenVisible = false;
  }

  onFullScreenImageLoaded(failed: boolean = false) {
    if (this.fullScreenLoadError < 3) {

      if (!failed) {
        this.fullScreenLoadError = 0;
      }

      setTimeout(() => {
        var rand = Math.random();
        var uniq = "uniq=" + rand;

        let targetUrl = this.fullScreenReference + '&' + uniq;
        this.fullScreenImage = targetUrl;

        if (Global.consoleDebug) { console.log('onFullScreenImageLoaded... (' + this.fullScreenImage + ')') }
      }, 40);
    }
    else {
      this.fullScreenImage = "./images/offline.jpg";
    }
  }

  onFullScreenImageError() {
    if (Global.consoleDebug) { console.log('onFullScreenImageError... (' + this.fullScreenLoadError + ')') }
    this.fullScreenLoadError++;
    this.onFullScreenImageLoaded(true);
  }

  onPauseFullScreenVideoPlayer() {
    var videojs : any = document.getElementById("videojs");

    if (videojs != null) {
      if (videojs.paused) {
        videojs.play();
      } else {
        videojs.pause();
      }
    }
  }

  ShowFullScreenVideoPlayer(itemId: number, posterUrl: string, movieUrl: string) {
    this.videoPlayerPoster = posterUrl;
    this.videoPlayerMovieUrl = movieUrl;
    this.videoPlayerVisible = true;
  }

  onHideFullScreenVideoPlayer() {
    this.videoPlayerVisible = false;
  }

}

