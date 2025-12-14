-- Mosque Ratings & Reviews
CREATE TABLE IF NOT EXISTS mosque_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mosque_id UUID REFERENCES mosques(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mosque_id, user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'event', 'charity', 'prayer_time', 'system'
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mosque_ratings_mosque ON mosque_ratings(mosque_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
