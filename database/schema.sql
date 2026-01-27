-- ============================================
-- Pathways Software Dev - Games Database Schema
-- ============================================

-- Quiz Questions Table
-- Stores the pool of 25 questions for the quiz game
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of 4 options
    correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
    category VARCHAR(50) DEFAULT 'general',
    difficulty VARCHAR(20) DEFAULT 'medium',
    explanation TEXT, -- Optional explanation shown after answering
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Quiz Scores Table
-- Stores quiz game scores and leaderboard data
CREATE TABLE quiz_scores (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    percentage DECIMAL(5, 2) GENERATED ALWAYS AS ((score::DECIMAL / total_questions) * 100) STORED,
    game_type VARCHAR(50) DEFAULT 'quiz',
    time_taken INTEGER, -- Time taken in seconds (optional)
    session_id VARCHAR(255), -- For preventing duplicate submissions
    created_at TIMESTAMP DEFAULT NOW()
);

-- Word Lists Table
-- Stores word lists for wordsearch games
CREATE TABLE word_lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'tech',
    words JSONB NOT NULL, -- Array of words
    difficulty VARCHAR(20) DEFAULT 'medium',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wordsearch Scores Table
-- Stores wordsearch game scores and leaderboard data
CREATE TABLE wordsearch_scores (
    id SERIAL PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    completion_time INTEGER NOT NULL CHECK (completion_time > 0), -- in seconds
    words_found INTEGER NOT NULL CHECK (words_found >= 0),
    total_words INTEGER NOT NULL CHECK (total_words > 0),
    percentage DECIMAL(5, 2) GENERATED ALWAYS AS ((words_found::DECIMAL / total_words) * 100) STORED,
    difficulty VARCHAR(20) DEFAULT 'medium',
    word_list_id INTEGER REFERENCES word_lists(id),
    game_type VARCHAR(50) DEFAULT 'wordsearch',
    session_id VARCHAR(255), -- For preventing duplicate submissions
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quiz_scores_score ON quiz_scores(score DESC, created_at ASC);
CREATE INDEX idx_quiz_scores_player ON quiz_scores(player_name);
CREATE INDEX idx_quiz_scores_created ON quiz_scores(created_at DESC);
CREATE INDEX idx_quiz_questions_active ON quiz_questions(is_active) WHERE is_active = true;
CREATE INDEX idx_quiz_questions_category ON quiz_questions(category);

CREATE INDEX idx_wordsearch_scores_time ON wordsearch_scores(completion_time ASC, created_at ASC);
CREATE INDEX idx_wordsearch_scores_player ON wordsearch_scores(player_name);
CREATE INDEX idx_wordsearch_scores_created ON wordsearch_scores(created_at DESC);
CREATE INDEX idx_wordsearch_scores_difficulty ON wordsearch_scores(difficulty);

-- ============================================
-- Initial Data: Quiz Questions (25 questions)
-- ============================================

INSERT INTO quiz_questions (question, options, correct_answer, category, difficulty, explanation) VALUES
-- React Questions
('What is React?', 
 '["A programming language", "A JavaScript library for building UIs", "A database", "A CSS framework"]', 
 1, 
 'react', 
 'easy',
 'React is a JavaScript library developed by Facebook for building user interfaces, particularly web applications.'),

('Which method is used to update state in React?', 
 '["setState()", "updateState()", "changeState()", "modifyState()"]', 
 0, 
 'react', 
 'easy',
 'setState() is the method used in class components to update component state. In functional components, useState hook is used.'),

('What is the purpose of useEffect in React?', 
 '["To style components", "To handle side effects", "To create components", "To manage routing"]', 
 1, 
 'react', 
 'medium',
 'useEffect is a React hook that allows you to perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.'),

('What is JSX?', 
 '["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "Java XML"]', 
 0, 
 'react', 
 'easy',
 'JSX stands for JavaScript XML. It is a syntax extension that allows you to write HTML-like code in JavaScript.'),

('What is the virtual DOM?', 
 '["A real DOM element", "A JavaScript representation of the DOM", "A CSS concept", "A database table"]', 
 1, 
 'react', 
 'medium',
 'The virtual DOM is a JavaScript representation of the real DOM. React uses it to optimize updates by comparing the virtual DOM with the real DOM and only updating what changed.'),

-- JavaScript Questions
('What does API stand for?', 
 '["Application Programming Interface", "Automated Program Integration", "Advanced Programming Interface", "Application Process Integration"]', 
 0, 
 'javascript', 
 'easy',
 'API stands for Application Programming Interface. It defines how different software components should interact with each other.'),

('What is a closure in JavaScript?', 
 '["A function that has access to variables in its outer scope", "A way to close a browser tab", "A method to end a loop", "A type of variable"]', 
 0, 
 'javascript', 
 'medium',
 'A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.'),

('What is the difference between let and var?', 
 '["let is block-scoped, var is function-scoped", "let is function-scoped, var is block-scoped", "They are identical", "let is for constants"]', 
 0, 
 'javascript', 
 'medium',
 'let is block-scoped, meaning it exists only within the block where it is declared. var is function-scoped and can be accessed throughout the entire function.'),

('What is a promise in JavaScript?', 
 '["An object representing eventual completion of an async operation", "A guarantee that code will run", "A type of loop", "A way to store data"]', 
 0, 
 'javascript', 
 'medium',
 'A Promise is an object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value.'),

('What is the spread operator in JavaScript?', 
 '["... used to expand arrays/objects", "A way to copy files", "A type of loop", "A method to delete items"]', 
 0, 
 'javascript', 
 'easy',
 'The spread operator (...) allows an iterable to be expanded in places where zero or more arguments or elements are expected.'),

-- TypeScript Questions
('What is TypeScript?', 
 '["A database", "JavaScript with type definitions", "A CSS preprocessor", "A testing framework"]', 
 1, 
 'typescript', 
 'easy',
 'TypeScript is a superset of JavaScript that adds static type definitions, making code more maintainable and less error-prone.'),

('What is the main benefit of using TypeScript?', 
 '["Better performance", "Type safety and better tooling", "Smaller file sizes", "Faster execution"]', 
 1, 
 'typescript', 
 'easy',
 'TypeScript provides type safety, which helps catch errors at compile time, and offers better IDE support with autocomplete and refactoring tools.'),

('What is an interface in TypeScript?', 
 '["A way to connect to databases", "A contract that defines the structure of an object", "A type of function", "A way to style components"]', 
 1, 
 'typescript', 
 'medium',
 'An interface in TypeScript defines a contract that an object must follow, specifying the properties and methods it should have.'),

-- Node.js & npm Questions
('What does npm stand for?', 
 '["Node Package Manager", "New Package Manager", "Network Package Manager", "Node Program Manager"]', 
 0, 
 'nodejs', 
 'easy',
 'npm stands for Node Package Manager. It is the default package manager for Node.js and the largest software registry in the world.'),

('What is Node.js?', 
 '["A JavaScript runtime built on Chrome V8 engine", "A database", "A CSS framework", "A text editor"]', 
 0, 
 'nodejs', 
 'easy',
 'Node.js is a JavaScript runtime built on Chrome V8 engine that allows you to run JavaScript on the server side.'),

('What is the purpose of package.json?', 
 '["To define project dependencies and scripts", "To store user data", "To configure the database", "To style the application"]', 
 0, 
 'nodejs', 
 'easy',
 'package.json is a file that contains metadata about your project, including dependencies, scripts, and project configuration.'),

-- Web Development Questions
('What is HTML?', 
 '["HyperText Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"]', 
 0, 
 'web', 
 'easy',
 'HTML stands for HyperText Markup Language. It is the standard markup language for creating web pages.'),

('What is CSS?', 
 '["Cascading Style Sheets", "Computer Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"]', 
 0, 
 'web', 
 'easy',
 'CSS stands for Cascading Style Sheets. It is used to style and layout web pages.'),

('What is the box model in CSS?', 
 '["Content, padding, border, margin", "A way to store data", "A type of layout", "A method to center elements"]', 
 0, 
 'web', 
 'medium',
 'The CSS box model describes how elements are rendered, consisting of content, padding, border, and margin.'),

('What is responsive design?', 
 '["Design that adapts to different screen sizes", "Design that responds to clicks", "Design with animations", "Design with colors"]', 
 0, 
 'web', 
 'easy',
 'Responsive design is an approach to web design that makes web pages render well on a variety of devices and screen sizes.'),

-- General Programming Questions
('What is a function?', 
 '["A block of code that performs a specific task", "A type of variable", "A way to style code", "A database table"]', 
 0, 
 'general', 
 'easy',
 'A function is a block of code designed to perform a particular task. It is executed when called.'),

('What is an array?', 
 '["A collection of elements", "A single value", "A type of function", "A way to style elements"]', 
 0, 
 'general', 
 'easy',
 'An array is a data structure that stores a collection of elements, typically of the same type, in a sequential order.'),

('What is a loop?', 
 '["A way to repeat code", "A type of variable", "A function", "A database query"]', 
 0, 
 'general', 
 'easy',
 'A loop is a programming construct that repeats a block of code until a certain condition is met.'),

('What is version control?', 
 '["A system to track changes in code", "A way to compile code", "A type of database", "A testing framework"]', 
 0, 
 'general', 
 'medium',
 'Version control is a system that records changes to files over time, allowing you to recall specific versions later. Git is a popular version control system.'),

('What is Git?', 
 '["A distributed version control system", "A programming language", "A database", "A web framework"]', 
 0, 
 'general', 
 'easy',
 'Git is a distributed version control system used for tracking changes in source code during software development.'),

('What is a database?', 
 '["An organized collection of data", "A programming language", "A web framework", "A type of server"]', 
 0, 
 'general', 
 'easy',
 'A database is an organized collection of data stored and accessed electronically, typically managed by a database management system (DBMS).');

-- ============================================
-- Initial Data: Word Lists for Wordsearch
-- ============================================

INSERT INTO word_lists (name, category, words, difficulty, description) VALUES
('Tech Fundamentals', 'tech', 
 '["REACT", "JAVASCRIPT", "TYPESCRIPT", "NODE", "HTML", "CSS", "API", "NPM"]', 
 'easy',
 'Basic technology terms every developer should know'),

('Programming Languages', 'languages',
 '["PYTHON", "JAVA", "RUBY", "GO", "RUST", "SWIFT", "KOTLIN", "PHP", "DART", "SCALA"]',
 'medium',
 'Popular programming languages'),

('Web Frameworks', 'frameworks',
 '["NEXTJS", "VUE", "ANGULAR", "SVELTE", "EXPRESS", "NESTJS", "DJANGO", "FLASK", "RAILS", "LARAVEL"]',
 'medium',
 'Modern web development frameworks'),

('Database Terms', 'database',
 '["POSTGRESQL", "MONGODB", "MYSQL", "REDIS", "SQLITE", "CASSANDRA", "ELASTICSEARCH", "NEO4J"]',
 'medium',
 'Database technologies and concepts'),

('DevOps Tools', 'devops',
 '["DOCKER", "KUBERNETES", "JENKINS", "GITHUB", "GITLAB", "TERRAFORM", "ANSIBLE", "PROMETHEUS"]',
 'hard',
 'DevOps and infrastructure tools');

-- ============================================
-- Views for Leaderboards
-- ============================================

-- Quiz Leaderboard View (Top 100)
CREATE OR REPLACE VIEW quiz_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as rank,
    player_name,
    score,
    total_questions,
    percentage,
    time_taken,
    created_at
FROM quiz_scores
ORDER BY score DESC, created_at ASC
LIMIT 100;

-- Wordsearch Leaderboard View (Top 100 by fastest time)
CREATE OR REPLACE VIEW wordsearch_leaderboard AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY completion_time ASC, created_at ASC) as rank,
    player_name,
    completion_time,
    words_found,
    total_words,
    percentage,
    difficulty,
    created_at
