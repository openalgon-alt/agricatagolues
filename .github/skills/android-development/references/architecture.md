# Architecture & Jetpack Libraries

## MVVM Architecture Pattern

MVVM (Model-View-ViewModel) separates concerns and makes code testable.

```
         ┌─────────────┐
         │     UI      │ (Composable, Activity)
         │  (View)     │
         └─────┬───────┘
               │ observes
         ┌─────▼────────────────┐
         │  ViewModel           │ Updates UI state
         │  - StateFlow<State>  │ Handles user actions
         │  - Events            │
         └─────┬────────────────┘
               │ calls
         ┌─────▼─────────────────┐
         │  Use Cases / Repo     │ Business logic
         │  - loadData()         │ Data transformations
         └─────┬─────────────────┘
               │ calls
         ┌─────▼──────────────────┐
         │  Data Sources          │
         │  - Room (local DB)     │
         │  - Retrofit (remote)   │
         └────────────────────────┘
```

## Project Structure

```
src/main/kotlin/com/yourcompany/app/
│
├── data/
│   ├── local/
│   │   ├── AppDatabase.kt          # Room database class
│   │   ├── dao/
│   │   │   └── ItemDao.kt          # DAO interface
│   │   └── entity/
│   │       └── ItemEntity.kt        # Room entities
│   ├── remote/
│   │   ├── ApiService.kt           # Retrofit service
│   │   ├── dto/
│   │   │   └── ItemDto.kt          # API DTOs
│   │   └── interceptor/
│   │       └── AuthInterceptor.kt
│   └── repository/
│       └── ItemRepository.kt       # Repository (SoT)
│
├── domain/
│   ├── model/
│   │   └── Item.kt                 # Business model
│   ├── usecase/
│   │   └── GetItemsUseCase.kt      # Business logic
│   └── repository/
│       └── ItemRepository.kt       # Repository interface
│
├── ui/
│   ├── screen/
│   │   ├── item_list/
│   │   │   ├── ItemListScreen.kt   # Composable
│   │   │   └── ItemListViewModel.kt
│   │   └── item_detail/
│   │       ├── ItemDetailScreen.kt
│   │       └── ItemDetailViewModel.kt
│   ├── component/
│   │   ├── ItemCard.kt
│   │   └── LoadingDialog.kt
│   ├── viewmodel/
│   │   └── BaseViewModel.kt
│   └── theme/
│       ├── Color.kt
│       ├── Type.kt
│       └── Theme.kt
│
├── di/
│   ├── DatabaseModule.kt           # Hilt modules
│   ├── NetworkModule.kt
│   └── RepositoryModule.kt
│
└── MainActivity.kt
```

## Hilt Dependency Injection

### Setup

```kotlin
// build.gradle.kts
plugins {
    id("com.google.dagger.hilt.android")
}

dependencies {
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
}
```

### Define Modules

```kotlin
// di/DatabaseModule.kt
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Singleton
    @Provides
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "app_database"
        ).build()
    }

    @Provides
    fun provideItemDao(database: AppDatabase) = database.itemDao()
}

// di/NetworkModule.kt
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Singleton
    @Provides
    fun provideApiService(): ApiService {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(ApiService::class.java)
    }
}

// di/RepositoryModule.kt
@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    @Singleton
    @Provides
    fun provideItemRepository(
        local: ItemDao,
        remote: ApiService
    ): ItemRepository {
        return ItemRepositoryImpl(local, remote)
    }
}
```

### Annotate Application Class

```kotlin
@HiltAndroidApp
class MyApplication : Application()
```

### Inject into ViewModel

```kotlin
@HiltViewModel
class ItemListViewModel @Inject constructor(
    private val getItemsUseCase: GetItemsUseCase,
    private val errorHandler: ErrorHandler
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        loadItems()
    }

    private fun loadItems() {
        viewModelScope.launch {
            try {
                val items = getItemsUseCase()
                _uiState.value = UiState.Success(items)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(errorHandler.getErrorMessage(e))
            }
        }
    }
}
```

## Room Database

### Database Definition

```kotlin
@Entity(tableName = "items")
data class ItemEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    @ColumnInfo(name = "created_at") val createdAt: Long
)

@Dao
interface ItemDao {
    @Query("SELECT * FROM items")
    fun getAllItems(): Flow<List<ItemEntity>>

    @Query("SELECT * FROM items WHERE id = :id")
    suspend fun getItemById(id: String): ItemEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItems(items: List<ItemEntity>)

    @Delete
    suspend fun deleteItem(item: ItemEntity)

    @Query("DELETE FROM items")
    suspend fun clearAll()
}

@Database(
    entities = [ItemEntity::class],
    version = 1,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun itemDao(): ItemDao

    companion object {
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: buildDatabase(context).also { INSTANCE = it }
            }
        }

        private fun buildDatabase(context: Context): AppDatabase {
            return Room.databaseBuilder(
                context.applicationContext,
                AppDatabase::class.java,
                "app_database"
            ).build()
        }
    }
}
```

