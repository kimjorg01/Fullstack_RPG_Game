-- 1. Create a table for public profiles (linked to auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  credits int default 50 not null, -- Free starting credits
  total_runs int default 0,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Constraint: Username length
  constraint username_length check (char_length(username) >= 3)
);

-- 2. Enable RLS on profiles
alter table profiles enable row level security;

-- 3. Create Policy: Everyone can READ profiles (needed for leaderboards later)
create policy "Public profiles are viewable by everyone" 
on profiles for select 
using ( true );

-- 4. Create Policy: Users can UPDATE their own profile
create policy "Users can update own profile" 
on profiles for update 
using ( auth.uid() = id );

-- 5. CRITICAL SECURITY: Prevent users from updating their own 'credits' column via the API.
-- This ensures only your Server Actions (Service Role) can modify credits.
revoke update (credits) on table profiles from authenticated;
revoke update (credits) on table profiles from anon;

-- 6. Function to handle new user signup automatically
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, credits, avatar_url)
  values (
    new.id, 
    'Traveler ' || substr(new.id::text, 1, 4), -- Default name: Traveler a1b2
    50, -- Default free credits
    ''
  );
  return new;
end;
$$ language plpgsql security definer;

-- 7. Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. (Optional) Database Function to safely deduct credits
-- This makes it easy for your Server Actions to call "deduct_credit"
create or replace function deduct_credit(user_uuid uuid, amount int)
returns void as $$
begin
  update profiles
  set credits = credits - amount
  where id = user_uuid
  and credits >= amount; -- Prevents going below zero
  
  if not found then
    raise exception 'Insufficient credits';
  end if;
end;
$$ language plpgsql security definer;


-- Create a table for game saves
create table saves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  character_name text,
  genre text,
  level int,
  game_state jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (Security Policy)
alter table saves enable row level security;

-- Policy: Users can see only their own saves
create policy "Users can view own saves" 
on saves for select 
using (auth.uid() = user_id);

-- Policy: Users can insert their own saves
create policy "Users can insert own saves" 
on saves for insert 
with check (auth.uid() = user_id);

-- Policy: Users can update their own saves
create policy "Users can update own saves" 
on saves for update 
using (auth.uid() = user_id);

-- Policy: Users can delete their own saves
create policy "Users can delete own saves" 
on saves for delete 
using (auth.uid() = user_id);