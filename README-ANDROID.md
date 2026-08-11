# Real Navigation Pro — Android APK project

This is an Android Studio/Gradle project that wraps the navigation UI in a native Android WebView.
It requests GPS permission and supports JavaScript, DOM storage and browser geolocation.

## Important: TomTom key
Do NOT put your TomTom secret key into the APK or app.js.
The navigation app calls your backend:
- /api/geocode
- /api/route
- /api/incidents
- /traffic/...

Deploy the Node backend from the original `real-navigation-pro` project to HTTPS, then set the API base URL in the Android WebView's localStorage or replace the `API_BASE` line in `app.js`.

## Building on a phone
Use an Android-compatible build environment such as Termux + a compatible Gradle/JDK setup, or AndroidIDE. Open/import this folder as a Gradle Android project and build the debug APK.

The output is normally:
app/build/outputs/apk/debug/app-debug.apk

## Current features included from the web build
- Real OSM map
- TomTom routing backend integration
- Traffic overlay proxy
- GPS
- Alternative routes
- Turn-by-turn panel
- Dijkstra/A* comparison
- Mobile responsive UI

A true production navigation app should add a foreground navigation service, background location permission, offline map strategy, route snapping, audio focus, notification controls, secure backend auth/rate limiting, and a production routing/traffic contract.


## V2 navigation upgrades
- Android foreground navigation service
- Background location permission declaration
- Persistent navigation notification
- Native Android Text-to-Speech bridge (Sinhala locale when available)
- Browser speech fallback
- Navigation start/stop hooks from the UI

## Production note
Background GPS should be implemented with a fused-location provider and route snapping/recalculation in a production build. Android version/permission policies can change. The foreground service is included as the correct app architecture, but the sample service does not yet calculate GPS positions itself.


## V3 real GPS/navigation layer
- Native Android GPS foreground service emits real location updates.
- WebView receives latitude/longitude/speed/bearing/accuracy.
- Navigation marker updates from native GPS.
- Off-route detection (>80 m) triggers a TomTom route recalculation from current GPS.
- Arrival detection stops navigation and speaks an arrival message.
- Next instruction panel follows progress along the active route.
- API backend URL can be configured from the ⚙ API button and is stored locally.

### Security
The TomTom key remains on the Node backend. The APK never contains the secret key.
Use HTTPS for the backend in production.

### Important production considerations
This V3 implements the core native GPS + reroute loop. A production navigation app should additionally use Android's Fused Location Provider, foreground-service policy compliance, route map matching, maneuver geometry, persistent notification actions, battery optimization handling, offline fallback, crash reporting, and secure authenticated backend endpoints.


## V4 production-oriented upgrades
- Google Fused Location Provider for smoother GPS and better power behavior.
- Foreground service location updates at ~1.5s / 2m thresholds.
- Battery-optimization exemption request to reduce background GPS suspension (user/system policy still applies).
- Persistent notification with navigation entry point.
- Local shell service worker for cached UI assets when offline.
- Route-point snapping, heading-aware maneuver hints and debounced voice.
- Automatic reroute cooldown to prevent route-request loops.
- Arrival detection and navigation shutdown.
- Native GPS data remains separate from the web map, allowing the UI to survive brief web-layer issues.

### Still requires an online backend for live routing/traffic
The app can cache its UI shell, but live TomTom geocoding/routing/traffic requires network access. Do not claim offline maps are available until map tiles and route graph data are bundled or downloaded explicitly.
