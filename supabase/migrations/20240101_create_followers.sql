-- Mosque Followers / Favorites
CREATE TABLE IF NOT EXISTS mosque_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mosque_id UUID REFERENCES mosques(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, mosque_id)
);

-- Index for faster lookups
CREATE INDEX idx_mosque_followers_user ON mosque_followers(user_id);
CREATE INDEX idx_mosque_followers_mosque ON mosque_followers(mosque_id);
