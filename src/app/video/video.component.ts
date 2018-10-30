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
  width:any;
  newP:any;
  newContent:any;
  constructor() { }

  ngOnInit() {
    this.connection = new RTCMultiConnection('my-room',{},io);
    this.connection.socketURL =  'https://rtcmulticonnection.herokuapp.com:443/';
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
  
   

      this.video = document.createElement('video');
      try {
        this.video.setAttributeNode(document.createAttribute('autoplay'));
        this.video.setAttributeNode(document.createAttribute('playsinline'));
        this.video.setAttribute(document.createAttribute('height = 200px;'));
        this.video.setAttribute(document.createAttribute('width = 200px;'));
        this.video.setAttributeNode(document.createAttribute('controls'));

    } catch (e) {
        this.video.setAttribute('autoplay', true);
        this.video.setAttribute('playsinline', true);
        this.video.setAttribute('controls',true)
  

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
          this.video.play();
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
        this.newP = document.createElement("p");
        this.newContent = document.createTextNode("You are Created a Room  "+roomid); 
        // alert('you are open a room  '+roomid)
        this.newP.appendChild(this.newContent);
      }
      else{
        console.log('error')
      }
    });
}
joinRoom(){
  this.on = false;
  this.connection.join((<HTMLInputElement>document.getElementById('room-id')).value);
  }

//   disableInputButtons() {
//     // (<HTMLInputElement>document.getElementById('openjoin')).disabled = true;
//     (<HTMLInputElement>document.getElementById('open')).disabled = true;
//     (<HTMLInputElement>document.getElementById('join')).disabled = true;
//     (<HTMLInputElement>document.getElementById('room-id')).disabled = true;
// }

}
