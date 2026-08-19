-- Groups (clubs). Run after migration-admin-role.sql (idempotent).
-- Every user creates a group (becoming its Organizer, receiving a shareable
-- invite code) or joins an existing one by entering its code. Joining puts the
-- user in 'pending' until an Organizer/Admin of that group approves them.
-- All club data is scoped to a group.

-- ============ TABLE ============

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.clubs enable row level security;

alter table public.profiles add column if not exists club_id uuid references public.clubs (id) on delete set null;
alter table public.meets add column if not exists club_id uuid references public.clubs (id) on delete cascade;
alter table public.location_options add column if not exists club_id uuid references public.clubs (id) on delete cascade;
alter table public.proposals add column if not exists club_id uuid references public.clubs (id) on delete cascade;

-- ============ HELPERS ============

create or replace function public.my_club_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select club_id from public.profiles where id = auth.uid();
$$;

-- Approved membership now requires belonging to a group
create or replace function public.is_approved_member()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved' and club_id is not null
  );
$$;

create or replace function public.meet_in_my_club(m uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.meets where id = m and club_id = public.my_club_id());
$$;

create or replace function public.option_in_my_club(o uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.location_options where id = o and club_id = public.my_club_id());
$$;

create or replace function public.proposal_in_my_club(p uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.proposals where id = p and club_id = public.my_club_id());
$$;

create or replace function public.in_my_club(target uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = target and club_id is not null and club_id = public.my_club_id()
  );
$$;

revoke execute on function
  public.my_club_id(), public.meet_in_my_club(uuid), public.option_in_my_club(uuid),
  public.proposal_in_my_club(uuid), public.in_my_club(uuid)
from public, anon;
grant execute on function
  public.my_club_id(), public.meet_in_my_club(uuid), public.option_in_my_club(uuid),
  public.proposal_in_my_club(uuid), public.in_my_club(uuid)
to authenticated;

-- Club-scoped inserts pick up the caller's group automatically
alter table public.meets alter column club_id set default public.my_club_id();
alter table public.location_options alter column club_id set default public.my_club_id();
alter table public.proposals alter column club_id set default public.my_club_id();

-- ============ CREATE / JOIN GROUP ============

create or replace function public.create_club(p_name text, p_code text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_code text;
  v_club uuid;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Group name is required';
  end if;
  v_code := upper(trim(p_code));
  if length(v_code) < 3 then
    raise exception 'Group code must be at least 3 characters';
  end if;
  if exists (select 1 from public.clubs where code = v_code) then
    raise exception 'Group code is already taken';
  end if;
  if (select club_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'You are already in a group';
  end if;
  insert into public.clubs (name, code, created_by)
  values (trim(p_name), v_code, auth.uid())
  returning id into v_club;
  perform set_config('app.allow_membership_change', '1', true);
  update public.profiles
  set club_id = v_club, role = 'Organizer', status = 'approved'
  where id = auth.uid();
  return v_code;
end;
$$;

create or replace function public.join_club(p_code text)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_club uuid;
  v_name text;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if (select club_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'You are already in a group';
  end if;
  select id into v_club from public.clubs where code = upper(trim(p_code));
  if not found then
    return false;
  end if;
  perform set_config('app.allow_membership_change', '1', true);
  update public.profiles
  set club_id = v_club, role = 'Member', status = 'pending'
  where id = auth.uid();
  select name into v_name from public.profiles where id = auth.uid();
  insert into public.notifications (user_id, text, link)
  select id,
    coalesce(nullif(v_name, ''), 'Someone') || ' wants to join the group — approve them on the Members page',
    '/members'
  from public.profiles
  where club_id = v_club and role in ('Organizer', 'Admin') and status = 'approved';
  return true;
end;
$$;

revoke execute on function public.create_club(text, text), public.join_club(text) from public, anon;
grant execute on function public.create_club(text, text), public.join_club(text) to authenticated;

-- ============ SIGNUP: no auto-organizer; users create/join a group instead ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, username, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), ''),
    coalesce(split_part(new.email, '@', 1), ''),
    coalesce(new.email, ''),
    'Member',
    'pending'
  );
  return new;
