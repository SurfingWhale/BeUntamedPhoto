-- A signed-in visitor could PATCH their own profiles row and set role='owner',
-- because `authenticated` held UPDATE on every column and the RLS policy only
-- checked row ownership. Two independent guards now stop that.

-- 1. Column privileges: visitors may only rewrite their display name.
revoke update on public.profiles from anon, authenticated;
grant  update (display_name) on public.profiles to authenticated;

-- 2. Trigger guard, in case a later migration re-grants the column.
--    Owners may promote other people; nobody may promote themselves.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- Direct database connections (psql, migrations) carry no JWT.
    if coalesce(current_setting('request.jwt.claims', true), '') = '' then
      return new;
    end if;
    if auth.role() = 'service_role' then
      return new;
    end if;
    if not public.is_owner() or auth.uid() = new.id then
      raise exception 'role changes are not permitted from the client'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- 3. The signup trigger also has to stop granting owner to the first account
--    once an owner already exists, so demoting and re-registering can't reopen
--    the door.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  first_account boolean;
begin
  select not exists (select 1 from public.profiles) into first_account;

  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    case when first_account then 'owner' else 'visitor' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
