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
var tokenTwilioVideoCall = ""
var roomName = 'testloi101'
var urlGetToken = "http://13.250.33.181:3000/api/users/token?identity=" +  Math.random().toString(36).substring(7)

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

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
            tokenTwilioVideoCall = JSON.parse(this.responseText).token

            Video.createLocalTracks().then(tracks => {
                var stream = new MediaStream()

                var localMediaContainer = document.getElementById('local-stream');
                console.log('localMediaContainer', localMediaContainer)
                tracks.forEach(function(track) {
                    stream.addTrack(track.mediaStreamTrack)
                });

                var elLocal = document.getElementById("local-video")
                elLocal.srcObject = stream;
                elLocal.volume = 0;
                try {
                    elLocal.setAttributeNode(document.createAttribute('muted'));
                } catch (e) {
                    elLocal.setAttribute('muted', true);
                }
                console.log('elLocal', elLocal)
                elLocal.play();
                
                Video.connect(tokenTwilioVideoCall, { name:  roomName}).then(room => {
                    console.log('Connected to Room "%s"', room.name);
                  
                    room.participants.forEach(participantConnected);
                    room.on('participantConnected', participantConnected);
                  
                    room.on('participantDisconnected', participantDisconnected);
                    room.once('disconnected', error => room.participants.forEach(participantDisconnected));
                });

                if (window.cordova) {
                    console.log(2222323232)
                    cordova.plugins.iosrtc.refreshVideos();
                }
            });
        }
    };
    xhttp.open("GET", urlGetToken, true);
    xhttp.send();
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
    if (window.cordova) {
        cordova.plugins.iosrtc.refreshVideos();
    }
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