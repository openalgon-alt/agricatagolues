# UI/UX Patterns & Material Design 3

## Material Design 3 Overview

Material Design 3 introduces **Material You** — dynamic, personalized color systems that adapt to device wallpaper while maintaining accessibility and consistency.

### Color System

```kotlin
// Define Material 3 theme colors
val lightColorScheme = lightColorScheme(
    primary = Color(0xFF6750A4),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFEADDFF),
    onPrimaryContainer = Color(0xFF21005E),
    
    secondary = Color(0xFF625B71),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFE8DEF8),
    onSecondaryContainer = Color(0xFF1D192B),
    
    tertiary = Color(0xFF7D5260),
    onTertiary = Color(0xFFFFFFFF),
    tertiaryContainer = Color(0xFFFFD8E4),
    onTertiaryContainer = Color(0xFF31111D),
    
    error = Color(0xFFB3261E),
    onError = Color(0xFFFFFFFF),
    errorContainer = Color(0xFFF9DEDC),
    onErrorContainer = Color(0xFF410E0B),
    
    background = Color(0xFFFFFBFE),
    onBackground = Color(0xFF1C1B1F),
    surface = Color(0xFFFFFBFE),
    onSurface = Color(0xFF1C1B1F),
    surfaceVariant = Color(0xFFE7E0EC),
    onSurfaceVariant = Color(0xFF49454E),
    
    outline = Color(0xFF79747E),
    outlineVariant = Color(0xFFCAC7D0),
)

val darkColorScheme = darkColorScheme(
    primary = Color(0xFFD0BCFF),
    // ... dark mode colors
)

@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) darkColorScheme else lightColorScheme
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
```

### Typography System

```kotlin
val Typography = Typography(
    displayLarge = TextStyle(
        fontSize = 57.sp,
        lineHeight = 64.sp,
        fontWeight = FontWeight.W400,
        letterSpacing = (-0.25).sp,
    ),
    displayMedium = TextStyle(
        fontSize = 45.sp,
        lineHeight = 52.sp,
        fontWeight = FontWeight.W400,
        letterSpacing = 0.sp,
    ),
    displaySmall = TextStyle(
        fontSize = 36.sp,
        lineHeight = 44.sp,
        fontWeight = FontWeight.W400,
        letterSpacing = 0.sp,
    ),
    headlineLarge = TextStyle(
        fontSize = 32.sp,
        lineHeight = 40.sp,
        fontWeight = FontWeight.W400,
        letterSpacing = 0.sp,
    ),
    headlineMedium = TextStyle(
        fontSize = 28.sp,
        lineHeight = 36.sp,
        fontWeight = FontWeight.W400,
        letterSpacing = 0.sp,
    ),
    headlineSmall = TextStyle(
        fontSize = 24.sp,
        lineHeight = 32.sp,
        fontWeight = FontWeight.W400,
        letterSpacing = 0.sp,
    ),
    bodyLarge = TextStyle(
        fontSize = 16.sp,
        lineHeight = 24.sp,
        fontWeight = FontWeight.W400,
        letterSpacing = 0.5.sp,
    ),
    bodyMedium = TextStyle(
        fontSize = 14.sp,
        lineHeight = 20.sp,
        fontWeight = FontWeight.W400,
        letterSpacing = 0.25.sp,
    ),
    bodySmall = TextStyle(
        fontSize = 12.sp,
        lineHeight = 16.sp,
        fontWeight = FontWeight.W500,
        letterSpacing = 0.4.sp,
    ),
    labelLarge = TextStyle(
        fontSize = 14.sp,
        lineHeight = 20.sp,
        fontWeight = FontWeight.W500,
        letterSpacing = 0.1.sp,
    ),
    labelMedium = TextStyle(
        fontSize = 12.sp,
        lineHeight = 16.sp,
        fontWeight = FontWeight.W500,
        letterSpacing = 0.5.sp,
    ),
    labelSmall = TextStyle(
        fontSize = 11.sp,
        lineHeight = 16.sp,
        fontWeight = FontWeight.W500,
        letterSpacing = 0.5.sp,
    ),
)
```

## Core Material Components

### Button Variants

```kotlin
@Composable
fun ButtonExamples() {
    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Filled Button (primary action)
        Button(
            onClick = { },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("Filled")
        }

        // Outlined Button (secondary action)
        OutlinedButton(
            onClick = { },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("Outlined")
        }

        // Text Button (tertiary action)
        TextButton(
            onClick = { },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Text")
        }

        // Elevated Button (subtle emphasis)
        ElevatedButton(
            onClick = { },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("Elevated")
        }
    }
}
```

### Cards & Surface

```kotlin
@Composable
fun CardExamples() {
    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Filled Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("Card Title", style = MaterialTheme.typography.headlineSmall)
                Text("Card content goes here", style = MaterialTheme.typography.bodyMedium)
            }
        }

        // Outlined Card
        OutlinedCard(
            modifier = Modifier.fillMaxWidth(),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("Outlined Card")
            }
        }

        // Elevated Card
        ElevatedCard(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.elevatedCardElevation(defaultElevation = 8.dp)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("Elevated Card")
            }
        }
    }
}
```

