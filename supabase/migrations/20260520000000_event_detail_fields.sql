-- Add detail fields to events table: parents, lunar date, directions, map URL

alter table public.events
  add column if not exists groom_father_name text,
  add column if not exists groom_mother_name text,
  add column if not exists bride_father_name text,
  add column if not exists bride_mother_name text,
  add column if not exists lunar_date text,
  add column if not exists direction_map_url text,
  add column if not exists directions_json jsonb;

-- Update default event with existing static values
update public.events
set
  groom_father_name = 'លោក ម៉ៅ​ គួន',
  groom_mother_name = 'លោកស្រី ពូន ហុង',
  bride_father_name = 'លោក ស្រី ចាន់ដេត',
  bride_mother_name = 'លោកស្រី យ៉ង់ សោភ័ណ្ឌ',
  lunar_date = 'ថ្ងៃអាទិត្យ ១០កើត ខែបុស្ស ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០',
  direction_map_url = 'https://maps.app.goo.gl/ZiEYZU2GpxkvH49DA?g_st=ic',
  directions_json = '[
    {"id": 1, "description": "ចេញពីស្ពានអាកាសចោមចៅ តាមផ្លូវជាតិលេខ ៣ ចម្ងាយប្រមាណ", "detail": "ដល់ខ្លោងទ្វារវត្តសិរីធានីខាងឆ្វេងដៃ រួចបត់ចូលប្រមាណ ១.៥គ.ម លោកអ្នកនឹងទៅដល់ផ្ទះពិធីមង្គលការ។"},
    {"id": 2, "description": "ចេញពីរង្វង់មូលទុរេន តាមផ្លូវជាតិលេខ ៣ ចម្ងាយប្រមាណ", "detail": "ដល់ខ្លោងទ្វារវត្តសិរីធានីខាងស្ដាំដៃ រួចបត់ចូលប្រមាណ ១.៥គ.ម លោកអ្នកនឹងទៅដល់ផ្ទះពិធីមង្គលការ។"}
  ]'::jsonb
where id = '00000000-0000-0000-0000-000000000001';
