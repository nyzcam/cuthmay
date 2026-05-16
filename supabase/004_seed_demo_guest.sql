insert into public.guests (
  slug,
  khmer_name,
  english_name,
  title,
  relationship,
  status,
  source
)
values (
  'demo-guest',
  'ភ្ញៀវសាកល្បង',
  'Demo Guest',
  'លោក',
  'guest',
  'pending',
  'seed'
)
on conflict (slug) do update
set
  khmer_name = excluded.khmer_name,
  english_name = excluded.english_name,
  title = excluded.title,
  relationship = excluded.relationship,
  status = excluded.status,
  source = excluded.source,
  updated_at = now();
