-- Create event_admins join table for many-to-many admin relationships
create table if not exists public.event_admins (
  id bigint generated always as identity primary key,
  event_id uuid not null references public.events(id) on delete cascade,
  user_id text not null,
  role text not null default 'admin' check (role in ('admin', 'owner')),
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create index if not exists event_admins_event_id_idx
  on public.event_admins (event_id);

create index if not exists event_admins_user_id_idx
  on public.event_admins (user_id);

-- Migrate existing owner_user_id to event_admins table
insert into public.event_admins (event_id, user_id, role)
select id, owner_user_id, 'owner'
from public.events
where owner_user_id != 'system'
on conflict (event_id, user_id) do nothing;

-- Helper function to check if user is admin of event
create or replace function public.is_event_admin(
  p_event_id uuid,
  p_user_id text
) returns boolean as $$
begin
  return exists(
    select 1
    from public.event_admins
    where event_id = p_event_id
      and user_id = p_user_id
  );
end;
$$ language plpgsql stable;

alter table public.event_admins enable row level security;
