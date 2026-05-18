-- Example script to assign roles to users in Supabase
-- Run this in your Supabase SQL Editor to promote a user

-- 1. Promote a user to super_admin
update auth.users
set raw_user_meta_data = jsonb_set(
  coalesce(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"super_admin"'
)
where email = 'kumpheakmny.set@gmail.com';

-- 2. Promote a user to admin
update auth.users
set raw_user_meta_data = jsonb_set(
  coalesce(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
where email = 'deth.vattana@gmail.com';

-- To verify current user roles:
-- select email, raw_user_meta_data->>'role' as role from auth.users;
