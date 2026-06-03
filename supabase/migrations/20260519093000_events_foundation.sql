create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  owner_user_id text not null default 'system',
  theme text not null default 'default',
  display_name text not null,
  groom_name text,
  bride_name text,
  wedding_date timestamptz,
  location_text text,
  hero_title text,
  hero_subtitle text,
  invitation_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_owner_user_id_idx
  on public.events (owner_user_id);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;

insert into public.events (
  id,
  slug,
  owner_user_id,
  display_name,
  groom_name,
  bride_name,
  wedding_date,
  location_text,
  hero_title,
  hero_subtitle,
  invitation_text
)
values (
  '00000000-0000-0000-0000-000000000001',
  'default',
  'system',
  'Seth & Vattana Wedding',
  'សែត កុម្ភម្នី',
  'ដេត វឌ្ឍណា',
  '2027-01-17T18:00:00+07:00',
  'នៅភូមិអន្លង់គគី ឃុំកណ្ដោល ស្រុកទឹកឈូ ខេត្តកំពត',
  'សិរីសួស្ដីអាពាហ៍ពិពាហ៍',
  'សូមគោរមអញ្ជើញ',
  'ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា'
)
on conflict (id) do nothing;

alter table public.guests
  add column if not exists event_id uuid references public.events(id) on delete cascade;

alter table public.guests
  alter column event_id set default '00000000-0000-0000-0000-000000000001'::uuid;

update public.guests
set event_id = '00000000-0000-0000-0000-000000000001'::uuid
where event_id is null;

create index if not exists guests_event_id_idx
  on public.guests (event_id);

alter table public.guest_comments
  add column if not exists event_id uuid references public.events(id) on delete cascade;

alter table public.guest_comments
  alter column event_id set default '00000000-0000-0000-0000-000000000001'::uuid;

update public.guest_comments
set event_id = '00000000-0000-0000-0000-000000000001'::uuid
where event_id is null;

create index if not exists guest_comments_event_id_idx
  on public.guest_comments (event_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'guests_event_slug_unique'
  ) then
    alter table public.guests
      add constraint guests_event_slug_unique unique (event_id, slug);
  end if;
end $$;
