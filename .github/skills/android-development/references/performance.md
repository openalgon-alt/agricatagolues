# Performance Optimization Checklist

## Startup Time Optimization

### Cold Start Target: < 2 seconds

**Measurement:**
```bash
# Using adb
adb shell am start -S -W com.yourapp/.MainActivity | grep totalTime

# Android Profiler: Run → Profile → Record CPU
```

### Optimization Strategies

1. **Lazy Initialization**
```kotlin
// ❌ Bad: Initializes on app start
@HiltAndroidApp
class MyApplication : Application() {
    private val heavyObject = HeavyObject()
}

// ✅ Good: Lazy initialization
@HiltAndroidApp
class MyApplication : Application() {
    private val heavyObject by lazy { HeavyObject() }
}
```

2. **Defer Non-Critical Work**
```kotlin
// Move from Application.onCreate() to later
@HiltAndroidApp
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Only critical initialization
        
        // Defer analytics, crash reporting, etc.
        viewModelScope.launch(Dispatchers.Default) {
            initializeAnalytics()
            initializeCrashReporting()
        }
    }
}
```

3. **Use startupPerfTracing**
```kotlin
// gradle/libs.versions.toml
androidx-startup = "1.1.1"

// build.gradle.kts
implementation("androidx.startup:startup-runtime:1.1.1")

// Measure startup using StartupBroadcastReceiver
```

## Memory Management

### Target: < 150MB on average device

**Memory Profiler Steps:**
1. Open Android Studio Profiler
2. Run → Profile → Select app
3. Window → Profiler (Memory tab)
4. Record allocation
5. Force garbage collection (trash icon)
6. Check heap dump

### Common Memory Leaks

```kotlin
// ❌ Bad: Memory leak in listener
class MyActivity : AppCompatActivity() {
    private val listener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent?) {}
        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
    }

    override fun onResume() {
        super.onResume()
        sensorManager.registerListener(listener, sensor, SensorManager.SENSOR_DELAY_UI)
    }
    
    // ❌ Never unregistered!
}

// ✅ Good: Proper listener management
class MyActivity : AppCompatActivity() {
    private val listener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent?) {}
        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
    }

    override fun onResume() {
        super.onResume()
        sensorManager.registerListener(listener, sensor, SensorManager.SENSOR_DELAY_UI)
    }

    override fun onPause() {
        super.onPause()
        sensorManager.unregisterListener(listener)  // Cleanup!
    }
}
```

### Image Memory Optimization

```kotlin
// ❌ Bad: Loads full resolution
val bitmap = BitmapFactory.decodeFile(filePath)
imageView.setImageBitmap(bitmap)

// ✅ Good: Scale to screen size
fun decodeSampledBitmapFromFile(
    filePath: String,
    reqWidth: Int,
    reqHeight: Int
): Bitmap {
    val options = BitmapFactory.Options().apply {
        inJustDecodeBounds = true
    }
    BitmapFactory.decodeFile(filePath, options)

    options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight)
    options.inJustDecodeBounds = false

    return BitmapFactory.decodeFile(filePath, options)
}

private fun calculateInSampleSize(
    options: BitmapFactory.Options,
    reqWidth: Int,
    reqHeight: Int
): Int {
    val height = options.outHeight
    val width = options.outWidth
    var inSampleSize = 1

    if (height > reqHeight || width > reqWidth) {
        val halfHeight = height / 2
        val halfWidth = width / 2

        while (halfHeight / inSampleSize >= reqHeight &&
               halfWidth / inSampleSize >= reqWidth) {
            inSampleSize *= 2
        }
    }
    return inSampleSize
}

// ✅ Or use Coil (handles this automatically)
Image(
    model = imageUrl,
    contentDescription = "User avatar",
    modifier = Modifier.size(48.dp),
    contentScale = ContentScale.Crop
)
```

## Battery Optimization

### WorkManager for Background Tasks

```kotlin
// ❌ Bad: Does work immediately, wastes battery
fun syncDataImmediately() {
    GlobalScope.launch {
        repository.syncData()
    }
}

// ✅ Good: Batches work, respects device state
fun syncDataWithWorkManager() {
    val syncWork = PeriodicWorkRequestBuilder<SyncWorker>(
        15, TimeUnit.MINUTES
    ).setConstraints(
        Constraints.Builder()
            .setRequiresBatteryNotLow(true)
            .setRequiresDeviceIdle(false)
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
    ).build()

    WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        "sync_data",
        ExistingPeriodicWorkPolicy.KEEP,
        syncWork
    )
}

class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        return@withContext try {
            repository.syncData()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
```

### Battery Profiler

