-- UNTAMED · visual archive schema
-- Run against POSTGRES_URL_NON_POOLING.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Visitor',
  role         text not null default 'visitor' check (role in ('visitor','owner')),
  created_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

-- ---------------------------------------------------------------- albums
create table if not exists public.albums (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  subtitle    text,
  place       text,
  year        int,
  visibility  text not null default 'public' check (visibility in ('public','members')),
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- photos
create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  album_id    uuid not null references public.albums(id) on delete cascade,
  bucket      text not null default 'gallery' check (bucket in ('gallery','gallery-private')),
  path        text not null,
  caption     text,
  place       text,
  taken_on    date,
  width       int,
  height      int,
  position    int not null default 0,
  is_cover    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists photos_album_idx on public.photos (album_id, position);

-- ---------------------------------------------------------------- notes
-- One table serves the global guestbook (album_id null) and per-album comments.
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  album_id   uuid references public.albums(id) on delete cascade,
  body       text not null check (char_length(trim(body)) between 1 and 500),
  hidden     boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notes_album_idx on public.notes (album_id, created_at desc);

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.albums   enable row level security;
alter table public.photos   enable row level security;
alter table public.notes    enable row level security;

drop policy if exists profiles_read      on public.profiles;
drop policy if exists profiles_self_edit on public.profiles;
create policy profiles_read      on public.profiles for select using (true);
create policy profiles_self_edit on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists albums_read  on public.albums;
drop policy if exists albums_write on public.albums;
create policy albums_read on public.albums for select
  using (visibility = 'public' or auth.role() = 'authenticated');
create policy albums_write on public.albums for all
  using (public.is_owner()) with check (public.is_owner());

drop policy if exists photos_read  on public.photos;
drop policy if exists photos_write on public.photos;
create policy photos_read on public.photos for select
  using (exists (
    select 1 from public.albums a
    where a.id = photos.album_id
      and (a.visibility = 'public' or auth.role() = 'authenticated')
  ));
create policy photos_write on public.photos for all
  using (public.is_owner()) with check (public.is_owner());

drop policy if exists notes_read   on public.notes;
drop policy if exists notes_insert on public.notes;
drop policy if exists notes_delete on public.notes;
drop policy if exists notes_owner  on public.notes;
create policy notes_read on public.notes for select
  using (
    hidden = false
    and (
      album_id is null
      or exists (
        select 1 from public.albums a
        where a.id = notes.album_id
          and (a.visibility = 'public' or auth.role() = 'authenticated')
      )
    )
  );
create policy notes_insert on public.notes for insert to authenticated
  with check (auth.uid() = user_id);
create policy notes_delete on public.notes for delete
  using (auth.uid() = user_id or public.is_owner());
create policy notes_owner on public.notes for update
  using (public.is_owner()) with check (public.is_owner());

-- Public read view that joins the author name without exposing auth.users.
create or replace view public.notes_with_author
with (security_invoker = true) as
  select n.id, n.album_id, n.body, n.created_at, n.user_id, p.display_name
  from public.notes n
  join public.profiles p on p.id = n.user_id
  where n.hidden = false;
