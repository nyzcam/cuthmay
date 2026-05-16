alter table public.guest_comments
  drop constraint if exists guest_comments_status_check;

alter table public.guest_comments
  add constraint guest_comments_status_check
  check (status in ('new', 'reviewed', 'archived'));

create index if not exists guest_comments_status_idx
  on public.guest_comments (status);
