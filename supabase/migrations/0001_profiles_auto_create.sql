-- =========================================================================
-- Merkly: fix auto-create profiles bij nieuwe user
-- =========================================================================
-- Probleem: "Database error saving new user" bij inloggen.
--
-- Bestaand schema (belangrijk om te respecteren):
--   - profiles.id  uuid PK, FK → auth.users(id)
--   - profiles.user_id uuid UNIQUE, FK → auth.users(id) ON DELETE CASCADE
--   - RLS policies gebruiken user_id = auth.uid()
--   - email was NOT NULL zonder default
--
-- Fix:
--   1. email nullable (OAuth-providers zonder email scope niet crashen)
--   2. handle_new_user() vult BEIDE id én user_id met new.id + new.email
--   3. Exception handler → signup nooit blokkeren
--   4. Backfill voor bestaande users zonder profielrij
-- =========================================================================

-- 1. email nullable
alter table public.profiles alter column email drop not null;

-- 2. Trigger-functie: id + user_id beide = new.id (beide nodig voor FK én policies)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, user_id, email, subscription_status)
  values (new.id, new.id, new.email, 'free')
  on conflict (id) do nothing;
  return new;
exception
  when others then
    raise warning '[handle_new_user] profiel aanmaken mislukt voor %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- 3. Trigger opnieuw koppelen (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Backfill — users zonder profielrij alsnog aanmaken
insert into public.profiles (id, user_id, email, subscription_status)
select u.id, u.id, u.email, 'free'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
