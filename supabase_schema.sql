-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table (Linked to Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text,
  full_name text,
  avatar_url text,
  role text default 'admin' check (role in ('admin', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- 2. Create Prediction Logs Table
create table public.prediction_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id),
  inputs jsonb not null, -- Stores the "What-If" inputs
  outputs jsonb not null, -- Stores the ML model outputs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Prediction Logs
alter table public.prediction_logs enable row level security;

create policy "Admins can view all logs"
  on prediction_logs for select
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Admins can insert logs"
  on prediction_logs for insert
  with check ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

-- 3. Create Reports Table
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id),
  title text not null,
  content text not null, -- Markdown or JSON content
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Reports
alter table public.reports enable row level security;

create policy "Admins can view all reports"
  on reports for select
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Admins can insert reports"
  on reports for insert
  with check ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

-- 4. Function to handle new user signup (Trigger)
-- This automatically creates a profile entry when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, role)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', 'admin');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Create Decisions Table (For "Approve & Publish")
create table public.decisions (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id),
  title text not null,
  category text,
  description text,
  impact text,
  status text default 'PUBLISHED',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Decisions
alter table public.decisions enable row level security;

create policy "Admins can view all decisions"
  on decisions for select
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Admins can insert decisions"
  on decisions for insert
  with check ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

-- 6. Create Public Feedback Table
create table public.public_feedback (
  id uuid default uuid_generate_v4() primary key,
  directive_id text, -- Changed to text to support both UUIDs and Mock IDs ("1")
  is_positive boolean default true,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Public Feedback
alter table public.public_feedback enable row level security;

-- Allow anyone (anon) to insert feedback
create policy "Anyone can insert feedback"
  on public_feedback for insert
  with check ( true );

-- Only admins can view feedback
create policy "Admins can view feedback"
  on public_feedback for select
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );
