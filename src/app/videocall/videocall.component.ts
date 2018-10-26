import { Component, OnInit } from '@angular/core';
declare var RTCMultiConnection;
import * as io from 'socket.io-client';
import * as $ from 'jquery';

@Component({
  selector: 'app-videocall',
  templateUrl: './videocall.component.html',
  styleUrls: ['./videocall.component.css']
})
export class VideocallComponent implements OnInit {
  publicRoomIdentifier:any;
  connection:any;

  constructor() { }

  ngOnInit() {
         this.publicRoomIdentifier = 'dashboard';
        this.connection = new RTCMultiConnection('my-room',{},io);
        this.connection.socketURL =  "http://localhost:9001/";
        this.connection.publicRoomIdentifier = this.publicRoomIdentifier;
        this.connection.socketMessageEvent = this.publicRoomIdentifier;
        // keep room opened even if owner leaves
        this.connection.autoCloseEntireSession = true;
        this.connection.connectSocket((socket) => {
          this.looper();
            socket.on('disconnect', function() {
                location.reload();
            });
        });
  }
  looper() {
    if (!$('#rooms-list').length) return;
    this.connection.socket.emit('get-public-rooms', this.publicRoomIdentifier,(listOfRooms) => {
        this.updateListOfRooms(listOfRooms);
    });
}
 updateListOfRooms(rooms) {
        $('#active-rooms').html(rooms.length);
        $('#rooms-list').html('');
        if (!rooms.length) {
            $('#rooms-list').html('<tr><td colspan=9>No active room found for this demo.</td></tr>');
            return;
        }
        rooms.forEach((room, idx) =>{
          var tr = document.createElement('tr');
          var html = '';
          html += '<td>' + (idx + 1) + '</td>';
          html += '<td><span class="max-width" title="' + room.sessionid + '">' + room.sessionid + '</span></td>';
          html += '<td><span class="max-width" title="' + room.owner + '">' + room.owner + '</span></td>';
          html += '<td>';
          Object.keys(room.session || {}).forEach(function(key) {
              html += '<pre><b>' + key + ':</b> ' + room.session[key] + '</pre>';
          });
          html += '</td>';
          html += '<td><span class="max-width" title="' + JSON.stringify(room.extra || {}).replace(/"/g, '`') + '">' + JSON.stringify(room.extra || {}) + '</span></td>';
          html += '<td>';
          room.participants.forEach(function(pid) {
              html += '<span class="userinfo"><span class="max-width" title="' + pid + '">' + pid + '</span></span><br>';
          });
          html += '</td>';
          // check if room is full
          if(room.isRoomFull) {
            // room.participants.length >= room.maxParticipantsAllowed
            html += '<td><span style="border-bottom: 1px dotted red; color: red;">Room is full</span></td>';
          }
          else {
            html += '<td><button class="btn join-room" data-roomid="' + room.sessionid + '">Join</button></td>';
          }
          
          $(tr).html(html);
          $('#rooms-list').append(tr);
          $(tr).find('.join-room').click(function() {
              $(tr).find('.join-room').prop('disabled', true);
              var roomid = $(this).attr('data-roomid');
              $('#txt-roomid-hidden').val(roomid);
              $('#btn-show-join-hidden-room').click();
              $(tr).find('.join-room').prop('disabled', false);
          });
      });
}
join_hidden_room() {
      var roomid = $('#txt-roomid-hidden').val().toString();
      if (!roomid || !roomid.replace(/ /g, '').length) {
          // alert('Please enter room-id.', 'Room ID Is Required');
          return;
      }

      var fullName = $('#txt-user-name-hidden').val().toString();
      if (!fullName || !fullName.replace(/ /g, '').length) {
          this.alertBox('Please enter your name.', 'Your Name Is Required','','');
          return;
      }

      this.connection.extra.userFullName = fullName;

      var initialHTML = $('#btn-join-hidden-room').html();

      $('#btn-join-hidden-room').html('Please wait...').prop('disabled', true);

      this.connection.checkPresence(roomid, (isRoomExist) =>{
          if (isRoomExist === false) {
              // this.alertBox('No such room exist on this server. Room-id: ' + roomid, 'Room Not Found','','');
              $('#btn-join-hidden-room').html(initialHTML).prop('disabled', false);
              return;
          }

          this.connection.sessionid = roomid;
          this.connection.isInitiator = false;
          $('#joinRoomModel').modal('hide');
          this.openCanvasDesigner();

          $('#btn-join-hidden-room').html(initialHTML).prop('disabled', false);
      })
};
openCanvasDesigner() {
  $('#startRoomModel').modal('hide');
  window.open('canvas-designer.html?open=' + this.connection.isInitiator + '&sessionid=' + this.connection.sessionid + '&publicRoomIdentifier=' + this.connection.publicRoomIdentifier + '&userFullName=' + this.connection.extra.userFullName);
}
alertBox(message, title, specialMessage, callback) {
    callback = callback || function() {};

    $('.btn-alert-close').unbind('click').bind('click', function(e) {
        e.preventDefault();
        $('#alert-box').modal('hide');
        $('#confirm-box-topper').hide();

        callback();
    });

    $('#alert-title').html(title || 'Alert');
    $('#alert-special').html(specialMessage || '');
    $('#alert-message').html(message);
    $('#confirm-box-topper').show();

    $('#alert-box').modal({
        backdrop: 'static',
        keyboard: false
    });
  }
  create() {
    var roomid = $('#txt-roomid').val().toString();
    if (!roomid || !roomid.replace(/ /g, '').length) {
        this.alertBox('Please enter room-id.', 'Room ID Is Required','','');
        return;
    }

    var fullName = $('#txt-user-name').val().toString();
    if (!fullName || !fullName.replace(/ /g, '').length) {
        this.alertBox('Please enter your name.', 'Your Name Is Required','','');
        return;
    }

    this.connection.extra.userFullName = fullName;

    var initialHTML = $('#btn-create-room').html();

    $('#btn-create-room').html('Please wait...').prop('disabled', true);

    this.connection.checkPresence(roomid, (isRoomExist)=> {
        if (isRoomExist === true) {
            this.alertBox('This room-id is already taken and room is active. Please join instead.', 'Room ID In Use','','');
            return;
        }

        if ($('#chk-hidden-room').prop('checked') === true) {
            // either make it unique!
            // connection.publicRoomIdentifier = connection.token() + connection.token();

            // or set an empty value (recommended)
            this.connection.publicRoomIdentifier = '';
        }

        this.connection.sessionid = roomid;
        this.connection.isInitiator = true;
        // openCanvasDesigner();
        $('#btn-create-room').html(initialHTML).prop('disabled', false);
    });
};
}

