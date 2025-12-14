-- Add admin reply fields to mosque_ratings so mosque admins can respond to comments
alter table public.mosque_ratings
  add column if not exists admin_reply text,
  add column if not exists admin_reply_at timestamp with time zone;

