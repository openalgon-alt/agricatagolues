# Testing Guide

## Test Pyramid

```
         ▲
        ╱ ╲                    E2E & UI Tests (10%)
       ╱   ╲                   - Critical user journeys
      ╱─────╲                  - Launch & key features
     ╱       ╲
    ╱─────────╲                Integration Tests (20%)
   ╱           ╲               - Database + Network
  ╱─────────────╲              - Repository layer
 ╱               ╲             - API interactions
╱─────────────────╲            Unit Tests (70%)
                               - ViewModels, UseCases
                               - Utility functions
                               - Business logic
```

## Unit Testing

### ViewModel Testing

```kotlin
// build.gradle.kts
testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
testImplementation("io.mockk:mockk:1.13.8")
testImplementation("androidx.arch.core:core-testing:2.2.0")
testImplementation("junit:junit:4.13.2")

// ItemListViewModelTest.kt
@get:Rule
val instantExecutorRule = InstantTaskExecutorRule()

class ItemListViewModelTest {
    
    private val testDispatcher = StandardTestDispatcher()
    private val testScope = TestScope(testDispatcher)
    
    private lateinit var fakeRepository: FakeItemRepository
    private lateinit var viewModel: ItemListViewModel

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        fakeRepository = FakeItemRepository()
        viewModel = ItemListViewModel(fakeRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun loadItems_updateStateToSuccess() = testScope.runTest {
        // Arrange
        val expectedItems = listOf(
            Item(id = "1", title = "Item 1", description = "Desc 1", createdAt = 0L),
            Item(id = "2", title = "Item 2", description = "Desc 2", createdAt = 0L)
        )
        fakeRepository.setItems(expectedItems)

        // Act
        viewModel = ItemListViewModel(fakeRepository)
        advanceUntilIdle()

        // Assert
        val uiState = viewModel.uiState.value
        assertThat(uiState).isInstanceOf(UiState.Success::class.java)
        assertThat((uiState as UiState.Success).items).isEqualTo(expectedItems)
    }

    @Test
    fun loadItems_withException_updateStateToError() = testScope.runTest {
        // Arrange
        fakeRepository.setException(IOException("Network error"))
        
        // Act
        viewModel = ItemListViewModel(fakeRepository)
        advanceUntilIdle()

        // Assert
        val uiState = viewModel.uiState.value
        assertThat(uiState).isInstanceOf(UiState.Error::class.java)
        assertThat((uiState as UiState.Error).message).isEqualTo("Network error")
    }

    @Test
    fun deleteItem_triggersEvent() = testScope.runTest {
        // Arrange
        val itemId = "1"
        val events = mutableListOf<UiEvent>()
        
        viewModel.uiEvent
            .onEach { events.add(it) }
            .launchIn(testScope)
        
        // Act
        viewModel.deleteItem(itemId)
        advanceUntilIdle()

        // Assert
        assertThat(events).contains(UiEvent.DeleteItem(itemId))
    }
}

// FakeRepository for testing
class FakeItemRepository : ItemRepository {
    private var items = listOf<Item>()
    private var exception: Exception? = null

    fun setItems(newItems: List<Item>) {
        items = newItems
    }

    fun setException(e: Exception) {
        exception = e
    }

    override fun getAllItems(): Flow<List<Item>> = flow {
        exception?.let { throw it }
        emit(items)
    }

    override suspend fun refreshItems() {
        exception?.let { throw it }
    }

    override suspend fun deleteItem(id: String) {
        exception?.let { throw it }
        items = items.filter { it.id != id }
    }
}
```

### Repository Testing

```kotlin
class ItemRepositoryTest {
    
    private val mockLocalDataSource = mockk<ItemDao>()
    private val mockRemoteDataSource = mockk<ApiService>()
    
    private lateinit var repository: ItemRepositoryImpl

    @Before
    fun setup() {
        repository = ItemRepositoryImpl(mockLocalDataSource, mockRemoteDataSource)
    }

    @Test
    fun refreshItems_callsRemoteAndSavesLocally() = runTest {
        // Arrange
        val remoteItems = listOf(
            ItemDto(id = "1", title = "Item 1", description = "Desc 1"),
            ItemDto(id = "2", title = "Item 2", description = "Desc 2")
        )
        coEvery { mockRemoteDataSource.getItems() } returns remoteItems
        coEvery { mockLocalDataSource.insertItems(any()) } just Runs

        // Act
        repository.refreshItems()

        // Assert
        coVerify { mockRemoteDataSource.getItems() }
        coVerify { mockLocalDataSource.insertItems(any()) }
    }

    @Test
    fun getAllItems_returnsLocalData() = runTest {
        // Arrange
        val entities = listOf(
            ItemEntity(id = "1", title = "Item 1", description = "Desc 1", createdAt = 0L)
        )
        every { mockLocalDataSource.getAllItems() } returns flowOf(entities)

        // Act
        val result = repository.getAllItems().first()

        // Assert
        assertThat(result).hasSize(1)
        assertThat(result[0].id).isEqualTo("1")
    }
}
```

## Integration Testing

### Database Testing

