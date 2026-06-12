# Debugging Guide

## Reading Logcat

### Setup in Android Studio

1. **Open Logcat:**
   - View → Tool Windows → Logcat (or Alt+6)

2. **Filter by Log Level:**
   - Verbose (V) → Too much noise
   - Debug (D) → Default useful
   - Info (I) → Important messages
   - Warning (W) → Pay attention
   - Error (E) → Crashes
   - Assert (A) → Fatal errors

3. **Filter by Tag:**
```kotlin
// In code: tag for filtering
Log.d("MyApp", "Debug message")

// In Logcat: type "MyApp" in filter
```

### Common Log Tags

```kotlin
// Timber (recommended over Log)
Timber.d("Debug: %s", value)
Timber.e(exception, "Error occurred")
Timber.w("Warning: something")
Timber.v("Verbose info")
```

## Crash Analysis

### Stack Trace Anatomy

```
E/AndroidRuntime: FATAL EXCEPTION: main
Process: com.example.app, PID: 12345
java.lang.NullPointerException: Attempt to invoke virtual method 'int java.lang.String.length()' on a null object reference
    at com.example.app.MainActivity.onCreate(MainActivity.kt:42)
    at android.app.Activity.performCreate(Activity.java:7259)
    at android.app.Instrumentation.callActivityOnCreate(Instrumentation.java:1220)
    ...
```

**Reading:**
- Exception type: `NullPointerException`
- Message: `Attempt to invoke virtual method...`
- Location: `MainActivity.kt:42` (first line of YOUR code)
- Line 42: likely calling `.length()` on null string

### Debugging Crashes

```kotlin
// ❌ Crash: NullPointerException
data class User(val name: String)

val user: User? = null
val length = user.name.length  // Crash!

// ✅ Fix: Null safety
val user: User? = null
val length = user?.name?.length ?: 0

// ✅ Or explicit null check
if (user != null) {
    val length = user.name.length
}
```

## Android Debugger

### Setting Breakpoints

1. Click on line number in editor → red dot appears
2. Run app in debug mode (Shift+F9)
3. App pauses at breakpoint
4. Use Debugger window to inspect variables

```kotlin
fun loadUserData(userId: String) {
    // Set breakpoint on next line
    val user = repository.getUser(userId)  // ← Pauses here
    
    // Debugger shows: userId value, can inspect user object
    updateUI(user)
}
```

### Stepping Through Code

| Command | Effect |
|---------|--------|
| F10 | Step over (next line) |
| F11 | Step into (enter function) |
| Shift+F11 | Step out (exit function) |
| F9 | Continue to next breakpoint |

### Conditional Breakpoints

```kotlin
// Right-click breakpoint → Edit...
// Add condition: userId.isEmpty()
// Only pauses if condition true
```

### Evaluate Expressions

1. Set breakpoint
2. In Debugger, click "Evaluate Expression"
3. Type: `user.name.length` (executes current context)

## ANR (Application Not Responding)

**Cause:** Main thread blocked for > 5 seconds

### Example ANR

```kotlin
// ❌ Bad: Network on main thread (ANR)
fun loadData() {
    val data = apiService.getData()  // Blocks main thread
    updateUI(data)
}

// ✅ Good: Network off main thread
fun loadData() {
    viewModelScope.launch {  // Runs on IO thread
        val data = apiService.getData()
        withContext(Dispatchers.Main) {
            updateUI(data)  // Update UI on main thread
        }
    }
}
```

### Finding ANR in Logcat

```
E/ANRManager: ANR in com.example.app (com.example.app/.MainActivity)
PID: 12345
Reason: Input dispatching timed out (Reason: keyDispatchingTimedOut)
```

**Solution:** Use Profiler → CPU tab to see what's blocking

## Memory Leaks

### Detecting with Profiler

1. **Record Memory:**
   - Android Profiler → Memory tab
   - Force garbage collection (trash icon)
   - Record allocation

2. **Take Heap Dump:**
   - Click "Dump" button
   - Wait for analysis
   - Look for "Retained Objects"

### Common Memory Leak Patterns

```kotlin
// ❌ Leak: Static reference to Activity
object MyManager {
    var activity: Activity? = null
}

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        MyManager.activity = this  // Activity never collected
    }
}

// ✅ Fix: Use Context instead, weak reference
class MainActivity : AppCompatActivity() {
    private val weakActivity = WeakReference(this)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Activity can be collected
    }
}
```

```kotlin
// ❌ Leak: Inner class holding outer reference
class MyActivity : AppCompatActivity() {
    val handler = Handler(Looper.getMainLooper()) {
        // Implicitly holds reference to MyActivity
        updateUI()
        true
    }
}

// ✅ Fix: Static inner class + weak reference
class MyActivity : AppCompatActivity() {
    companion object {
        private class MyHandler(activity: WeakReference<MyActivity>) : Handler(Looper.getMainLooper()) {
            private val activity = activity
            override fun handleMessage(msg: Message) {
                activity.get()?.updateUI()
            }
        }
    }
}
```

## Network Debugging

### OkHttp Logging

```kotlin
import okhttp3.logging.HttpLoggingInterceptor

val httpClient = OkHttpClient.Builder()
    .addInterceptor(HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    })
    .build()

// Logcat output:
// --> POST /api/users
// Content-Type: application/json
// {"name": "John"}
// --> END POST (123-byte body)
// <-- 200 OK
// {"id": 1, "name": "John"}
// <-- END HTTP
```

### Charles Proxy

1. Install Charles (proxy)
2. Configure device to use proxy
3. View all HTTP(S) requests
4. Inspect headers, body, timing

## Lint Warnings

```kotlin
// Run Lint analysis
// Analyze → Run Lint → Check "Show All Issues"

// Common warnings:
// - Unused resource
// - Missing permissions
// - Hardcoded strings
// - Inefficient layouts
```

## Profiling in Detail

### CPU Profiler

```
Profiler → CPU tab

Types:
- Sampled: Low overhead, statistical
- Instrumented: Accurate, high overhead

Flame Chart: Width = time spent, shows call hierarchy
```

### Memory Profiler

```
Profiler → Memory tab

Native: C++ memory
Java: Kotlin/Java objects
Graphics: GPU memory
Stack: Stack memory

Colors:
- Blue: Java objects
- Red: Native objects
- Green: Graphics
- Yellow: Other
```

## Useful ADB Commands

```bash
# View current activity
adb shell dumpsys window | grep mCurrentFocus

# Clear app data
adb shell pm clear com.example.app

# Force stop app
adb shell am force-stop com.example.app

# Start app with profiling
adb shell am start --profile-wait /data/anr com.example.app

# View memory info
adb shell dumpsys meminfo com.example.app

# Check permissions
adb shell pm list permissions com.example.app
```

## Remote Debugging

```bash
# Connect to device via Wi-Fi
adb connect 192.168.1.100:5555

# List connected devices
adb devices

# View logcat from specific device
adb -s 192.168.1.100:5555 logcat
```

## Troubleshooting Checklist

| Problem | Debug Approach |
|---------|-----------------|
| Crash on specific device | Check API level, test on that device |
| Memory leak | Take heap dump, check static references |
| ANR | Profile CPU, move I/O off main thread |
| Jank on scroll | Profile Frames tab, check recomposition |
| Network error | Enable network logging, check endpoints |
| Silent failure | Add logging, set breakpoints |
| Intermittent crash | Check race conditions, threading issues |
