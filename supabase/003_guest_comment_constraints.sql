-- Enforce that each comment is bound to the guest invite URL and limit to 3 comments per guest.

alter table public.guest_comments
  add column if not exists page_path text;

update public.guest_comments
set page_path = '/invite/' || guest_slug
where page_path is null;

alter table public.guest_comments
  alter column page_path set not null;

alter table public.guest_comments
  drop constraint if exists guest_comments_page_path_check;

alter table public.guest_comments
  add constraint guest_comments_page_path_check
  check (
    page_path = '/invite/' || guest_slug
    or (
      page_path like '/%/%'
      and split_part(page_path, '/', 2) <> ''
      and split_part(page_path, '/', 3) = guest_slug
      and split_part(page_path, '/', 4) = ''
    )
  );

create or replace function public.enforce_guest_comment_limit()
returns trigger
language plpgsql
as $$
declare
  existing_count integer;
begin
  select count(*)
  into existing_count
  from public.guest_comments
  where guest_slug = new.guest_slug;

  if existing_count >= 3 then
    raise exception 'A guest can only submit up to 3 comments';
  end if;

  return new;
end;
$$;

drop trigger if exists guest_comments_limit_trigger on public.guest_comments;
create trigger guest_comments_limit_trigger
before insert on public.guest_comments
for each row execute function public.enforce_guest_comment_limit();
