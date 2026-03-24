-- MOCK TESTS TABLE
CREATE TABLE IF NOT EXISTS mock_tests (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price NUMERIC DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MOCK QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS mock_questions (
    id SERIAL PRIMARY KEY,
    mock_test_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INTEGER NOT NULL,
    image_url TEXT,
    marks INTEGER DEFAULT 4,
    topic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- EXAM SUBMISSIONS TABLE - user_id is TEXT for Firebase Auth UID
CREATE TABLE IF NOT EXISTS exam_submissions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    mock_test_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TEST ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS test_attempts (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    test_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    score NUMERIC
);