```bash
# Enable battery profiler in Profiler window
# Monitor: CPU, Memory, Network, Battery tabs
# Look for: wakelocks, frequent network access, high CPU usage
```

## Rendering Performance (Jank Prevention)

### Target: 60fps (90fps for high-refresh)

**Frame Metrics:**
- Frame rate < 60fps = jank
- Target: 16.67ms per frame (60fps)
- High-refresh: 8.33ms per frame (120fps)

### Profiler Usage

```
Android Profiler → Frames tab:
- Green: On time
- Yellow: Slow frame
- Red: Dropped frame

Click frame → see what took time (rendering, etc.)
```

### Compose Recomposition Optimization

```kotlin
// ❌ Bad: Recomposes entire list on scroll
@Composable
fun ItemList(items: List<Item>) {
    LazyColumn {
        items(items) { item ->
            ItemCard(item)  // Recomposes all on any change
        }
    }
}

// ✅ Good: Only recomposes changed items
@Composable
fun ItemList(items: List<Item>) {
    LazyColumn {
        items(items.size, key = { items[it].id }) { index ->
            ItemCard(items[index])  // Recomposes only if item changed
        }
    }
}

// ✅ Move state out to prevent recomposition
@Composable
fun Screen() {
    var searchText by remember { mutableStateOf("") }

    Column {
        SearchBar(
            text = searchText,
            onTextChange = { searchText = it }  // Only SearchBar recomposes
        )
        ResultsList(searchText)  // Only recomposes if searchText changes
    }
}

@Composable
fun SearchBar(text: String, onTextChange: (String) -> Unit) {
    TextField(value = text, onValueChange = onTextChange)
}

@Composable
fun ResultsList(query: String) {
    // Only called when query changes
    LazyColumn {
        // items...
    }
}
```

## Network Optimization

### HTTP Connection Pooling

```kotlin
// build.gradle.kts
dependencies {
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
}

// Retrofit setup with connection pooling
fun provideRetrofit(): Retrofit {
    val okHttpClient = OkHttpClient.Builder()
        .connectionPool(ConnectionPool(
            maxIdleConnections = 5,
            keepAliveDuration = 5,
            timeUnit = TimeUnit.MINUTES
        ))
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    return Retrofit.Builder()
        .client(okHttpClient)
        .baseUrl("https://api.example.com/")
        .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
        .build()
}
```

### Batch API Requests

```kotlin
// ❌ Bad: Makes 10 requests (10s latency)
for (i in 1..10) {
    val item = apiService.getItem(i)
}

// ✅ Good: Single batch request (1s latency)
val items = apiService.getItems(listOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10))
```

## App Size Optimization

### Target: < 100MB on Play Store

**Measurement:**
```bash
# Build release bundle
./gradlew bundleRelease

# Analyze APK/bundle size
./gradlew analyzeReleaseBundle
```

### Techniques

1. **R8/ProGuard Obfuscation**
```
# build.gradle.kts
buildTypes {
    release {
        minifyEnabled = true
        shrinkResources = true
        proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
    }
}
```

2. **Remove Unused Resources**
```kotlin
// gradle.properties
android.enableResourceOptimizations=true
```

3. **Use Vector Drawables**
```xml
<!-- ✅ Good: 500 bytes -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path android:fillColor="#000" android:pathData="M12,2C6.5,2 2,6.5 2,12s4.5,10 10,10 10,-4.5 10,-10S17.5,2 12,2z"/>
</vector>

<!-- ❌ Bad: 50KB PNG -->
```

## Profiling Tools

| Tool | Purpose |
|------|---------|
| CPU Profiler | Track CPU usage by method |
| Memory Profiler | Detect memory leaks |
| Network Profiler | Inspect HTTP requests |
| Energy Profiler | Check battery impact |
| Frames tab | Detect jank/dropped frames |
| Layout Inspector | Inspect view hierarchy |

## Debugging Performance Issues

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Slow app start | Heavy I/O on main thread | Defer non-critical work |
| Memory leak | Objects held in memory | Use Profiler → Heap dump |
| Jank on scroll | Heavy recomposition | Use `key {}` in LazyColumn |
| Drain battery | Frequent network/location | Use WorkManager + constraints |
| Large APK | Unused resources/libs | Minify + shrink resources |

## Best Practices Checklist

- [ ] Startup time < 2 seconds (measure in Profiler)
- [ ] Memory usage < 150MB average
- [ ] APK size < 100MB
- [ ] 60fps consistent (check Frames tab)
- [ ] No ANR crashes (check Logcat)
- [ ] Battery impact minimal (Energy tab)
- [ ] Network requests batched
- [ ] Images scaled for screen size
- [ ] Listeners unregistered in onDestroy
- [ ] ViewModels use viewModelScope