### Text Fields (Forms)

```kotlin
@Composable
fun TextFieldExamples() {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Filled TextField
        TextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        // Outlined TextField (recommended)
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = {
                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                    Icon(
                        imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                        contentDescription = "Toggle password visibility"
                    )
                }
            },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
    }
}
```

### Dialog

```kotlin
@Composable
fun DialogExample() {
    var showDialog by remember { mutableStateOf(false) }

    Button(onClick = { showDialog = true }) {
        Text("Show Dialog")
    }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text("Confirm Action") },
            text = { Text("Are you sure you want to proceed?") },
            confirmButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Confirm")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
```

### Bottom Sheet

```kotlin
@Composable
fun BottomSheetExample() {
    val sheetState = rememberModalBottomSheetState()
    var showBottomSheet by remember { mutableStateOf(false) }

    Button(onClick = { showBottomSheet = true }) {
        Text("Show Bottom Sheet")
    }

    if (showBottomSheet) {
        ModalBottomSheet(
            onDismissRequest = { showBottomSheet = false },
            sheetState = sheetState
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text("Bottom Sheet Content", style = MaterialTheme.typography.headlineSmall)
                Spacer(Modifier.height(24.dp))
                Button(
                    onClick = { showBottomSheet = false },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Close")
                }
            }
        }
    }
}
```

## Layout Patterns

### Master-Detail (Navigation)

```kotlin
@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "list"
    ) {
        composable("list") {
            ItemListScreen(
                onItemClick = { itemId ->
                    navController.navigate("detail/$itemId")
                }
            )
        }

        composable(
            route = "detail/{itemId}",
            arguments = listOf(navArgument("itemId") { type = NavType.StringType })
        ) { backStackEntry ->
            val itemId = backStackEntry.arguments?.getString("itemId")
            ItemDetailScreen(itemId = itemId ?: "")
        }
    }
}
```

### Responsive Layout (Phone/Tablet)

```kotlin
@Composable
fun ResponsiveScreen() {
    val windowSizeClass = calculateWindowSizeClass(Activity())
    
    when (windowSizeClass.widthSizeClass) {
        WindowWidthSizeClass.Compact -> {
            // Phone layout (single column)
            Column {
                ItemList()
            }
        }
        WindowWidthSizeClass.Medium -> {
            // Tablet layout (two columns)
            Row {
                Box(modifier = Modifier.weight(1f)) { ItemList() }
                Box(modifier = Modifier.weight(1f)) { ItemDetail() }
            }
        }
        WindowWidthSizeClass.Expanded -> {
            // Large tablet layout
            Row {
                Box(modifier = Modifier.weight(1f)) { ItemList() }
                Box(modifier = Modifier.weight(2f)) { ItemDetail() }
            }
        }
    }
}
```

## Spacing & Dimens

```kotlin
object Dimen {
    val space_0 = 0.dp
    val space_2 = 2.dp
    val space_4 = 4.dp
    val space_8 = 8.dp
    val space_12 = 12.dp
    val space_16 = 16.dp  // Default padding
    val space_24 = 24.dp
    val space_32 = 32.dp
    
    val touchTarget = 48.dp  // Minimum for accessibility
    val iconSize = 24.dp
    val smallIconSize = 18.dp
}
```

## Accessibility Best Practices

```kotlin
@Composable
fun AccessibleButton() {
    Button(
        onClick = { },
        modifier = Modifier
            .size(48.dp, 40.dp)  // Minimum touch target
            .semantics {
                contentDescription = "Submit form"
                onClick(label = "Submit") { true }
            }
    ) {
        Icon(Icons.Default.Check, contentDescription = null)
    }
}

@Composable
fun AccessibleImage() {
    Image(
        painter = painterResource(R.drawable.ic_logo),
        contentDescription = "Company logo",  // Not null!
        modifier = Modifier.size(48.dp)
    )
}
```

## XML Layout (Traditional) Example

```xml
<!-- res/layout/activity_main.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <EditText
        android:id="@+id/email_input"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Email"
        android:inputType="textEmailAddress"
        android:paddingStart="12dp"
        android:paddingEnd="12dp"
        style="@style/Widget.MaterialComponents.TextInputEditText.OutlinedBox" />

    <com.google.android.material.button.MaterialButton
        android:id="@+id/submit_btn"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Submit"
        android:layout_marginTop="16dp"
        style="@style/Widget.MaterialComponents.Button" />

</LinearLayout>
```

## Material Design Resources

- [Material 3 Specification](https://m3.material.io/)
- [Material Design Components](https://m3.material.io/components)
- [Color System Guide](https://m3.material.io/styles/color/overview)
- [Compose Material 3 Docs](https://developer.android.com/jetpack/androidx/releases/compose-material3)
