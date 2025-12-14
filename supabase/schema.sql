-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis"; -- For location-based queries

-- Create users table (synced with Clerk)
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  clerk_id text unique not null,
  email text unique not null,
  first_name text,
  last_name text,
  avatar_url text,
  role text default 'community_user' check (role in ('community_user', 'mosque_admin', 'super_admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create mosques table
create table public.mosques (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  phone text,
  website text,
  image_url text,
  admin_id uuid references public.users(id),
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create prayer_times table
create table public.prayer_times (
  id uuid default uuid_generate_v4() primary key,
  mosque_id uuid references public.mosques(id) on delete cascade not null,
  prayer_name text check (prayer_name in ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')) not null,
  prayer_time time not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(mosque_id, date, prayer_name)
);

-- Create events table
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  mosque_id uuid references public.mosques(id) on delete cascade not null,
  title text not null,
  description text,
  category text,
  event_date timestamp with time zone not null,
  location text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create charity_opportunities table
create table public.charity_opportunities (
  id uuid default uuid_generate_v4() primary key,
  mosque_id uuid references public.mosques(id) on delete cascade not null,
  title text not null,
  description text,
  goal_amount decimal(10, 2),
  current_amount decimal(10, 2) default 0,
  end_date timestamp with time zone,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create mosque_ratings table
create table public.mosque_ratings (
  id uuid default uuid_generate_v4() primary key,
  mosque_id uuid references public.mosques(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  admin_reply text,
  admin_reply_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(mosque_id, user_id)
);

-- Create user_favorites table
create table public.user_favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  mosque_id uuid references public.mosques(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, mosque_id)
);

-- Create notification_preferences table
create table public.notification_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  mosque_id uuid references public.mosques(id) on delete cascade not null,
  prayer_times boolean default false,
  events boolean default false,
  charity boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, mosque_id)
);

-- Create admin_requests table
create table public.admin_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  mosque_id uuid references public.mosques(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.mosques enable row level security;
alter table public.prayer_times enable row level security;
alter table public.events enable row level security;
alter table public.charity_opportunities enable row level security;
alter table public.mosque_ratings enable row level security;
alter table public.user_favorites enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.admin_requests enable row level security;

-- RLS Policies

-- Users
create policy "Users can view their own profile"
  on public.users for select
  using (clerk_id = auth.jwt() ->> 'sub');

create policy "Users can update their own profile"
  on public.users for update
  using (clerk_id = auth.jwt() ->> 'sub');

-- Mosques
create policy "Mosques are viewable by everyone"
  on public.mosques for select
  using (true);

create policy "Mosque admins can update their own mosques"
  on public.mosques for update
  using (admin_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

create policy "Mosque admins can create mosques"
  on public.mosques for insert
  with check (admin_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

create policy "Super admins can update all mosques"
  on public.mosques for update
  using (exists (select 1 from public.users where clerk_id = auth.jwt() ->> 'sub' and role = 'super_admin'));

-- Prayer Times
create policy "Prayer times are viewable by everyone"
  on public.prayer_times for select
  using (true);

create policy "Mosque admins can manage prayer times"
  on public.prayer_times for all
  using (mosque_id in (select id from public.mosques where admin_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub')));

-- Events
create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

create policy "Mosque admins can manage events"
  on public.events for all
  using (mosque_id in (select id from public.mosques where admin_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub')));

-- Charity Opportunities
create policy "Charity opportunities are viewable by everyone"
  on public.charity_opportunities for select
  using (true);

create policy "Mosque admins can manage charity"
  on public.charity_opportunities for all
  using (mosque_id in (select id from public.mosques where admin_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub')));

-- Ratings
create policy "Ratings are viewable by everyone"
  on public.mosque_ratings for select
  using (true);

create policy "Authenticated users can create ratings"
  on public.mosque_ratings for insert
  with check (exists (select 1 from public.users where id = user_id and clerk_id = auth.jwt() ->> 'sub'));

create policy "Users can update their own ratings"
  on public.mosque_ratings for update
  using (user_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

-- Favorites
create policy "Users can view their own favorites"
  on public.user_favorites for select
  using (user_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

create policy "Users can manage their own favorites"
  on public.user_favorites for all
  using (user_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

-- Admin Requests
create policy "Super admins can view all requests"
  on public.admin_requests for select
  using (exists (select 1 from public.users where clerk_id = auth.jwt() ->> 'sub' and role = 'super_admin'));

create policy "Users can view their own requests"
  on public.admin_requests for select
  using (user_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

create policy "Users can create requests"
  on public.admin_requests for insert
  with check (user_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));
