-- Sample seed data for Mosque Connect
-- Run after schema.sql

-- Create a super admin user
insert into public.users (id, clerk_id, email, first_name, last_name, role)
values (uuid_generate_v4(), 'super-admin-clerk-id', 'ultrotech1236@gmail.com', 'Super', 'Admin', 'super_admin')
on conflict (clerk_id) do nothing;

-- Create a mosque admin user
insert into public.users (id, clerk_id, email, first_name, last_name, role)
values (uuid_generate_v4(), 'mosque-admin-clerk-id', 'admin@example.com', 'Mosque', 'Admin', 'mosque_admin')
on conflict (clerk_id) do nothing;

-- Create a community user
insert into public.users (id, clerk_id, email, first_name, last_name, role)
values (uuid_generate_v4(), 'community-user-clerk-id', 'user@example.com', 'Community', 'User', 'community_user')
on conflict (clerk_id) do nothing;

-- Seed mosques
insert into public.mosques (id, name, address, latitude, longitude, admin_id, verified)
select uuid_generate_v4(), 'Al-Noor Islamic Center', '123 Crescent Ave, Springfield', 40.7128, -74.0060, u.id, true
from public.users u where u.clerk_id = 'mosque-admin-clerk-id'
on conflict do nothing;

insert into public.mosques (id, name, address, latitude, longitude, verified)
values (uuid_generate_v4(), 'Masjid As-Salaam', '456 Unity Rd, Greenfield', 34.0522, -118.2437, true)
on conflict do nothing;

-- Seed prayer times for first mosque
insert into public.prayer_times (mosque_id, prayer_name, prayer_time, date)
select m.id, 'fajr', '05:30', current_date
from public.mosques m where m.name = 'Al-Noor Islamic Center'
on conflict do nothing;

insert into public.prayer_times (mosque_id, prayer_name, prayer_time, date)
select m.id, 'dhuhr', '13:15', current_date
from public.mosques m where m.name = 'Al-Noor Islamic Center'
on conflict do nothing;

insert into public.prayer_times (mosque_id, prayer_name, prayer_time, date)
select m.id, 'asr', '16:45', current_date
from public.mosques m where m.name = 'Al-Noor Islamic Center'
on conflict do nothing;

insert into public.prayer_times (mosque_id, prayer_name, prayer_time, date)
select m.id, 'maghrib', '18:05', current_date
from public.mosques m where m.name = 'Al-Noor Islamic Center'
on conflict do nothing;

insert into public.prayer_times (mosque_id, prayer_name, prayer_time, date)
select m.id, 'isha', '19:30', current_date
from public.mosques m where m.name = 'Al-Noor Islamic Center'
on conflict do nothing;

-- Seed an event
insert into public.events (mosque_id, title, category, event_date, location)
select m.id, 'Community Iftar', 'Community', now() + interval '2 days', 'Main Hall'
from public.mosques m where m.name = 'Al-Noor Islamic Center'
on conflict do nothing;

-- Seed a charity campaign
insert into public.charity_opportunities (mosque_id, title, goal_amount, current_amount, end_date)
select m.id, 'Mosque Renovation', 20000, 5000, now() + interval '30 days'
from public.mosques m where m.name = 'Al-Noor Islamic Center'
on conflict do nothing;

-- Seed a rating
insert into public.mosque_ratings (mosque_id, user_id, rating, comment)
select m.id, u.id, 5, 'Beautiful community and well organized.'
from public.mosques m, public.users u
where m.name = 'Al-Noor Islamic Center' and u.clerk_id = 'community-user-clerk-id'
on conflict do nothing;

-- Seed a favorite
insert into public.user_favorites (user_id, mosque_id)
select u.id, m.id
from public.users u, public.mosques m
where u.clerk_id = 'community-user-clerk-id' and m.name = 'Al-Noor Islamic Center'
on conflict do nothing;

-- Seed an admin request (pending)
insert into public.admin_requests (user_id, mosque_id, status, notes)
select u.id, m.id, 'pending', 'I am the appointed admin for this mosque.'
from public.users u, public.mosques m
where u.clerk_id = 'community-user-clerk-id' and m.name = 'Al-Noor Islamic Center'
on conflict do nothing;
