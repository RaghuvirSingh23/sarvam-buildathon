# Drishti

A Sarvam-aligned visual chat prototype for iPhone. The conversation composer
stays at the bottom, the camera opens only after a user gesture, and a captured
photo can be attached to the next message.

## Run on an iPhone

This project targets Expo SDK 54 so it can run in the current Expo Go app on a
physical iPhone.

```bash
npm install
npm start
```

Install Expo Go from the iOS App Store, keep the Mac and iPhone on the same
network, and scan the QR code shown by Expo. If local discovery is blocked:

```bash
npx expo start --tunnel
```

The camera requires a physical device. On first use, tap the camera control and
allow access. The iOS Simulator cannot provide the same camera validation.

For a locally signed development build on a connected iPhone:

```bash
npx expo run:ios --device
```

That route requires Xcode, an Apple account configured for signing, and
Developer Mode on the iPhone.

## What is implemented

- fixed bottom chat composer with multiline input;
- camera open/close toggle;
- camera-only permission, denial, Settings-return, and retry states;
- live rear/front camera switching;
- real photo capture and attachment preview;
- cleanup for abandoned temporary captures;
- local chat messages and an explicitly non-live placeholder response;
- keyboard and safe-area handling;
- 390 px phone and wide-layout support;
- accessible labels and 44 px minimum interactive targets.

The Sarvam inference endpoint is intentionally not mocked. Connect the live
request inside `sendMessage` in `App.tsx`.

## Brand mode

This is **Sarvam-aligned**, not officially Sarvam-branded. It uses the recorded
color, spacing, radius, hierarchy, and motion logic, while using an original
Drishti identity and openly licensed substitutes:

- DM Serif Display for display type;
- Manrope for body and interface type;
- IBM Plex Mono for metadata.

No Sarvam logo, customer mark, protected artwork, or restricted font binary is
included. The app imports its colors from
`src/theme/sarvam-theme.tokens.json`; the paired CSS snapshot is kept in the
same directory for the repository validator.

## Checks

```bash
npm run check
npm run doctor
npm run export:ios
```
