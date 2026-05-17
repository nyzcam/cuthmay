alter table public.guests
  add column if not exists created_by_user_id text,
  add column if not exists created_by_email text,
  add column if not exists created_by_name text;

create index if not exists guests_created_by_user_id_idx
  on public.guests (created_by_user_id);