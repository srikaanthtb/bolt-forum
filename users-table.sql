-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  email text not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies
create policy "Users can read all user profiles"
  on users
  for select
  using (true);

create policy "Users can update their own profile"
  on users
  for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on users
  for insert
  with check (auth.uid() = id); 