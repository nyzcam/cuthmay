-- Allow guest comment page_path to be either legacy invite path or event-based invite path.
-- Also backfill legacy invite paths to event-based paths when event_id is available.

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

update public.guest_comments gc
set page_path = '/' || e.slug || '/' || gc.guest_slug
from public.events e
where gc.event_id = e.id
  and gc.page_path = '/invite/' || gc.guest_slug;
