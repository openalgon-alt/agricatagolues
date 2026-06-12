# Publishing to Google Play Store

## Pre-Launch Checklist

### Version Configuration

```gradle
// build.gradle.kts (app)
android {
    defaultConfig {
        versionCode = 1          // Increments: 1, 2, 3...
        versionName = "1.0.0"    // User-facing: 1.0.0, 1.0.1, etc.
        minSdk = 24
        targetSdk = 34
    }
}
```

**Versioning Rules:**
- versionCode: Must increment with every release
- versionName: Semantic versioning (MAJOR.MINOR.PATCH)

### App Signing Key

**Create signing key (one-time):**

```bash
# Android Studio: Build → Generate Signed Bundle/APK
# OR use keytool:

keytool -genkey -v -keystore ~/my-app.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-app-key

# Store safely! You'll need this for all future updates
```

**Keep Safe:**
```
Store password: secure
Key password: secure
Key alias: my-app-key
Location: ~/my-app.jks

# ⚠️ Lose this → Can't update app forever
```

### Build Release Bundle/APK

```bash
# Build Android App Bundle (recommended for Play Store)
./gradlew bundleRelease

# Or APK (older method, larger size)
./gradlew assembleRelease

# Output: app/build/outputs/bundle/release/ or .../apk/release/
```

### Test Thoroughly

