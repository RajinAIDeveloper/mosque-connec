-- Migration: Add Mosque Admin mobile app fields
-- Created: 2025-12-13

-- 1. Add mosque status and admin-specific fields
ALTER TABLE public.mosques
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
  ADD COLUMN IF NOT EXISTS women_prayer_allowed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS madhabs TEXT[] DEFAULT '{}';

-- 2. Add jummah time support to prayer_times
ALTER TABLE public.prayer_times
  ADD COLUMN IF NOT EXISTS is_jummah BOOLEAN DEFAULT false;

-- 3. Add status to charity_opportunities for completion tracking
ALTER TABLE public.charity_opportunities
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'completed'));

-- 4. Add user phone for WhatsApp features
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- 5. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_mosques_status ON public.mosques(status);
CREATE INDEX IF NOT EXISTS idx_mosques_admin_id ON public.mosques(admin_id);
CREATE INDEX IF NOT EXISTS idx_charity_status ON public.charity_opportunities(status);

-- 6. Add RLS policy for mosque admins to reply to ratings
CREATE POLICY IF NOT EXISTS "Mosque admins can reply to ratings" 
  ON public.mosque_ratings FOR UPDATE
  USING (
    mosque_id IN (
      SELECT id FROM public.mosques 
      WHERE admin_id IN (
        SELECT id FROM public.users WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- 7. Create notification settings table for mobile app
CREATE TABLE IF NOT EXISTS public.admin_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  prayer_reminders BOOLEAN DEFAULT true,
  event_alerts BOOLEAN DEFAULT true,
  new_followers BOOLEAN DEFAULT false,
  new_ratings BOOLEAN DEFAULT true,
  low_rating_alerts BOOLEAN DEFAULT true,
  charity_updates BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admin_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS policy for notification settings
CREATE POLICY "Users can manage their own notification settings"
  ON public.admin_notification_settings FOR ALL
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = auth.jwt() ->> 'sub'));
