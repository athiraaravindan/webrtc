import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MediaElementDirective } from './directive/media-element.directive';

import { AppComponent } from './app.component';
import { RtcComponent } from './rtc/rtc.component';
import { VideoComponent } from './video/video.component';
import { VideocallComponent } from './videocall/videocall.component';

const routes: Routes = [
  { path : 'rtc', component: RtcComponent},
  { path : 'videoConferencing', component:VideoComponent},
  { path : 'video',component:VideocallComponent}
];
@NgModule({
  declarations: [
    AppComponent,
    RtcComponent,
    MediaElementDirective,
    VideoComponent,
    VideocallComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    // MediaElementDirective
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