**Test on Multiple Devices:**
- Phone: Pixel 6 (6.1" 1080p)
- Phone: Low-end device (API 24)
- Tablet: iPad mini or Nexus 7
- Screen sizes: 4.5", 5.5", 6.7", 10"

**Test Critical Flows:**
- [ ] App launches without crash
- [ ] Login/authentication works
- [ ] Core features work
- [ ] Network requests work
- [ ] Offline mode (if applicable)
- [ ] Permissions requested properly
- [ ] Orientation changes don't crash

**Run Lint:**
```bash
./gradlew lint

# Output: app/build/reports/lint-results.html
# Fix any errors/warnings
```

### Manifest & Metadata

**AndroidManifest.xml:**
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    android:versionCode="1"
    android:versionName="1.0.0">
    
    <!-- Essential permissions only -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Declare features -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    
    <application
        android:name=".MyApplication"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:usesCleartextTraffic="false">
        <!-- Activities, Services -->
    </application>
</manifest>
```

### Privacy Policy & Terms

```
Required for any app that:
- Collects personal data
- Uses advertising
- Uses analytics
- Collects device identifiers

Create at:
- Privacy Policy: privacypolicies.com
- Terms: termsfeed.com

Host on your website & link in Play Store listing
```

## Google Play Store Setup

### Create Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with Google account
3. Pay $25 one-time fee
4. Complete business information

### Create App Listing

1. **New app** → Name, language, type
2. **App access** → Public or restricted
3. **Category** → Choose appropriate category
4. **Rating questionnaire** → Answer questions (affects rating)

### App Screenshots & Promotion

**Screenshots (Required):**
- Minimum 2, maximum 8
- Size: 1080x1920px (9:16 aspect)
- Show key features
- Use text overlays for clarity

**Feature Graphic (Required):**
- Size: 1024x500px
- Promotional banner
- No mandatory text on it

**Icon (Required):**
- Size: 512x512px
- PNG format
- Clear, recognizable

**Promo Video (Optional):**
- YouTube link to 30s promo

### App Description

```
Title (max 50 chars):
"My Awesome App"

Short Description (max 80 chars):
"Manage tasks efficiently and stay organized"

Full Description (max 4000 chars):
Key features:
• Feature 1 description
• Feature 2 description
• Feature 3 description

Permissions explained:
- INTERNET: For syncing data
- CAMERA: For photo uploads

Contact:
Email: support@example.com
Website: www.example.com
```

### Content Rating Questionnaire

Answer questions about app content:
- Violence
- Sexual content
- Profanity
- Alcohol/tobacco
- Gambling

This determines rating (Everyone, Teen, Mature, etc.)

## Uploading to Play Store

### Upload Bundle/APK

1. **Google Play Console** → Your app → Release → Production
2. **Create new release** → Upload AAB/APK
3. **Release notes** → Describe changes
4. **Submit for review**

Example Release Notes:
```
Version 1.0.0
- Initial release
- Support for Android 7.0+
```

### Google Play Review

**Typical Wait:** 2-4 hours (usually faster)

**Review Checks:**
- Crashes on startup
- Permissions justified
- No malware/deceptive practices
- Content matches rating
- Privacy policy valid

**Common Rejection Reasons:**
- Crash on launch
- Misleading description
- Privacy policy missing
- Inappropriate content for age rating

## Staged Rollout (Recommended)

Gradually release to users to catch issues early:

1. **5% rollout** → 24 hours
   - Monitor crashes, reviews
   - If issues, fix & revert

2. **25% rollout** → 24-48 hours
   - Wider testing
   - Check metrics

3. **100% rollout**
   - Release to all users

```
Google Play Console → Release → Staged rollout → % slider
```

## Post-Launch Monitoring

### Firebase Crashlytics (Recommended)

```kotlin
// build.gradle.kts
plugins {
    id("com.google.gms.google-services")
    id("com.google.firebase.crashlytics")
}

dependencies {
    implementation("com.google.firebase:firebase-crashlytics-ktx:18.5.1")
}

// Automatically logs crashes
// View in Firebase Console → Crashlytics
```

### Google Play Console Analytics

- **User Acquisition:** New installs over time
- **Ratings & Reviews:** Monitor user feedback
- **Crashes & ANRs:** Google Play captures some crashes
- **Performance:** Battery impact, RAM usage
- **Retention:** % users returning

## Version Updates

### Increment Version Code

```gradle
// Each release MUST increment versionCode
android {
    defaultConfig {
        versionCode = 2  // Was 1
        versionName = "1.0.1"
    }
}
```

### Release Notes for Updates

```
Version 1.0.1 - Bug Fixes
- Fixed crash on login
- Improved performance
- Better error messages

Version 1.0.2 - UI Improvements
- Redesigned home screen
- New dark theme
- Fixed typos
```

## Distribution Channels

### Google Play (Primary)
- 90% of Android users
- Largest audience
- Best for monetization

### Alternative Stores (Optional)
- Samsung Galaxy Store
- Amazon Appstore
- Huawei AppGallery

### Direct APK Distribution (Not Recommended)
- Harder to update
- No security scanning
- Poor user experience

## Monetization Options

### Free with Ads
```kotlin
// Add Google Mobile Ads
dependencies {
    implementation("com.google.android.gms:play-services-ads:22.6.0")
}

// Add ad view to layout
<com.google.android.gms.ads.AdView
    android:id="@+id/adView"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_alignParentBottom="true"
    android:layout_centerHorizontal="true"
    app:adSize="BANNER"
    app:adUnitId="ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy" />
```

### Paid App
- Set price in Play Console
- One-time purchase
- Higher conversion for serious apps

### In-App Purchases
- Premium features
- One-time unlocks
- Subscriptions

```kotlin
dependencies {
    implementation("com.android.billingclient:billing-ktx:6.0.0")
}
```

## Troubleshooting Publication

| Issue | Solution |
|-------|----------|
| "App crashes on launch" | Test on multiple devices, check API level |
| "APK too large" | Enable minification, shrink resources |
| "Rejected: misleading" | Ensure description matches functionality |
| "Missing privacy policy" | Add policy URL to listing |
| "Insufficient content" | Add more screenshots, description |

## Post-Launch Maintenance

- **Monitor crashes** in Firebase/Play Console
- **Read reviews** weekly, respond to feedback
- **Update** for OS changes (new API levels)
- **Add features** based on user requests
- **Keep dependencies** updated
