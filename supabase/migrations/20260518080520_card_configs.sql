create table if not exists public.card_configs (
  id bigint generated always as identity primary key,
  user_id text not null unique, -- The admin (vendor) this card belongs to
  theme text not null default 'default',
  
  -- Hero Config
  hero_short_name text,
  hero_date text,
  
  -- Detail Config
  detail_date text,
  detail_name text,
  detail_location_footnote text,
  detail_map_url text,
  
  -- Timeline Config (JSON array of events)
  timeline_config jsonb default '[]'::jsonb,
  
  -- QR Config
  qr_payment_url text,
  qr_name text,
  qr_image_url text, -- For later implementation

  -- Gallery Config placeholders
  gallery_config jsonb default '[]'::jsonb,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists card_configs_user_id_idx
  on public.card_configs (user_id);

create trigger card_configs_set_updated_at
before update on public.card_configs
for each row execute function public.set_updated_at();

alter table public.card_configs enable row level security;
