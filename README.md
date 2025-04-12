# Bolt Forum

A Twitter-like forum web application built with Next.js and Supabase.

## Features

- User authentication (sign up, sign in, sign out)
- Create posts
- View posts from all users
- Like posts
- User profiles

## Technologies Used

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Authentication & Database)
- date-fns

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/bolt-forum.git
cd bolt-forum
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Set up Supabase:

   - Create a new Supabase project
   - Set up the database schema (see below)
   - Get your Supabase URL and anon key

4. Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Users Table

This table is automatically created by Supabase Auth.

### Posts Table

```sql
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.posts enable row level security;

-- Policies
create policy "Users can read all posts"
  on posts
  for select
  using (true);

create policy "Users can insert their own posts"
  on posts
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on posts
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on posts
  for delete
  using (auth.uid() = user_id);
```

### Likes Table

```sql
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique (user_id, post_id)
);

-- Enable RLS
alter table public.likes enable row level security;

-- Policies
create policy "Users can read all likes"
  on likes
  for select
  using (true);

create policy "Users can insert their own likes"
  on likes
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on likes
  for delete
  using (auth.uid() = user_id);
```

## License

MIT
