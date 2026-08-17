# Yoshi Camera for Android

A Trusted Web Activity: a thin Android shell that opens
[yoshicamera.com](https://yoshicamera.com) full screen, with no browser
chrome, as an installable Play Store app. It is not a copy of the app — it
loads the live site, so shipping a change to `main` ships it to the app too,
with no store review.

The whole shell is a manifest, a few resources and one dependency. There is
no application code, because there is nothing for it to do.

## Why there is no address bar

A TWA only drops the browser UI if the site proves it trusts this app. That
proof is two matching halves:

- the app names the site, in `res/values/strings.xml` (`assetStatements`)
- the site names the app, in `/.well-known/assetlinks.json` at the repo root

If they don't match, the app still runs but shows a URL bar across the top.
That is the single most common way this goes wrong.

**`.nojekyll` in the repo root exists for this.** GitHub Pages runs Jekyll,
and Jekyll excludes directories beginning with a dot — so without it,
`/.well-known/assetlinks.json` returns 404 and verification silently fails.

## Publishing, in order

1. **Create the app in Play Console** (one-off, £20/$25). Package name must be
   `com.yoshicamera.app`, matching `applicationId` in `app/build.gradle`.

2. **Build the bundle.** Needs the Android SDK:
   ```
   cd android && ./gradlew bundleRelease
   ```
   Output: `app/build/outputs/bundle/release/app-release.aab`

3. **Upload it,** and let Play App Signing manage the key. This is the part
   that trips people up: from here on the fingerprint that matters is
   **Google's**, not your local keystore's.

4. **Copy the fingerprint.** Play Console → *Setup* → *App integrity* →
   *App signing key certificate* → SHA-256. Paste it into
   `/.well-known/assetlinks.json`, replacing
   `REPLACE_WITH_PLAY_APP_SIGNING_SHA256`, and push. It must be live on the
   site before the app is verified.

5. **Check it.** Google's verifier:
   ```
   https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://yoshicamera.com&relation=delegate_permission/common.handle_all_urls
   ```
   Then install and confirm there is no URL bar.

## What this does and does not get you

**Does:** a Play listing, an icon in the launcher, full-screen with no
browser UI, offline via the existing service worker, and updates that ship
from `main` without review.

**Does not:** any new camera capability. A TWA is a Chrome tab without the
furniture, so it sees exactly what the site sees through `getUserMedia` —
the same zoom, torch, focus and exposure the app already asks for. Manual
shutter, RAW and lens selection need a native capture plugin and a real
Android camera pipeline, which this is not.

## Version bumps

`versionCode` in `app/build.gradle` must increase for every upload.
`versionName` is the human-facing string. Neither affects the web app.