end;
$$;

-- ============ PRIVILEGE GUARD ============
-- Group membership changes only through create_club/join_club; role changes
-- organizer-only; status changes organizer/admin-only; profile details self-only.

create or replace function public.prevent_privilege_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if current_setting('app.allow_membership_change', true) = '1' then
    return new;
  end if;
  if new.club_id is distinct from old.club_id then
    raise exception 'Group membership can only be changed by creating or joining a group';
  end if;
  if new.role is distinct from old.role and not public.is_organizer() then
    raise exception 'Only the organizer can change member roles';
  end if;
  if new.status is distinct from old.status and not public.can_manage_members() then
    raise exception 'Only an organizer or admin can change member status';
  end if;
  if old.id is distinct from auth.uid()
     and (new.name, new.username, new.avatar_url, new.bio, new.email, new.phone, new.city)
         is distinct from
         (old.name, old.username, old.avatar_url, old.bio, old.email, old.phone, old.city) then
    raise exception 'You can only edit your own profile details';
  end if;
  return new;
end;
$$;

-- ============ POLICIES: scope everything to the caller's group ============

drop policy if exists "members view own club" on public.clubs;
create policy "members view own club" on public.clubs for select to authenticated
  using (id = public.my_club_id());

drop policy if exists "members can view profiles" on public.profiles;
create policy "members can view profiles" on public.profiles for select to authenticated
  using (id = auth.uid() or (public.is_approved_member() and club_id = public.my_club_id()));

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to authenticated
  using (id = auth.uid() or (public.can_manage_members() and club_id = public.my_club_id()))
  with check (id = auth.uid() or (public.can_manage_members() and club_id = public.my_club_id()));

drop policy if exists "members can view meets" on public.meets;
create policy "members can view meets" on public.meets for select to authenticated
  using (public.is_approved_member() and club_id = public.my_club_id());
drop policy if exists "members can create meets" on public.meets;
create policy "members can create meets" on public.meets for insert to authenticated
  with check (auth.uid() = created_by and public.is_approved_member() and club_id = public.my_club_id());

drop policy if exists "members can view rsvps" on public.rsvps;
create policy "members can view rsvps" on public.rsvps for select to authenticated
  using (public.is_approved_member() and public.meet_in_my_club(meet_id));
drop policy if exists "users manage own rsvp" on public.rsvps;
create policy "users manage own rsvp" on public.rsvps for insert to authenticated
  with check (auth.uid() = user_id and public.is_approved_member() and public.meet_in_my_club(meet_id));
drop policy if exists "users update own rsvp" on public.rsvps;
create policy "users update own rsvp" on public.rsvps for update to authenticated
  using (auth.uid() = user_id and public.is_approved_member() and public.meet_in_my_club(meet_id))
  with check (auth.uid() = user_id and public.is_approved_member() and public.meet_in_my_club(meet_id));

drop policy if exists "members can view reviews" on public.reviews;
create policy "members can view reviews" on public.reviews for select to authenticated
  using (public.is_approved_member() and public.meet_in_my_club(meet_id));
drop policy if exists "users write own review" on public.reviews;
create policy "users write own review" on public.reviews for insert to authenticated
  with check (auth.uid() = user_id and public.is_approved_member() and public.meet_in_my_club(meet_id));

drop policy if exists "members can view chat" on public.chat_messages;
create policy "members can view chat" on public.chat_messages for select to authenticated
  using (public.is_approved_member() and public.meet_in_my_club(meet_id));
drop policy if exists "users send own messages" on public.chat_messages;
create policy "users send own messages" on public.chat_messages for insert to authenticated
  with check (auth.uid() = user_id and public.is_approved_member() and public.meet_in_my_club(meet_id));

drop policy if exists "members can view meet photos" on public.meet_photos;
create policy "members can view meet photos" on public.meet_photos for select to authenticated
  using (public.is_approved_member() and public.meet_in_my_club(meet_id));