```kotlin
@RunWith(AndroidRunner::class)
class ItemDaoTest {
    
    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    private lateinit var database: AppDatabase
    private lateinit var itemDao: ItemDao

    @Before
    fun setup() {
        database = Room.inMemoryDatabaseBuilder(
            InstrumentationRegistry.getInstrumentation().context,
            AppDatabase::class.java
        ).build()
        itemDao = database.itemDao()
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun insertAndRetrieveItems() = runTest {
        // Arrange
        val items = listOf(
            ItemEntity(id = "1", title = "Item 1", description = "Desc 1", createdAt = 0L),
            ItemEntity(id = "2", title = "Item 2", description = "Desc 2", createdAt = 0L)
        )

        // Act
        itemDao.insertItems(items)
        val retrieved = itemDao.getAllItems().first()

        // Assert
        assertThat(retrieved).hasSize(2)
        assertThat(retrieved).isEqualTo(items)
    }

    @Test
    fun deleteItem_removesFromDatabase() = runTest {
        // Arrange
        val item = ItemEntity(id = "1", title = "Item 1", description = "Desc 1", createdAt = 0L)
        itemDao.insertItems(listOf(item))

        // Act
        itemDao.deleteItem(item)
        val remaining = itemDao.getAllItems().first()

        // Assert
        assertThat(remaining).isEmpty()
    }
}
```

## UI Testing

### Compose UI Testing

```kotlin
@RunWith(AndroidRunner::class)
class ItemListScreenTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun displayItemList_showsAllItems() {
        val items = listOf(
            Item(id = "1", title = "Item 1", description = "Desc 1", createdAt = 0L),
            Item(id = "2", title = "Item 2", description = "Desc 2", createdAt = 0L)
        )

        composeTestRule.setContent {
            AppTheme {
                ItemListScreen(
                    uiState = UiState.Success(items),
                    onItemClick = {}
                )
            }
        }

        // Assert
        composeTestRule.onNodeWithText("Item 1").assertExists()
        composeTestRule.onNodeWithText("Item 2").assertExists()
    }

    @Test
    fun deleteButton_callsDeleteCallback() {
        val onDeleteCalled = mutableListOf<String>()
        
        composeTestRule.setContent {
            AppTheme {
                ItemCard(
                    item = Item(id = "1", title = "Item 1", description = "Desc", createdAt = 0L),
                    onDelete = { onDeleteCalled.add(it) }
                )
            }
        }

        composeTestRule.onNodeWithContentDescription("Delete item").performClick()

        assertThat(onDeleteCalled).contains("1")
    }

    @Test
    fun loadingState_showsProgressBar() {
        composeTestRule.setContent {
            AppTheme {
                ItemListScreen(
                    uiState = UiState.Loading,
                    onItemClick = {}
                )
            }
        }

        composeTestRule.onNodeWithContentDescription("Loading").assertExists()
    }

    @Test
    fun errorState_showsErrorMessage() {
        composeTestRule.setContent {
            AppTheme {
                ItemListScreen(
                    uiState = UiState.Error("Something went wrong"),
                    onItemClick = {}
                )
            }
        }

        composeTestRule.onNodeWithText("Something went wrong").assertExists()
    }
}
```

### Espresso UI Testing (XML layouts)

```kotlin
@RunWith(AndroidRunner::class)
class ItemListActivityTest {
    
    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    @Test
    fun buttonClick_startsDetailActivity() {
        onView(withId(R.id.item_list_recycler))
            .perform(actionOnItemAtPosition(0, click()))

        intended(hasComponent(ItemDetailActivity::class.java.name))
    }

    @Test
    fun displayErrorMessage_whenNetworkFails() {
        onView(withId(R.id.error_message))
            .check(matches(isDisplayed()))
            .check(matches(withText(containsString("Network error"))))
    }
}
```

## Test Data Builders

```kotlin
fun createTestItem(
    id: String = "1",
    title: String = "Test Item",
    description: String = "Test description",
    createdAt: Long = 0L
): Item = Item(id, title, description, createdAt)

fun createTestItemList(size: Int = 5): List<Item> {
    return (1..size).map { i ->
        createTestItem(id = i.toString(), title = "Item $i")
    }
}

// Usage
@Test
fun test() {
    val items = createTestItemList(10)
    // ...
}
```

## Running Tests

```bash
# Run all unit tests
./gradlew test

# Run specific test class
./gradlew test --tests com.example.ItemViewModelTest

# Run instrumented (device) tests
./gradlew connectedAndroidTest

# Run with coverage report
./gradlew testDebugUnitTestCoverage

# View coverage report
open app/build/reports/coverage/debug/index.html
```

## Test Coverage Goals

| Layer | Target Coverage | Strategy |
|-------|-----------------|----------|
| ViewModel | 80%+ | Test all state transitions |
| Repository | 75%+ | Mock data sources |
| UseCase | 85%+ | Test business logic |
| UI Component | 60%+ | Test critical paths |
| Utility | 90%+ | Test all branches |

## Best Practices

✅ **DO:**
- Name tests clearly: `testXWhenYThenZ`
- Use AAA pattern: Arrange, Act, Assert
- Test one thing per test
- Use builders for test data
- Mock external dependencies

❌ **DON'T:**
- Add business logic to test helpers
- Test framework code (Hilt, Compose internals)
- Use flaky sleep delays
- Create real databases in unit tests
- Ignore test failures
