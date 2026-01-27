-- ============================================
-- Voting System Schema
-- ============================================

-- Voting Questions Table
CREATE TABLE IF NOT EXISTS voting_questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Voting Options Table
CREATE TABLE IF NOT EXISTS voting_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES voting_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES voting_questions(id) ON DELETE CASCADE,
    option_id INTEGER NOT NULL REFERENCES voting_options(id) ON DELETE CASCADE,
    voter_ip VARCHAR(45), -- Store IP to prevent duplicate votes (optional)
    voter_session VARCHAR(255), -- Store session ID to prevent duplicate votes
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(question_id, voter_session) -- Prevent duplicate votes per session
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voting_questions_active ON voting_questions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_voting_options_question ON voting_options(question_id);
CREATE INDEX IF NOT EXISTS idx_votes_question ON votes(question_id);
CREATE INDEX IF NOT EXISTS idx_votes_option ON votes(option_id);
CREATE INDEX IF NOT EXISTS idx_votes_created ON votes(created_at DESC);

-- View for vote counts
CREATE OR REPLACE VIEW voting_results AS
SELECT 
    vq.id as question_id,
    vq.question,
    vo.id as option_id,
    vo.option_text,
    vo.display_order,
    COUNT(v.id) as vote_count,
    CASE 
        WHEN SUM(COUNT(v.id)) OVER (PARTITION BY vq.id) > 0 
        THEN ROUND((COUNT(v.id)::DECIMAL / SUM(COUNT(v.id)) OVER (PARTITION BY vq.id)) * 100, 2)
        ELSE 0
    END as percentage,
    MAX(v.created_at) as last_vote_at
FROM voting_questions vq
LEFT JOIN voting_options vo ON vq.id = vo.question_id
LEFT JOIN votes v ON vo.id = v.option_id
WHERE vq.is_active = true
GROUP BY vq.id, vq.question, vo.id, vo.option_text, vo.display_order
ORDER BY vq.id, vo.display_order;

-- Function to get total votes for a question
CREATE OR REPLACE FUNCTION get_total_votes(question_id_param INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM votes 
        WHERE question_id = question_id_param
    );
END;
$$ LANGUAGE plpgsql;
