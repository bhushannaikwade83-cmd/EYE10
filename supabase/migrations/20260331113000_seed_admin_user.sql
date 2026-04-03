-- Seed one admin user (auth.users.id) for admin panel access.
insert into public.admins (user_id)
values ('265960a3-52eb-46ba-8354-ed7f00bb3a1d')
on conflict (user_id) do nothing;
