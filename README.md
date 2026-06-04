# SafeDrive

SafeDrive is an Expo mobile app that uses phone motion sensors to detect risky driving behavior during a drive session. It starts every drive at a score of 100, listens to live sensor data, detects driving events, applies score penalties, and shows a session dashboard.

## Submission Links

- Public GitHub repository: add your repository link here
- Demo video: add your demo video link here

## Tech Stack

- Expo SDK 55
- React Native 0.83
- Expo Router
- TypeScript
- `expo-sensors`
- `expo-location`
- `@react-native-async-storage/async-storage`
- `@expo-google-fonts/geist-mono`
- Gemini API through REST `fetch` for AI-generated feedback

## Sensors Used

- Accelerometer: raw acceleration in g units on x, y, and z axes.
- Gyroscope: device rotation in radians per second.
- Device Motion: gravity-adjusted acceleration and rotation rate.
- Magnetometer: optional heading estimate for turn detection.
- Location: foreground GPS route points for route replay and event heatmap.

The app checks sensor availability before starting a drive. Sensor listeners are created only while a drive is active and are removed when the drive ends or resets.

## How The App Works

Main files:

- `src/app/(tabs)/_layout.tsx`: bottom navigation bar using Expo Router `Tabs`, with a side theme toggle button.
- `src/app/(tabs)/index.tsx`: Drive tab composition. The score panel, controls, and timeline live in feature components.
- `src/app/(tabs)/sensors.tsx`: Live Sensors tab composition. Visual sensor cards live in feature components.
- `src/app/(tabs)/analytics.tsx`: Analytics tab composition. Event chart, latest events, and session summary are feature components.
- `src/app/(tabs)/thresholds.tsx`: Thresholds tab showing detection rules, penalties, and cooldowns.
- `src/shared/components/AppScreen.tsx`: shared safe-area, status-bar, responsive-width, and page-header wrapper.
- `src/shared/components/AccordionCard.tsx`: shared accordion card pattern.
- `src/shared/navigation/FloatingTabBar.tsx`: custom floating pill tab bar and theme toggle.
- `src/shared/utils`: formatting and numeric helpers used across screens.
- `src/theme.tsx`: shared light/dark theme tokens, navigation theme bridge, and System UI background handling.
- `src/fontDefaults.ts`: app-wide Geist Mono font family defaults for `Text` and `TextInput`.
- `src/features/driveAnalysis/DriveSessionContext.tsx`: shares one active drive session across all tabs.
- `src/features/driveAnalysis/useDriveSession.ts`: starts sensors, stops sensors, updates elapsed time, and sends samples to detection logic.
- `src/features/driveAnalysis/detection.ts`: converts sensor readings into useful telemetry and detects events.
- `src/features/driveAnalysis/thresholds.ts`: all thresholds, cooldowns, labels, and penalties.
- `src/features/driveAnalysis/scoring.ts`: score, rating, breakdown, and feedback helpers.
- `src/features/driveAnalysis/aiFeedback.ts`: sends the completed session summary to Gemini and returns AI feedback.
- `src/features/driveAnalysis/hooks/useAiDrivingFeedback.ts`: manages AI feedback loading, validation, retry, and silent fallback.
- `src/features/driveAnalysis/historyStorage.ts`: stores completed drive summaries locally with AsyncStorage.
- `src/features/driveAnalysis/components`: feature-specific Drive, Analytics, and Sensor UI components.

Important Expo sensor functions used:

- `Sensor.isAvailableAsync()`: checks whether the device supports that sensor before subscribing.
- `Sensor.requestPermissionsAsync()`: asks for motion sensor permission where the platform requires it.
- `Sensor.setUpdateInterval(100)`: requests a 100 ms update interval, about 10 samples per second.
- `Sensor.addListener(callback)`: starts receiving sensor readings.
- `subscription.remove()`: stops receiving readings and prevents battery drain or memory leaks.

Important Expo Location functions used:

- `Location.requestForegroundPermissionsAsync()`: asks permission to record route points only while the app is open.
- `Location.getCurrentPositionAsync()`: captures the starting route point.
- `Location.watchPositionAsync()`: records route points during an active drive.
- `locationSubscription.remove()`: stops GPS tracking when the drive ends or resets.

Important React functions used:

- `useState`: stores UI state such as score, events, elapsed time, and current readings.
- `useRef`: stores fast-changing sensor values without forcing a re-render for every sensor sample.
- `useCallback`: keeps start/end/process functions stable between renders.
- `useMemo`: recalculates derived values such as score and feedback only when their inputs change.
- `useWindowDimensions`: reads the live screen width so the dashboard can change card widths, content width, and compact layouts on smaller phones.

