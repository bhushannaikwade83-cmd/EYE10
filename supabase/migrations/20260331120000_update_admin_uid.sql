-- Update seeded admin user id to latest UUID.
delete from public.admins
where user_id = '5d24ef3a-40ec-4750-a9a0-5c3107a5674e';

insert into public.admins (user_id)
values ('f007fffd-0d30-443e-a7a3-b9212c372683')
on conflict (user_id) do nothing;
