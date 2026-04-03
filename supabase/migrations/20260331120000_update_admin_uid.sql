-- Update seeded admin user id to latest UUID (removes legacy seed rows if present).
delete from public.admins
where user_id in (
  '5d24ef3a-40ec-4750-a9a0-5c3107a5674e',
  'f007fffd-0d30-443e-a7a3-b9212c372683'
);

insert into public.admins (user_id)
values ('265960a3-52eb-46ba-8354-ed7f00bb3a1d')
on conflict (user_id) do nothing;
