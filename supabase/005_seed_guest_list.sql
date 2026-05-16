insert into public.guests (
  slug,
  khmer_name,
  english_name,
  title,
  relationship,
  status,
  source
)
values
  ('khmer', 'ខ្មែរ', 'khmer', null, 'guest', 'pending', 'seed'),
  ('phal-minea', 'ផល មីនា', 'Phal Minea', 'លោក', 'friend', 'pending', 'seed'),
  ('deth-vattana', 'ដេត វឌ្ឍនា', 'Deth Vattana', 'កញ្ញា', 'guest', 'pending', 'seed'),
  ('dara', 'តារា', 'dara', 'លោក', 'guest', 'pending', 'seed'),
  ('chan-thida', 'ចាន់ ធីដា', 'Chan Thida', 'អ្នកនាង', 'friend', 'pending', 'seed'),
  ('heang-sophorn', 'ហៀង សុផុន', 'Heang Sophorn', 'ឯកឧត្តម', 'vip', 'pending', 'seed'),
  ('khoun-pinuch', 'ខួន ពិនុច', 'Khoun Pinuch', 'អ្នកនាង', 'vip', 'pending', 'seed'),
  ('kimseng-company-team', 'ក្រុមការងារ គីមសេង', 'Kimseng Company Team', 'ក្រុម', 'colleague', 'pending', 'seed'),
  ('ly-sopheap', 'លី សុភាព', 'Ly Sopheap', 'លោក', 'friend', 'pending', 'seed'),
  ('meach-samphy', 'មាស សំផី', 'Meach Samphy', 'លោកជំទាវ', 'vip', 'pending', 'seed'),
  ('pon-leak', 'ពន្លឺក', 'Pon Leak', 'លោក', 'family', 'pending', 'seed'),
  ('seth-kompheakmony', 'សែត កុម្ភម្នី', 'Seth Kompheakmony', 'លោក', 'family', 'pending', 'seed'),
  ('seths-parents', 'ឪពុកម្តាយ សែត', 'Seth''s Parents', 'គ្រួសារ', 'immediate-family', 'pending', 'seed'),
  ('sok-sreyneang', 'សុក ស្រីនាង', 'Sok Sreyneang', 'លោកស្រី', 'family', 'pending', 'seed'),
  ('soks-parents', 'ឪពុកម្តាយ សុក', 'Sok''s Parents', 'គ្រួសារ', 'immediate-family', 'pending', 'seed'),
  ('song-rambot', 'សុង រាំប៉ូ និង ភរិយា', 'Song Rambot', 'លោក', 'vip', 'pending', 'seed'),
  ('vong-sothea', 'វង្ស សុធា', 'Vong Sothea', 'លោក', 'family', 'pending', 'seed'),
  ('yeng-vireak-sumeth', 'យ៉េង វីរៈសុមេធិ', 'Yeng Vireak Sumeth', 'លោក', 'vip', 'pending', 'seed')
on conflict (slug) do update
set
  khmer_name = excluded.khmer_name,
  english_name = excluded.english_name,
  title = excluded.title,
  relationship = excluded.relationship,
  status = excluded.status,
  source = excluded.source,
  updated_at = now();
