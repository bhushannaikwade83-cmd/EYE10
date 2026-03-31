-- Seed one admin user (auth.users.id) for admin panel access.
insert into public.admins (user_id)
values ('5d24ef3a-40ec-4750-a9a0-5c3107a5674e')
on conflict (user_id) do nothing;
