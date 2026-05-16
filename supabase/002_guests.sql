create table if not exists public.guests (
  id bigint generated always as identity primary key,
  slug text not null unique,
  khmer_name text not null,
  english_name text,
  title text,
  relationship text not null default 'guest' check (
    relationship in ('guest', 'friend', 'family', 'immediate-family', 'vip', 'colleague')
  ),
  status text not null default 'pending' check (status in ('pending', 'sent', 'confirmed', 'declined')),
  source text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guests_relationship_idx
  on public.guests (relationship);

create index if not exists guests_status_idx
  on public.guests (status);

create index if not exists guests_created_at_idx
  on public.guests (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists guests_set_updated_at on public.guests;
create trigger guests_set_updated_at
before update on public.guests
for each row execute function public.set_updated_at();

-- Link comments to known guests when slug matches.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'guest_comments_guest_slug_fkey'
  ) then
    alter table public.guest_comments
      drop constraint guest_comments_guest_slug_fkey;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'guest_comments_guest_slug_to_guests_fkey'
  ) then
    alter table public.guest_comments
      add constraint guest_comments_guest_slug_to_guests_fkey
      foreign key (guest_slug) references public.guests(slug)
      on update cascade on delete cascade;
  end if;
end $$;

alter table public.guests enable row level security;
