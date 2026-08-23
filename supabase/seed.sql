-- First account to sign up becomes the owner; everyone after is a visitor.
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

-- Three starter galleries so the index has shape. Rename or delete them
-- from /darkroom once real work is filed.
insert into public.albums (slug, title, subtitle, place, year, visibility, position)
values
  ('court-side',  'Court side',  'Sport, at the half-second before the point ends.', null, 2026, 'public',  0),
  ('on-the-pass', 'On the pass', 'Food as it leaves the kitchen — steam still moving.', null, 2026, 'public',  1),
  ('held-back',   'Held back',   'Client work before it runs, and frames still under argument.', null, 2026, 'members', 2)
on conflict (slug) do nothing;
