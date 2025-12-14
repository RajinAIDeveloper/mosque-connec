-- Add ticketing and seat limit fields to events
alter table public.events
  add column if not exists is_paid boolean default false,
  add column if not exists ticket_price numeric(10, 2),
  add column if not exists has_seat_limit boolean default false,
  add column if not exists total_seats integer,
  add column if not exists available_seats integer;
