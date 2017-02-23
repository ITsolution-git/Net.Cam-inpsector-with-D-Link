import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';

import 'hammerjs';

import { LocalStorageModule } from 'angular-2-local-storage';
import { Ng2DatetimePickerModule } from 'ng2-datetime-picker';
import { Ng2PaginationModule } from 'ng2-pagination';
import { Ng2TableModule } from 'ng2-table/ng2-table';
//import { MaterializeModule } from 'angular2-materialize/src';

import { RouterModule, Routes } from '@angular/router';
import { AppRoutes } from './app.routes';

import { AppComponent } from './app.component';

import { NetcamService, SessionInfo, ServerInfo } from './services/netcam.service';

import { LoginComponent } from './login/login.component';
import { ClientComponent } from './client/client.component';

// Client Child Routes
import { HeaderComponent } from './client/header/header.component';
import { FooterComponent } from './client/footer/footer.component';
import { HomeComponent } from './client/home/home.component';
import { SingleComponent } from './client/single/single.component';
import { MultiComponent } from './client/multi/multi.component';
import { GalleryComponent } from './client/gallery/gallery.component';
import { TimelineComponent } from './client/timeline/timeline.component';
import { AdminComponent } from './client/admin/admin.component';
import { EventComponent } from './client/event/event.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ClientComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    SingleComponent,
    MultiComponent,
    GalleryComponent,
    TimelineComponent,
    AdminComponent,
    EventComponent   
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    LocalStorageModule.withConfig({
        prefix: 'app',
        storageType: 'localStorage'
    }),
    Ng2DatetimePickerModule,
    Ng2PaginationModule,
    Ng2TableModule,
    //MaterializeModule,
    MaterialModule.forRoot(),
    RouterModule.forRoot(AppRoutes)
  ],
  providers: [SessionInfo, ServerInfo],
  bootstrap: [AppComponent]
})
export class AppModule { }
