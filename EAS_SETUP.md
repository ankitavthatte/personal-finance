# Shipping the native Pennywise app

The features in `app/` and `src/` — recurring, categories, accounts, goals,
theme, backup, app lock — live in the **React Native (Expo) app**. GitHub Pages
only publishes the `web/` prototypes, so it never ships these. The native app
reaches phones through an **Expo Application Services (EAS) build**.

This repo already contains everything except the two things that require *your*
Expo account: a project id and an access token.

## One-time setup

1. **Create an Expo account** at <https://expo.dev> (free).

2. **Link this project** — from a checkout of the repo, run:

   ```bash
   npm install
   npx eas-cli login
   npx eas init
   ```

   `eas init` adds `expo.extra.eas.projectId` to `app.json`. Commit that change.

3. **Add a build token to GitHub** so CI can build without a browser login:
   - In Expo: **Account → Settings → Access tokens → Create token**.
   - In GitHub: **Repo → Settings → Secrets and variables → Actions → New
     repository secret**, name it `EXPO_TOKEN`, paste the token.

## Building

### From CI (no local tooling)
Go to **Actions → “EAS Build (native app)” → Run workflow**, pick a platform
(`android` / `ios` / `all`) and a profile (`preview` for a shareable test build,
`production` for a store build). The job kicks off the build on EAS and prints a
link to follow it.

### From your machine
```bash
npx eas build --platform android --profile preview    # shareable .apk
npx eas build --platform ios --profile production      # App Store build
```

## Getting it to users

- **`preview` profile** → an internal/`.apk` build you can install directly or
  share via a link (good for trying it on a device now).
- **`production` profile** → a store build. Submit it with:

  ```bash
  npx eas submit --platform ios --profile production
  npx eas submit --platform android --profile production
  ```

  (iOS needs an Apple Developer account; Android needs a Play Console account.)

## Notes
- `app.json` already sets the bundle id / package (`com.pennywise.app`). Change
  it if that identifier is taken.
- The build profiles live in `eas.json`.