## Repository Pattern

```kotlin
interface ItemRepository {
    fun getAllItems(): Flow<List<Item>>
    suspend fun refreshItems()
    suspend fun deleteItem(id: String)
}

class ItemRepositoryImpl @Inject constructor(
    private val localDataSource: ItemDao,
    private val remoteDataSource: ApiService
) : ItemRepository {

    override fun getAllItems(): Flow<List<Item>> {
        return localDataSource.getAllItems()
            .map { entities -> entities.map { it.toDomain() } }
    }

    override suspend fun refreshItems() {
        try {
            val remoteItems = remoteDataSource.getItems()
            val entities = remoteItems.map { it.toEntity() }
            localDataSource.insertItems(entities)
        } catch (e: Exception) {
            // Handle error
        }
    }

    override suspend fun deleteItem(id: String) {
        localDataSource.deleteItem(ItemEntity(id, "", "", 0L))
    }
}
```

## ViewModel with StateFlow

```kotlin
sealed class UiState {
    object Loading : UiState()
    data class Success(val items: List<Item>) : UiState()
    data class Error(val message: String) : UiState()
}

sealed class UiEvent {
    object Refresh : UiEvent()
    data class DeleteItem(val id: String) : UiEvent()
}

@HiltViewModel
class ItemListViewModel @Inject constructor(
    private val repository: ItemRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    private val _uiEvent = Channel<UiEvent>()
    val uiEvent: Flow<UiEvent> = _uiEvent.receiveAsFlow()

    init {
        observeItems()
    }

    private fun observeItems() {
        viewModelScope.launch {
            repository.getAllItems()
                .catch { e ->
                    _uiState.value = UiState.Error(e.message ?: "Unknown error")
                }
                .collect { items ->
                    _uiState.value = UiState.Success(items)
                }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            try {
                repository.refreshItems()
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Refresh failed")
            }
        }
    }

    fun deleteItem(id: String) {
        viewModelScope.launch {
            repository.deleteItem(id)
            _uiEvent.send(UiEvent.DeleteItem(id))
        }
    }
}
```

## Coroutines & Flow

### Basic Usage

```kotlin
// Launch coroutine
viewModelScope.launch {
    val result = repository.getData()  // Suspending function
    _uiState.value = result
}

// Flow collection
viewModelScope.launch {
    repository.observeItems()
        .collect { items ->
            _uiState.value = UiState.Success(items)
        }
}

// Error handling
viewModelScope.launch {
    try {
        repository.getData()
    } catch (e: IOException) {
        _uiState.value = UiState.NetworkError
    } catch (e: Exception) {
        _uiState.value = UiState.Error(e.message)
    }
}
```

## Retrofit Network Client

```kotlin
@Serializable
data class ItemDto(
    @SerialName("id")
    val id: String,
    @SerialName("title")
    val title: String,
    @SerialName("description")
    val description: String
)

interface ApiService {
    @GET("items")
    suspend fun getItems(): List<ItemDto>

    @GET("items/{id}")
    suspend fun getItemById(@Path("id") id: String): ItemDto

    @POST("items")
    suspend fun createItem(@Body item: ItemDto): ItemDto

    @DELETE("items/{id}")
    suspend fun deleteItem(@Path("id") id: String)
}

@Provides
@Singleton
fun provideApiService(): ApiService {
    val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    return Retrofit.Builder()
        .baseUrl("https://api.example.com/")
        .client(okHttpClient)
        .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(ApiService::class.java)
}
```

## Data Transformation Extensions

```kotlin
fun ItemEntity.toDomain(): Item {
    return Item(
        id = id,
        title = title,
        description = description,
        createdAt = createdAt
    )
}

fun ItemDto.toEntity(): ItemEntity {
    return ItemEntity(
        id = id,
        title = title,
        description = description,
        createdAt = System.currentTimeMillis()
    )
}

fun ItemDto.toDomain(): Item {
    return Item(
        id = id,
        title = title,
        description = description,
        createdAt = System.currentTimeMillis()
    )
}
```

## Best Practices

✅ **DO:**
- Use sealed classes for type-safe state management
- Collect Flows in UI layer only
- Use `viewModelScope` for coroutines (auto-cancelled on VM destroy)
- Define repository interfaces in domain layer
- Use Hilt for dependency injection

❌ **DON'T:**
- Use GlobalScope (causes memory leaks)
- Perform I/O on main thread
- Store UI state in Repository
- Hardcode dependencies (inject them)
- Create new instances of expensive objects
