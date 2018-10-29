declare var RTCMultiConnection;
import * as io from 'socket.io-client';
import * as $ from 'jquery';

import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  connection:any;
  open:any;
  mediaElement:any;
  videoPreview:any;
  existing:any;
  video:any;
  disabled:any = false;
  on:any = true;
  p:any;
  constructor() { }

  ngOnInit() {
    this.connection = new RTCMultiConnection('my-room',{},io);
    this.connection.socketURL =  "http://localhost:9001/";
    this.connection.socketMessageEvent = 'video-conference-demo';
    this.connection.session = {
        audio: true,
        video: true
    };
    this.connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };
    this.connection.videosContainer = document.getElementById('videos-container');
    this.connection.onstream = (event)=> {
    this.existing = document.getElementById(event.streamid);
      if(this.existing && this.existing.parentNode) {
        this.existing.parentNode.removeChild(this.existing);
      }
      event.mediaElement.removeAttribute('src');
      event.mediaElement.removeAttribute('srcObject');
      event.mediaElement.muted = true;
      event.mediaElement.volume = 0;

      this.video = document.createElement('video');
      try {
        this.video.setAttributeNode(document.createAttribute('autoplay'));
        this.video.setAttributeNode(document.createAttribute('playsinline'));
        this.video.setAttribute(document.createAttribute('height = 200px;'));
        this.video.setAttribute(document.createAttribute('width = 200px;'));
    } catch (e) {
        this.video.setAttribute('autoplay', true);
        this.video.setAttribute('playsinline', true);
  

    }
    if(event.stream.type == 'local'){
      console.log(event)
      this.videoPreview = document.getElementById('video-preview');
      this.videoPreview.srcObject = event.stream;
      this.videoPreview.play();
    //   setTimeout(function() {
    //     this.videoPreview.play();
    // }, 10000);
      }
      if(event.stream.type == 'remote'){
        
        this.video.srcObject = event.stream;
        this.connection.videosContainer.appendChild(this.video);
        // setTimeout(function() {
          this.videoPreview.play();
      // }, 10000);
  
      }
     
    }
}
openRoom(){
  this.on = false;
  // (<HTMLInputElement>document.getElementById('open')).disabled = true;

this.connection.open((<HTMLInputElement>document.getElementById('room-id')).value,
(isRoomOpened, roomid, error) =>{
  if(isRoomOpened === true) {
    alert('you are join in the room'  +roomid)
    // console.log('room open room-id',roomid);
  }
  else{
    console.log('error')
  }
});
}
joinRoom(){
  this.on = false;

  // (<HTMLInputElement>document.getElementById('join')).disabled = true;

  this.connection.join((<HTMLInputElement>document.getElementById('room-id')).value);
 
 

}
// open_or_join(){
  // this.disableInputButtons();

  // this.connection.openOrJoin((<HTMLInputElement>document.getElementById('room-id')).value, function(isRoomExists, roomid) {
    // if (!isRoomExists){
    //   // this.showRoomURL(roomid);
    // }
// });

//   }
  disableInputButtons() {
    // (<HTMLInputElement>document.getElementById('openjoin')).disabled = true;
    (<HTMLInputElement>document.getElementById('open')).disabled = true;
    (<HTMLInputElement>document.getElementById('join')).disabled = true;
    (<HTMLInputElement>document.getElementById('room-id')).disabled = true;
}

}
