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

export const AppRoutes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent},
  { path: 'client', component: ClientComponent,  
          children: [
                    { path: '', component: HomeComponent }, // url: client/
                    { path: 'single', component: SingleComponent }, // url: client/single
                    { path: 'multi', component: MultiComponent }, // url: client/multi 
                    { path: 'gallery', component: GalleryComponent }, // url: client/gallery
                    { path: 'timeline', component: TimelineComponent }, // url: client/timeline
                    { path: 'admin', component: AdminComponent }, // url: client/timeline
                    { path: 'event', component: EventComponent }, // url: client/timeline
                  ] 
  }
]