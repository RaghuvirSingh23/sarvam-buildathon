# Voice Note

A focused iPhone voice recorder with a Sarvam-aligned visual treatment. Tap the
large microphone once to record and again to stop. Each completed recording is
moved from temporary storage into the app's local document directory.

## Run it on an iPhone

1. Install [Expo Go](https://expo.dev/go) from the App Store.
2. In this directory, run `npm install` and then `npm start`.
3. Keep the Mac and iPhone on the same network.
4. Scan the QR code with the iPhone Camera app and open it in Expo Go.
5. Allow microphone access on the first recording.

This project deliberately uses Expo SDK 54 so it can run in the current
physical-device version of Expo Go during the SDK 57 transition.

## Recording and privacy

- Audio is recorded as high-quality AAC in an `.m4a` container.
- Files stay inside this app's local document directory.
- The app has no upload, API, analytics, playback, or transcription behavior.
- Leaving the app while recording stops and saves the recording.
- Removing Expo Go or clearing its data may remove locally stored development
  recordings. A standalone build will have its own app storage.

## Design provenance

The `#F9730C → #FFB053 → #A5BBFC → #F4F7FF` radial spectrum and
`#A5BBFC → #D5E2FF` atmosphere reproduce the live Sarvam desktop hero
background observed on 26 July 2026. Supporting black, off-white, orange, and
indigo values come from the repository's dated public-web token snapshot.
Sarvam's proprietary fonts, logo, and artwork are not included. The iOS build
uses the system-provided Avenir Next and Menlo faces as substitutes.

The CSS and JSON files in `src/theme/` retain the complete research snapshot for
validator traceability; the native runtime tokens live in `src/theme.ts`.

## Checks

```sh
npm run check
npm run doctor
npm run export:ios
npm run validate:theme
```
