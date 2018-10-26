
declare var RTCMultiConnection;
  import { Component, OnInit } from "@angular/core";
  import { map } from "rxjs/operators";
  import * as io from 'socket.io-client';
  const broadcastId = 'my-id'

  @Component({
    selector: "app-rtc",
    templateUrl: "./rtc.component.html",
    styleUrls: ["./rtc.component.css"]
  })
  export class RtcComponent implements OnInit {
    public videoElements: any = []
    connection: any;
    connected: boolean = false
    self: boolean = false
    myId: string = null
    name:any;
    videoPreview:any;
   
    RMCMediaTrack: any = {
        cameraStream: null,
        cameraTrack: null,
        screen: null,
        selfVideo:null
    }
    streams:any=[]
    constructor(      
    ) {
        
    }
    ngOnInit() {
      
        var enableRecordings = false;
        this.connection = new RTCMultiConnection('',{},io);
        // its mandatory in v3
        this.connection.enableScalableBroadcast = true;

        // each relaying-user should serve only 1 users
        this.connection.maxRelayLimitPerUser = 1;
        // comment-out below line if you do not have your own socket.io server
        this.connection.socketURL = "http://localhost:9001/";

        this.connection.socketMessageEvent = 'scalable-media-broadcast-demo';

        this.connection.connectSocket( (socket)=> {
            socket.on('logs',  (log)=> {
                console.log(log)
                // document.querySelector('h1').innerHTML = log.replace(/</g, '----').replace(/>/g, '___').replace(/----/g, '(<span style="color:red;">').replace(/___/g, '</span>)');
            });
            // this event is emitted when a broadcast is already created.
            socket.on('join-broadcaster', (hintsToJoinBroadcast) =>{
                console.log('join-broadcaster', hintsToJoinBroadcast);
                this.connection.session = hintsToJoinBroadcast.typeOfStreams;
                this.connection.sdpConstraints.mandatory = {
                    OfferToReceiveVideo: !!this.connection.session.video,
                    OfferToReceiveAudio: !!this.connection.session.audio
                };
                this.connection.broadcastId = hintsToJoinBroadcast.broadcastId;
                this.connection.join(hintsToJoinBroadcast.userid);
            });

            socket.on('rejoin-broadcast', (broadcastId)=>{
                console.log('rejoin-broadcast', broadcastId);
                this.connection.attachStreams = [];
                socket.emit('check-broadcast-presence', broadcastId, (isBroadcastExists) =>{
                    if (!isBroadcastExists) {
                        // the first person (i.e. real-broadcaster) MUST set his user-id
                        this.connection.userid = broadcastId;
                    }
                    socket.emit('join-broadcast', {
                        broadcastId: broadcastId,
                        userid: this.connection.userid,
                        typeOfStreams: this.connection.session
                    });
                });
            });


            socket.on('broadcast-stopped', function (broadcastId) {
                // alert('Broadcast has been stopped.');
                // location.reload();
                console.error('broadcast-stopped', broadcastId);
                alert('This broadcast has been stopped.');
            });

            // this event is emitted when a broadcast is absent.
            socket.on('start-broadcasting', (typeOfStreams) =>{
                console.log('start-broadcasting', typeOfStreams);
                // host i.e. sender should always use this!
                this.connection.sdpConstraints.mandatory = {
                    OfferToReceiveVideo: false,
                    OfferToReceiveAudio: false
                };
                this.connection.session = typeOfStreams;
                // "open" method here will capture media-stream
                // we can skip this function always; it is totally optional here.
                // we can use "connection.getUserMediaHandler" instead
                this.connection.open(this.connection.userid);
            });



        })

        // var videoPreview = document.getElementById('video-preview');



        this.connection.onstream = (event)=> {
        this.videoPreview = document.getElementById('video-preview');

            console.log(event)
            this.videoPreview.srcObject = event.stream;
             this.videoPreview.play();
        };



    }
    buttonClick() {
        console.log('JOIN')
        console.log(this.connection.userid)
        this.connection.extra.broadcastId = broadcastId;

        this.connection.session = {
            audio: true,
            video: true,
            oneway: true
        };

        var socket = this.connection.getSocket();

        socket.emit('check-broadcast-presence', broadcastId, (isBroadcastExists)=> {
            if (!isBroadcastExists) {
                // the first person (i.e. real-broadcaster) MUST set his user-id
                this.connection.userid = broadcastId;
            }
    
            console.log('check-broadcast-presence', broadcastId, isBroadcastExists);
    
            socket.emit('join-broadcast', {
                broadcastId: broadcastId,
                userid: this.connection.userid,
                typeOfStreams: this.connection.session
            });
        })
    };

    

}