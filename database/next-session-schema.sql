-- ============================================
-- Next Session Schema
-- ============================================
-- Stores the single "next session" for countdown display.
-- Admin sets scheduled_at, title, and description.

CREATE TABLE IF NOT EXISTS next_session (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    scheduled_at TIMESTAMPTZ,
    title VARCHAR(255) DEFAULT '',
    description TEXT DEFAULT '',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default row so GET always returns something
INSERT INTO next_session (id, title, description)
VALUES (1, '', '')
ON CONFLICT (id) DO NOTHING;