drop policy if exists "users add own photos" on public.meet_photos;
create policy "users add own photos" on public.meet_photos for insert to authenticated
  with check (auth.uid() = user_id and public.is_approved_member() and public.meet_in_my_club(meet_id));

drop policy if exists "members can view options" on public.location_options;
create policy "members can view options" on public.location_options for select to authenticated
  using (public.is_approved_member() and club_id = public.my_club_id());
drop policy if exists "users submit own options" on public.location_options;
create policy "users submit own options" on public.location_options for insert to authenticated
  with check (auth.uid() = submitted_by and public.is_approved_member() and club_id = public.my_club_id());

drop policy if exists "members can view votes" on public.location_votes;
create policy "members can view votes" on public.location_votes for select to authenticated
  using (public.is_approved_member() and public.option_in_my_club(option_id));
drop policy if exists "users cast own vote" on public.location_votes;
create policy "users cast own vote" on public.location_votes for insert to authenticated
  with check (auth.uid() = user_id and public.is_approved_member() and public.option_in_my_club(option_id));

drop policy if exists "members can view proposals" on public.proposals;
create policy "members can view proposals" on public.proposals for select to authenticated
  using (public.is_approved_member() and club_id = public.my_club_id());
drop policy if exists "users create own proposals" on public.proposals;
create policy "users create own proposals" on public.proposals for insert to authenticated
  with check (auth.uid() = proposed_by and public.is_approved_member() and club_id = public.my_club_id());
drop policy if exists "members can approve proposals" on public.proposals;
create policy "members can approve proposals" on public.proposals for update to authenticated
  using (public.is_approved_member() and club_id = public.my_club_id());

drop policy if exists "members can view supporters" on public.proposal_supporters;
create policy "members can view supporters" on public.proposal_supporters for select to authenticated
  using (public.is_approved_member() and public.proposal_in_my_club(proposal_id));
drop policy if exists "users add own support" on public.proposal_supporters;
create policy "users add own support" on public.proposal_supporters for insert to authenticated
  with check (auth.uid() = user_id and public.is_approved_member() and public.proposal_in_my_club(proposal_id));

drop policy if exists "members can create notifications" on public.notifications;
create policy "members can create notifications" on public.notifications for insert to authenticated
  with check (public.is_approved_member() and public.in_my_club(user_id));

-- ============ PROPOSAL APPROVAL: scope to the caller's group ============

create or replace function public.approve_proposal(p_proposal_id uuid, p_meet_id uuid, p_photo_url text)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  prop public.proposals%rowtype;
  supporter_count int;
  member_count int;
  threshold int;
begin
  if not public.is_approved_member() then
    return false;
  end if;
  select * into prop from public.proposals where id = p_proposal_id for update;
  if not found or prop.approved_meet_id is not null or prop.club_id is distinct from public.my_club_id() then
    return false;
  end if;
  select count(*) into supporter_count from public.proposal_supporters where proposal_id = p_proposal_id;
  select count(*) into member_count from public.profiles where status = 'approved' and club_id = public.my_club_id();
  threshold := greatest(2, member_count / 2 + 1);
  if supporter_count < threshold then
    return false;
  end if;
  insert into public.meets (id, name, location, address, city, state, zip, date, time, photo_url, created_by, club_id)
  values (p_meet_id, prop.name, prop.location_name, prop.address, prop.city, prop.state, prop.zip, prop.date, prop.time, p_photo_url, auth.uid(), prop.club_id);
  insert into public.rsvps (meet_id, user_id, status)
  select p_meet_id, user_id, 'yes' from public.proposal_supporters where proposal_id = p_proposal_id
  on conflict (meet_id, user_id) do update set status = 'yes';
  update public.proposals set approved_meet_id = p_meet_id where id = p_proposal_id;
  return true;
end;
$$;

-- ============ RESET EXISTING GROUPLESS PROFILES ============
-- Anyone without a group goes back to pending Member; they'll create or join
-- a group on next sign-in.

select set_config('app.allow_membership_change', '1', false);
update public.profiles set role = 'Member', status = 'pending' where club_id is null and role <> 'Member';
select set_config('app.allow_membership_change', '', false);
