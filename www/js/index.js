/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
var isCordova = !document.URL.includes('http');
var twilioVideoUrl = "https://media.twiliocdn.com/sdk/js/video/releases/2.7.2/twilio-video.js";
var tokenTwilioVideoCall = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzg3NTU5NmQ1MDE4ODVmZTk2MTUyNmY5MzUwN2E2NTE2LTE2MDQzNzQwNjQiLCJpc3MiOiJTSzg3NTU5NmQ1MDE4ODVmZTk2MTUyNmY5MzUwN2E2NTE2Iiwic3ViIjoiQUNlMDM5NGRiMWUwOGI1Y2MwODU4NGQzOTJjZmYzM2E2OSIsImV4cCI6MTYwNDM3NzY2NCwiZ3JhbnRzIjp7ImlkZW50aXR5IjoidGVzdGxvaTExMSIsInZpZGVvIjp7InJvb20iOiJ0ZXNsb2kxMDEifX19.fdHnKbDSXmPOG1J9DeZPgyTOXOoJBORES6QJuhqpDPI"
var roomName = 'testloi101'

if (!isCordova) {
    loadScript(twilioVideoUrl, function () {
        _initWebrtc()
    })
} else {
    document.addEventListener('deviceready', onDeviceReady, false);
}

function loadScript(url, cb) {
    var script = document.createElement('script');
    script.onload = function () {
        //do stuff with the script
        cb()
    };
    script.src = url;
    document.head.appendChild(script); //or something of the likes
}


function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');

    if (window.cordova) {
        window.cordova.plugins.iosrtc.registerGlobals()
        window.cordova.plugins.iosrtc.turnOnSpeaker(true);
    }

    loadScript(twilioVideoUrl, function () {
        _initWebrtc()
    })
}

function _initWebrtc (){
    var Video = Twilio.Video;

    Video.connect(tokenTwilioVideoCall, { name:  roomName}).then(room => {
        console.log('Connected to Room "%s"', room.name);
      
        room.participants.forEach(participantConnected);
        room.on('participantConnected', participantConnected);
      
        room.on('participantDisconnected', participantDisconnected);
        room.once('disconnected', error => room.participants.forEach(participantDisconnected));
    });  
}

function participantConnected(participant) {
    console.log('Participant "%s" connected', participant.identity);
  
    const div = document.createElement('div');
    div.id = participant.sid;
    div.innerText = participant.identity;
  
    participant.on('trackSubscribed', track => trackSubscribed(div, track));
    participant.on('trackUnsubscribed', trackUnsubscribed);
  
    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        trackSubscribed(div, publication.track);
      }
    });
  
    document.body.appendChild(div);
}
  
function participantDisconnected(participant) {
    console.log('Participant "%s" disconnected', participant.identity);
    document.getElementById(participant.sid).remove();
}

function trackSubscribed(div, track) {
    div.appendChild(track.attach());
}

function trackUnsubscribed(track) {
    track.detach().forEach(element => element.remove());
}