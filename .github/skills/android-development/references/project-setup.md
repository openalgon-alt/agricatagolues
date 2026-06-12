# Project Setup Guide

## Creating a New Android Project

### Option 1: Using Android Studio (Recommended)

1. **Launch Project Creation:**
   - Android Studio → New Project → Phone and Tablet
   - Choose template: Empty Activity or Navigation Activity
   - Name: `YourAppName`
   - Package name: `com.yourcompany.yourapp`
   - Save location: your workspace

2. **Configure Project:**
   - **Language:** Kotlin
   - **Minimum API:** 24 (Android 7.0) - supports ~95% of devices
   - **Target API:** 34 (Android 14) - latest stable
   - **Build system:** Gradle with KTS

### Directory Structure

```
MyApp/
├── .github/
│   └── workflows/           # CI/CD pipelines
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/com/yourcompany/yourapp/
│   │   │   │   ├── data/
│   │   │   │   │   ├── local/          # Room database
│   │   │   │   │   ├── remote/         # API services
│   │   │   │   │   └── repository/     # Repository pattern
│   │   │   │   ├── domain/
│   │   │   │   │   ├── model/          # Business entities
│   │   │   │   │   └── usecase/        # Business logic
│   │   │   │   ├── ui/
│   │   │   │   │   ├── screen/         # Composables
│   │   │   │   │   ├── viewmodel/      # ViewModels
│   │   │   │   │   ├── component/      # Reusable components
│   │   │   │   │   └── theme/          # Material theme
│   │   │   │   └── MainActivity.kt
│   │   │   ├── res/
│   │   │   │   ├── drawable/           # Icons, images
│   │   │   │   ├── values/             # Colors, strings, dimens
│   │   │   │   └── xml/                # Preferences, configs
│   │   │   └── AndroidManifest.xml
│   │   ├── test/                       # Unit tests
│   │   └── androidTest/                # UI tests
│   ├── build.gradle.kts                # App-level dependencies
│   └── proguard-rules.pro              # Obfuscation rules
├── gradle/
│   └── libs.versions.toml              # Centralized versions
├── build.gradle.kts                    # Project-level config
├── local.properties                    # Local SDK path
└── settings.gradle.kts                 # Module definitions
```

## Essential Dependencies

### build.gradle.kts (app-level)

```kotlin
android {
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.yourcompany.yourapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }

    kotlinOptions {
        jvmTarget = "11"
    }
}

dependencies {
    // Jetpack Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    implementation("androidx.activity:activity-compose:1.8.1")
    
    // Compose (Modern UI Framework)
    implementation(platform("androidx.compose:compose-bom:2023.10.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.5")
    
    // Dependency Injection (Hilt)
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    
    // Database (Room)
    implementation("androidx.room:room-runtime:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    
    // Data Storage
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // Network
    implementation("com.squareup.retrofit2:retrofit:2.10.0")
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
    implementation("com.squareup.retrofit2:converter-kotlinx-serialization:2.10.0")
    
    // Image Loading
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Logging
    implementation("com.jakewharton.timber:timber:5.0.1")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("androidx.arch.core:core-testing:2.2.0")
    
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.10.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}
```

## Android Manifest Configuration

### AndroidManifest.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Required Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <!-- Add runtime permissions as needed -->

    <!-- Feature Declarations -->
    <uses-feature
        android:name="android.hardware.camera"
        android:required="false" />

    <application
        android:name=".MyApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.MyApp"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.MyApp">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Content Providers, Services, Broadcast Receivers -->

    </application>

</manifest>
```

## Gradle Sync & Build

```bash
# Sync Gradle files
./gradlew --refresh-dependencies

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Run on emulator/device
./gradlew installDebug
```

## IDE Setup in Android Studio

1. **Configure SDK Path:**
   - File → Project Structure → SDK Location
   - Ensure Android SDK path is set

2. **Enable Build Cache (optional but recommended):**
   - gradle.properties → `org.gradle.caching=true`

3. **Code Style:**
   - Settings → Editor → Code Style → Kotlin
   - Apply IDE default (enforces consistent formatting)

4. **Emulator Setup (if developing without device):**
   - AVD Manager → Create Virtual Device
   - Choose: Pixel 6 Pro or Pixel Tablet
   - Select API level 34
   - Allocate 4GB+ RAM to emulator

## Version Control Setup

### .gitignore

```
# Build files
build/
.gradle/
*.apk
*.aab

# Local properties
local.properties

# IDE
.idea/
*.iml
.DS_Store

# Gradle
gradle-wrapper.jar
```

## First Build & Run

```bash
# Navigate to project root
cd MyApp

# Sync project
./gradlew clean

# Build debug
./gradlew assembleDebug

# Run on connected device/emulator
./gradlew installDebug
adb shell am start -n com.yourcompany.yourapp/.MainActivity
```

## Common Setup Issues

| Issue | Solution |
|-------|----------|
| `SDK not found` | Add local.properties: `sdk.dir=/path/to/android/sdk` |
| `Gradle sync fails` | Run `./gradlew --stop` then sync again |
| `Dependency resolution fails` | Check internet connection, clear Gradle cache |
| `Kotlin version mismatch` | Ensure Kotlin and Compose compiler versions align |

## Next Steps

- Set up your app theme in [Material Design Theme](./theme-setup.md)
- Configure your data layer with Room (see Architecture guide)
- Begin building UI screens with Compose
