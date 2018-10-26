declare var RTCMultiConnection;
import * as io from 'socket.io-client';


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

  constructor() { }

  ngOnInit() {
    this.connection = new RTCMultiConnection('my-room',{},io);
    this.connection.socketURL =  "http://localhost:9001/";
    this.connection.socketMessageEvent = 'video-conference-demo';
    this.connection.session = {
        audio: true,
        video: false
    };
    this.connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };
    this.connection.videosContainer = document.getElementById('videos-container');
    this.connection.onstream = (event)=> {
      console.log(event.streamid)
    this.existing = document.getElementById(event.streamid);
      if(this.existing && this.existing.parentNode) {
        console.log(event.streamid)
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
    } catch (e) {
        this.video.setAttribute('autoplay', true);
        this.video.setAttribute('playsinline', true);
    }
    if(event.type === 'local') {
      this.video.volume = 0;
      try {
          this.video.setAttributeNode(document.createAttribute('muted'));
      } catch (e) {
          this.video.setAttribute('muted', true);
      }
    }
    this.video.srcObject = event.stream;
    // var width = parseInt(this.connection.videosContainer.clientWidth / 3) - 20;
    this.connection.videosContainer.appendChild(this.video);
      // if(event.stream.type == 'local'){
      // this.videoPreview = document.getElementById('video-preview');
      // console.log(event)
      // this.videoPreview.srcObject = event.stream;
      // this.videoPreview.play();
      // }
      // if(event.stream.type == 'remote'){
      // this.videoPreview = document.getElementById('video-remote');
      // this.videoPreview.srcObject = event.stream;
      // this.videoPreview.play(); 
      // }
    }
}
openRoom(){
this.connection.open((<HTMLInputElement>document.getElementById('room-id')).value);

}
joinRoom(){
  this.connection.join((<HTMLInputElement>document.getElementById('room-id')).value);
}
open_or_join(){
  this.connection.openOrJoin((<HTMLInputElement>document.getElementById('room-id')).value, function(isRoomExists, roomid) {
    if (!isRoomExists){
      // this.showRoomURL(roomid);
    }
});

  }

}