FROM wordsearch_scores
WHERE words_found = total_words -- Only completed games
ORDER BY completion_time ASC, created_at ASC
LIMIT 100;

-- ============================================
-- Functions for Random Question Selection
-- ============================================

-- Function to get 8 random questions from the pool
CREATE OR REPLACE FUNCTION get_random_quiz_questions(question_count INTEGER DEFAULT 8)
RETURNS TABLE (
    id INTEGER,
    question TEXT,
    options JSONB,
    correct_answer INTEGER,
    category VARCHAR,
    difficulty VARCHAR,
    explanation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qq.id,
        qq.question,
        qq.options,
        qq.correct_answer,
        qq.category,
        qq.difficulty,
        qq.explanation
    FROM quiz_questions qq
    WHERE qq.is_active = true
    ORDER BY RANDOM()
    LIMIT question_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE quiz_questions IS 'Stores the pool of quiz questions. Currently 25 questions available.';
COMMENT ON TABLE quiz_scores IS 'Stores quiz game scores for leaderboard. Score is number of correct answers.';
COMMENT ON TABLE word_lists IS 'Stores word lists for wordsearch games. Each list contains words in JSONB array.';
COMMENT ON TABLE wordsearch_scores IS 'Stores wordsearch game scores. Completion time in seconds, lower is better.';
COMMENT ON FUNCTION get_random_quiz_questions IS 'Returns a random set of questions from the active pool. Default is 8 questions.';
