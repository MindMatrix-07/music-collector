-- Create the tracks table
create table public.tracks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  artist text not null,
  status text check (status in ('AVAILABLE', 'PENDING', 'FAILED')) default 'PENDING',
  playback_metadata jsonb,
  last_updated timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.tracks enable row level security;

-- Create policy to allow public read access
create policy "Public tracks are viewable by everyone"
  on public.tracks for select
  using (true);

-- Create policy to allow service role (collector) to insert/update
create policy "Service role can insert and update tracks"
  on public.tracks for all
  using (true)
  with check (true);

-- Create the request_queue table
create table public.request_queue (
  id uuid default gen_random_uuid() primary key,
  query text not null,
  requested_at timestamp with time zone default now(),
  priority integer default 0
);

-- Enable RLS
alter table public.request_queue enable row level security;

-- Create policy to allow public to insert requests (if authenticated or strict anon, adjust as needed)
-- For now allowing anon insert for demo purposes, secure as needed
create policy "Public can insert requests"
  on public.request_queue for insert
  with check (true);

-- Create policy to allow collector to read/delete from queue
create policy "Service role can manage queue"
  on public.request_queue for all
  using (true)
  with check (true);
