-- DiscoverClub schema. Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query -> paste -> Run).

-- ============ TABLES ============

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  username text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  email text not null default '',
  phone text not null default '',
  city text not null default '',
  role text not null default 'Member' check (role in ('Organizer', 'Member')),
  joined_at timestamptz not null default now()
);

create table if not exists public.meets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  address text not null default '',
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  date date not null,
  time text not null,
  photo_url text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  meet_id uuid not null references public.meets (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('yes', 'no', 'pending')),
  primary key (meet_id, user_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  meet_id uuid not null references public.meets (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating numeric(2, 1) not null check (rating >= 0.5 and rating <= 5 and (rating * 2) = floor(rating * 2)),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (meet_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  meet_id uuid not null references public.meets (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.meet_photos (
  id uuid primary key default gen_random_uuid(),
  meet_id uuid not null references public.meets (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.location_options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  submitted_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.location_votes (
  option_id uuid not null references public.location_options (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (option_id, user_id)
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  time text not null,
  location_name text not null,
  address text not null default '',
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  proposed_by uuid not null references public.profiles (id) on delete cascade,
  approved_meet_id uuid references public.meets (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.proposal_supporters (
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (proposal_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  link text not null default '/',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    split_part(new.email, '@', 1),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ROW LEVEL SECURITY ============
-- Club data is shared among signed-in members; each user can only write their own rows.

alter table public.profiles enable row level security;
alter table public.meets enable row level security;
alter table public.rsvps enable row level security;
alter table public.reviews enable row level security;
alter table public.chat_messages enable row level security;
alter table public.meet_photos enable row level security;
alter table public.location_options enable row level security;
alter table public.location_votes enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_supporters enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy "members can view profiles" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- meets (any member can create; creator can edit)
create policy "members can view meets" on public.meets for select to authenticated using (true);
create policy "members can create meets" on public.meets for insert to authenticated with check (auth.uid() = created_by);
create policy "creator can update meet" on public.meets for update to authenticated using (auth.uid() = created_by);

-- rsvps
create policy "members can view rsvps" on public.rsvps for select to authenticated using (true);
create policy "users manage own rsvp" on public.rsvps for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own rsvp" on public.rsvps for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- reviews
create policy "members can view reviews" on public.reviews for select to authenticated using (true);
create policy "users write own review" on public.reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own review" on public.reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own review" on public.reviews for delete to authenticated using (auth.uid() = user_id);

-- chat
create policy "members can view chat" on public.chat_messages for select to authenticated using (true);
create policy "users send own messages" on public.chat_messages for insert to authenticated with check (auth.uid() = user_id);

-- meet photos
create policy "members can view meet photos" on public.meet_photos for select to authenticated using (true);
create policy "users add own photos" on public.meet_photos for insert to authenticated with check (auth.uid() = user_id);
create policy "users delete own photos" on public.meet_photos for delete to authenticated using (auth.uid() = user_id);

-- location options
create policy "members can view options" on public.location_options for select to authenticated using (true);
create policy "users submit own options" on public.location_options for insert to authenticated with check (auth.uid() = submitted_by);

-- location votes
create policy "members can view votes" on public.location_votes for select to authenticated using (true);
create policy "users cast own vote" on public.location_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "users remove own vote" on public.location_votes for delete to authenticated using (auth.uid() = user_id);

-- proposals
create policy "members can view proposals" on public.proposals for select to authenticated using (true);
create policy "users create own proposals" on public.proposals for insert to authenticated with check (auth.uid() = proposed_by);
create policy "members can approve proposals" on public.proposals for update to authenticated using (true);

-- proposal supporters
create policy "members can view supporters" on public.proposal_supporters for select to authenticated using (true);
create policy "users add own support" on public.proposal_supporters for insert to authenticated with check (auth.uid() = user_id);
create policy "users withdraw own support" on public.proposal_supporters for delete to authenticated using (auth.uid() = user_id);

-- notifications (each user only sees their own)
create policy "users view own notifications" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "members can create notifications" on public.notifications for insert to authenticated with check (true);
create policy "users mark own notifications read" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ STORAGE (photos) ============

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "public read photos" on storage.objects for select using (bucket_id = 'photos');
create policy "authenticated upload photos" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
