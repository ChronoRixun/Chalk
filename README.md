# Chalk

A game-night scorekeeper for iPhone and Android. Pick a game, add the players, tap to score.
Undo anything, track rounds and the dealer, and see who is winning at a glance.

No ads, no accounts, no internet. Every score stays on your phone.

## Why this app

- **Friends on both platforms use it together, in the same room.** It is the one kind of app a
  mixed iPhone/Android group actually tests as a group.
- **Zero backend.** Nothing to host, nothing to pay for monthly, and the privacy answer on both
  stores is "we collect nothing".
- **Honest $1.99 paid-upfront.** No in-app-purchase code, no receipts, no subscriptions.
- **Small enough to be excellent.** One job, done with care.

## Features (v0.1)

- Presets: Hearts, Spades, Cribbage, Rummy, Gin, Farkle, Uno, Phase 10, Golf, Skull King, Catan,
  Yahtzee, Scrabble, or a free tally
- High-score-wins or low-score-wins, optional "play to" target with an automatic winner banner
- Big tap targets with per-game quick-add chips, a custom amount, and a subtract mode
- Unlimited undo, round tracking, dealer rotation (hold a player to hand them the deal)
- Round-by-round history table and a chronological entry log
- Share standings as text
- Screen stays awake during play, haptics on every tap
- Chalkboard dark theme and cream light theme, following the system setting

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on any iPhone or Android phone. No build, no store, no cable.
For friends who are not on your Wi-Fi, use `npx expo start --tunnel`.

Web preview (for quick UI checks only): `npx expo start --web`.

## Ship it

Everything below is one-time setup per store; after that it is `eas build` and `eas submit`.

### Accounts

| Store | Cost | Gotchas |
|---|---|---|
| Apple App Store | $99/yr (already have) | Sign the **Paid Applications Agreement** and enter banking + tax in App Store Connect before a paid app can be submitted. |
| Google Play | $25 one-time | Identity verification. **New personal developer accounts must run a closed test with at least 12 opted-in testers for 14 continuous days before production access is granted.** Your Android friends are those testers. Start this early. |

Both stores take 15% on the first $1M under their small-developer programs. Apple's requires
enrolling in the Small Business Program; Google's is automatic.

### Before the first upload

- [ ] Replace the placeholder icon (`assets/images/icon.png`, the adaptive icon PNGs, and
      `assets/expo.icon`) and the splash image with real Chalk art. 1024×1024 master.
- [ ] Confirm the bundle id / package name in `app.json` (currently `com.chronorixun.chalk`).
- [ ] Publish a privacy policy page (GitHub Pages works). Both stores require the URL even for
      "we collect nothing".
- [ ] Screenshots: Apple wants 6.9" iPhone shots; Play wants 2–8 phone shots plus a 1024×500
      feature graphic and a 512×512 icon.
- [ ] `npx eas-cli login`, then `eas build:configure` to create `eas.json`.

### Builds and testing

```bash
eas build -p android --profile production
```

```bash
eas build -p ios --profile production
```

```bash
eas submit -p android
```

```bash
eas submit -p ios
```

- Android builds run in the cloud, so no Android SDK is needed on this PC.
- iOS builds run in the cloud too, or locally on the Mac Mini with `--local`.
- **iOS testers:** TestFlight. Internal testers are instant; external testers need a short
  Beta App Review.
- **Android testers:** Play Console → Testing → Closed testing. Add friends' Google accounts to
  the tester list **and** to "License testing" so the paid app is free for them.

### Store listing

- Apple "App Privacy": Data Not Collected.
- Play "Data safety": no data collected or shared.
- Price: $1.99 tier on both.

## Roadmap

- v0.2: edit or reorder players mid-game, per-game quick-add editing, "rematch with same players"
- v0.3: iOS and Android home-screen widget showing the live board
- Later: dice and coin flip, timers for timed rounds, export history as CSV
