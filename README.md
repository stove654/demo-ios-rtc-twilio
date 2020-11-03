# Purpose of this Repo
- The app does not have any UI.  
- It is only created to help troubleshoot current errors with iOSRTC and Twilio (https://github.com/cordova-rtc/cordova-plugin-iosrtc/issues/592)
- When app starts it connects to twilio and errors are shown in Xcode logs



## Tested Enviroment
- `npm install cordova@10.0.0`
- Node 12.4.0
- If running on a mac ensure you have cocoaPods installed

## Setup
- Add Platform  `Cordova platform add ios`

- Set developement team - open `HelloCordova.xcworkspace` in Xcode and select development team

- Build ios `Cordova build ios`
