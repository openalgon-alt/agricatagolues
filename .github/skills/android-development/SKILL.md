---
name: android-development
description: "Master Android app development with proper UI/UX and production-ready patterns. Use for: create new Android projects, design Material Design 3 UI/UX, implement Jetpack libraries, write tests, optimize performance, debug issues, publish to Google Play. Supports both Kotlin/Compose and Java/XML stacks."
argument-hint: "Describe what you want to build or improve in your Android app"
user-invocable: true
---

# Android Development

## When to Use

- Creating a new Android project from scratch
- Implementing Material Design 3 UI with proper component patterns
- Setting up MVVM/MVI architecture with Jetpack libraries
- Writing unit and instrumentation tests
- Profiling and optimizing app performance
- Debugging runtime issues and crashes
- Preparing apps for Google Play Store publication
- Migrating from legacy Android code to modern practices

## Quick Reference

| Task | Reference |
|------|-----------|
| New Project Setup | [Project Setup Guide](./references/project-setup.md) |
| UI/UX Best Practices | [UI/UX Patterns](./references/ui-ux-patterns.md) |
| Architecture & Libraries | [Jetpack & Architecture](./references/architecture.md) |
| Testing Strategy | [Testing Guide](./references/testing.md) |
| Performance Optimization | [Performance Checklist](./references/performance.md) |
| Debugging & Troubleshooting | [Debugging Guide](./references/debugging.md) |
| Publishing to Play Store | [Publishing Guide](./references/publishing.md) |

## Core Workflows

### 1. Project Setup (Kotlin + Jetpack Compose)
```bash
# Initialize project with Android Studio
# Choose: Phone/Tablet → Empty Activity / Navigation Activity
# Target API: 34 (Android 14)
# Minimum API: 24 (Android 7.0)
# Language: Kotlin
# Build system: Gradle

# Key files to customize:
# - build.gradle.kts (app) → add Jetpack dependencies
# - AndroidManifest.xml → declare permissions & activities
# - MainActivity.kt → entry point
```

**Recommended Stack:**
- **UI Framework**: Jetpack Compose (recommended) or XML layouts
- **Architecture**: MVVM with StateFlow or MVI with Redux patterns
- **Navigation**: Compose Navigation or Navigation Component
- **Dependency Injection**: Hilt
- **Async**: Coroutines + Flow
- **Local Storage**: Room Database + DataStore
- **Network**: Retrofit + OkHttp or Ktor Client
- **Image Loading**: Coil or Glide
- **Logging**: Timber

[See detailed setup](./references/project-setup.md)

### 2. Material Design 3 UI/UX Implementation

**Design Principles:**
- **Color System**: Use Material 3 dynamic colors (Material You)
- **Typography**: Predefined text styles (headline, body, label)
- **Spacing**: 4dp grid system (8dp, 12dp, 16dp, 24dp)
- **Components**: Buttons, Cards, Dialogs, BottomSheet, Snackbar
- **Elevation**: Shadows define hierarchy
- **Touch Targets**: Minimum 48dp for accessibility

**Compose Example:**
```kotlin
@Composable
fun MyScreen() {
    MaterialTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Use predefined Material 3 components
            Button(onClick = {}) { Text("Action") }
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            ) {
                Text("Content", style = MaterialTheme.typography.bodyLarge)
            }
        }
    }
}
```

[See detailed UI/UX patterns](./references/ui-ux-patterns.md)

### 3. MVVM Architecture with Jetpack Libraries

**Layer Structure:**
```
data/
  ├── repository/     # Single source of truth
  ├── local/          # Room database
  └── remote/         # API service
domain/
  ├── model/          # Business entities
  └── usecase/        # Business logic
ui/
  ├── screen/         # Compose screens
  ├── viewmodel/      # VM with StateFlow
  └── component/      # Reusable components
```

**ViewModel Pattern:**
```kotlin
@HiltViewModel
class MyViewModel @Inject constructor(
    private val repository: MyRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun loadData() {
        viewModelScope.launch {
            repository.getData().collect { data ->
                _uiState.value = UiState.Success(data)
            }
        }
    }
}
```

[See detailed architecture guide](./references/architecture.md)

### 4. Testing Strategy

**Three-Tier Approach:**
- **Unit Tests** (70%): ViewModel, Repository, UseCase logic
- **Integration Tests** (20%): Database + Network interactions
- **UI Tests** (10%): Critical user journeys

```kotlin
// ViewModel Unit Test
@Test
fun loadData_updatesUiState() = runTest {
    val viewModel = MyViewModel(fakeRepository)
    viewModel.loadData()
    
    advanceUntilIdle()
    
    assertThat(viewModel.uiState.value).isInstanceOf(UiState.Success::class.java)
}

// Compose UI Test
@Test
fun buttonClick_triggersAction() {
    composeTestRule.setContent {
        MyScreen(onButtonClick = {})
    }
    composeTestRule.onNodeWithText("Button").performClick()
}
```

[See detailed testing guide](./references/testing.md)

### 5. Performance Optimization

**Key Areas:**
- **Startup Time**: Reduce cold start from 5s → <2s
- **Memory**: Profile with Profiler, target <150MB for average device
- **Battery**: Use WorkManager for background tasks, batch API calls
- **Rendering**: Ensure 60fps (90fps for high-refresh displays)
- **Profiling Tools**: Android Studio Profiler, Layout Inspector, Frame Metrics

```kotlin
// Efficient LazyColumn rendering
LazyColumn(
    modifier = Modifier.fillMaxSize(),
    contentPadding = PaddingValues(16.dp)
) {
    items(items.size, key = { items[it].id }) { index ->
        ItemCard(items[index])  // Recomposition only if item changes
    }
}
```

[See performance checklist](./references/performance.md)

### 6. Debugging & Troubleshooting

**Common Issues:**
- **Crash Loops**: Check logcat for stack traces, use Android Studio debugger
- **Memory Leaks**: Use Profiler → Memory tab, look for retained objects
- **ANR (Application Not Responding)**: Move work off main thread to Coroutines
- **Battery Drain**: Check wakelocks, reduce sensor polling frequency
- **Jank**: Use Profiler → Frames tab, optimize recomposition

[See debugging guide](./references/debugging.md)

### 7. Publishing to Google Play

**Checklist:**
- [ ] Verify version code & name in build.gradle
- [ ] Test on multiple device sizes (phone, tablet)
- [ ] Test on API levels: 24, 34
- [ ] Create app signing key (one per app, keep safe)
- [ ] Build release APK/AAB with obfuscation (R8/ProGuard)
- [ ] Create store listing, screenshots, privacy policy
- [ ] Staged rollout: 5% → 25% → 100%

[See publishing guide](./references/publishing.md)

## Best Practices Summary

✅ **DO:**
- Use state hoisting in Compose for predictable UI
- Implement proper error handling with sealed classes
- Write tests for business logic before UI
- Profile before optimizing (data-driven)
- Use Kotlin features (coroutines, extension functions, destructuring)

❌ **DON'T:**
- Perform network calls on the main thread
- Store sensitive data in SharedPreferences (use EncryptedSharedPreferences)
- Create nested Composables in loops (extract to separate function)
- Over-instrument logging (performance impact)
- Ship debug builds to production

## Getting Started

1. Load [Project Setup](./references/project-setup.md) for scaffolding
2. Review [UI/UX Patterns](./references/ui-ux-patterns.md) for design guidelines
3. Study [Architecture](./references/architecture.md) for code organization
4. Set up [Testing](./references/testing.md) early in development
5. Reference [Performance](./references/performance.md) during optimization phase