## AI-Generated Feedback

AI feedback is implemented as a stretch goal. After a drive is completed, the Analytics tab sends this session data to Gemini:

- duration
- score
- safety rating
- total event count
- event breakdown
- latest event details

The app asks Gemini for a short 2-3 sentence coaching summary. If the API key is missing or the request fails, the app automatically falls back to the local rule-based feedback from `getFeedback(score, breakdown)`.

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

Expo only exposes environment variables to app code when they use the `EXPO_PUBLIC_` prefix. Because this is a mobile client, this key is bundled into the app and should be treated as public. For a production app, call Gemini from a backend server instead of directly from React Native.

## Event Detection Strategy

The app assumes the phone is mounted securely in portrait orientation, with the top of the phone pointing toward the front of the vehicle. This is important because accelerometer and motion values are device-axis based, not vehicle-axis based.

Device Motion acceleration is preferred for driving acceleration because it removes gravity. The accelerometer is still displayed and used for raw movement detection. Gyroscope data is used for steering and phone handling. Magnetometer data is optional and improves sharp turn detection when available.

Each event type has a cooldown window so one real-world action does not create many duplicate events from consecutive sensor samples.

## Thresholds

| Event | Threshold | Penalty |
| --- | --- | --- |
| Harsh Braking | forward acceleration <= -0.42 g | -5 |
| Harsh Acceleration | forward acceleration >= 0.42 g | -5 |
| Sharp Turn | lateral acceleration >= 0.50 g or heading change >= 14 deg/sample | -3 |
| Aggressive Steering | yaw rotation >= 2.2 rad/s | -4 |
| Excessive Device Movement | raw acceleration >= 1.65 g or linear acceleration >= 1.15 g | -4 |
| Possible Phone Handling | linear acceleration >= 0.65 g plus rotation >= 3.1 rad/s or 170 deg/s | -10 |

Cooldowns:

- Harsh braking: 2500 ms
- Harsh acceleration: 2500 ms
- Sharp turn: 1800 ms
- Aggressive steering: 1500 ms
- Excessive movement: 2200 ms
- Phone handling: 4500 ms

These thresholds are intentionally conservative for a class project. Real insurance telematics systems normally calibrate orientation, vehicle speed, GPS, road grade, and driver profile before scoring.

## Score Calculation

Every drive starts at 100.

```ts
score = Math.max(0, 100 - totalEventPenalties)
```

Safety rating:

- 90 to 100: Excellent
- 75 to 89: Good
- 60 to 74: Caution
- 0 to 59: High Risk

## Dashboard

The dashboard shows:

- Drive duration
- Total detected events
- Sensor availability count
- Live accelerometer, gyroscope, device motion, and magnetometer readings
- Event breakdown
- Route replay from foreground GPS points
- Event heatmap using event locations
- Driving score
- Safety rating
- Session feedback
- Event timeline
- Historical comparison using saved drive summaries

## Stretch Goals Implemented

- Route Replay: foreground GPS points are captured during the drive and drawn as an SVG route.
- Event Timeline: latest detected events are shown in Home and Analytics.
- Event Heatmap: detected events with GPS points are rendered as colored intensity dots on the route.
- AI-generated driving feedback: Gemini generates a short coaching summary after the drive ends.
- Historical drive comparison: completed drive summaries are saved locally with AsyncStorage and compared in Analytics.

## How To Run Locally

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Run on a physical phone with Expo Go for best results. Simulators often do not provide realistic sensor data.

If you add or change `.env`, restart Expo so the environment variable is loaded again.

## Demo Video Checklist

Show these items in your recording:

- Start Drive button
- Live sensor readings changing
- Harsh braking or movement event detection
- Score decreasing after events
- End Drive button
- Dashboard summary and event breakdown
- Route replay after location permission is granted
- Event heatmap after route points and events are captured
- AI session feedback in Analytics, with silent local fallback if Gemini is unavailable
- Historical comparison after completing multiple drives
- Threshold explanation from this README
- Code walkthrough of `useDriveSession.ts`, `detection.ts`, `thresholds.ts`, `historyStorage.ts`, `useAiDrivingFeedback.ts`, and `aiFeedback.ts`

## Assumptions

- The phone is mounted, not loose in the driver's hand.
- The phone is in portrait orientation.
- The top of the phone points toward the vehicle's front.
- Sensor readings are sampled at 100 ms for a balance of responsiveness and battery usage.
- GPS route points are sampled every 20 meters or about every 3 seconds while driving.
- This project detects likely events from phone sensors only. It does not know true vehicle speed or road conditions.

## Screenshots

Add screenshots of the dashboard before submission.
