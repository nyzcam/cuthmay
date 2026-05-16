create table if not exists public.guest_comments (
  id bigint generated always as identity primary key,
  guest_slug text not null,
  guest_name text not null,
  comment text not null,
  source text not null default 'invite',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists guest_comments_guest_slug_idx
  on public.guest_comments (guest_slug);

create index if not exists guest_comments_created_at_idx
  on public.guest_comments (created_at desc);

-- If you are using Supabase Row Level Security, keep API writes server-side with service role key.
alter table public.guest_comments enable row level security;
