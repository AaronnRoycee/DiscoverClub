-- Invite-only club membership. Run after schema.sql (idempotent).
-- New signups are 'pending' until an Organizer approves them; only approved
-- members can read or write club data. The first user to sign up becomes the
-- approved Organizer.

alter table public.profiles
  add column if not exists status text not null default 'pending'
  check (status in ('pending', 'approved'));

-- Helpers (security definer so they bypass RLS on profiles without recursion)

create or replace function public.is_approved_member()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'approved');
$$;

create or replace function public.is_organizer()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved' and role = 'Organizer'
  );
$$;

revoke execute on function public.is_approved_member(), public.is_organizer() from public, anon;
grant execute on function public.is_approved_member(), public.is_organizer() to authenticated;

-- First signup becomes the approved Organizer; everyone after is pending

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  existing_count int;
begin
  select count(*) into existing_count from public.profiles;
  insert into public.profiles (id, name, username, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    split_part(new.email, '@', 1),
    new.email,
    case when existing_count = 0 then 'Organizer' else 'Member' end,
    case when existing_count = 0 then 'approved' else 'pending' end
  );
  if existing_count > 0 then
    insert into public.notifications (user_id, text, link)
    select id,
      coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)) || ' wants to join the club — approve them on the Members page',
      '/members'
    from public.profiles
    where role = 'Organizer' and status = 'approved';
  end if;
  return new;
end;
$$;

-- Only Organizers may change role/status (blocks self-promotion/self-approval)

create or replace function public.prevent_privilege_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and not public.is_organizer() then
    raise exception 'Only an organizer can change member role or status';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_privilege_change on public.profiles;
create trigger on_profile_privilege_change
  before update on public.profiles
  for each row execute function public.prevent_privilege_change();

-- Tighten profiles policies: pending users see only themselves; organizers can
-- update other members (to approve them)

drop policy if exists "members can view profiles" on public.profiles;
create policy "members can view profiles" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_approved_member());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_organizer())
  with check (id = auth.uid() or public.is_organizer());

-- Gate all club data behind approved membership

drop policy if exists "members can view meets" on public.meets;
create policy "members can view meets" on public.meets for select to authenticated using (public.is_approved_member());
drop policy if exists "members can create meets" on public.meets;
create policy "members can create meets" on public.meets for insert to authenticated with check (auth.uid() = created_by and public.is_approved_member());

drop policy if exists "members can view rsvps" on public.rsvps;
create policy "members can view rsvps" on public.rsvps for select to authenticated using (public.is_approved_member());
drop policy if exists "users manage own rsvp" on public.rsvps;
create policy "users manage own rsvp" on public.rsvps for insert to authenticated with check (auth.uid() = user_id and public.is_approved_member());
drop policy if exists "users update own rsvp" on public.rsvps;
create policy "users update own rsvp" on public.rsvps for update to authenticated using (auth.uid() = user_id and public.is_approved_member()) with check (auth.uid() = user_id and public.is_approved_member());

drop policy if exists "members can view reviews" on public.reviews;
create policy "members can view reviews" on public.reviews for select to authenticated using (public.is_approved_member());
drop policy if exists "users write own review" on public.reviews;
create policy "users write own review" on public.reviews for insert to authenticated with check (auth.uid() = user_id and public.is_approved_member());

drop policy if exists "members can view chat" on public.chat_messages;
create policy "members can view chat" on public.chat_messages for select to authenticated using (public.is_approved_member());
drop policy if exists "users send own messages" on public.chat_messages;
create policy "users send own messages" on public.chat_messages for insert to authenticated with check (auth.uid() = user_id and public.is_approved_member());

drop policy if exists "members can view meet photos" on public.meet_photos;
create policy "members can view meet photos" on public.meet_photos for select to authenticated using (public.is_approved_member());
drop policy if exists "users add own photos" on public.meet_photos;
create policy "users add own photos" on public.meet_photos for insert to authenticated with check (auth.uid() = user_id and public.is_approved_member());

drop policy if exists "members can view options" on public.location_options;
create policy "members can view options" on public.location_options for select to authenticated using (public.is_approved_member());
drop policy if exists "users submit own options" on public.location_options;
create policy "users submit own options" on public.location_options for insert to authenticated with check (auth.uid() = submitted_by and public.is_approved_member());

drop policy if exists "members can view votes" on public.location_votes;
create policy "members can view votes" on public.location_votes for select to authenticated using (public.is_approved_member());
drop policy if exists "users cast own vote" on public.location_votes;
create policy "users cast own vote" on public.location_votes for insert to authenticated with check (auth.uid() = user_id and public.is_approved_member());

drop policy if exists "members can view proposals" on public.proposals;
create policy "members can view proposals" on public.proposals for select to authenticated using (public.is_approved_member());
drop policy if exists "users create own proposals" on public.proposals;
create policy "users create own proposals" on public.proposals for insert to authenticated with check (auth.uid() = proposed_by and public.is_approved_member());
drop policy if exists "members can approve proposals" on public.proposals;
create policy "members can approve proposals" on public.proposals for update to authenticated using (public.is_approved_member());

drop policy if exists "members can view supporters" on public.proposal_supporters;
create policy "members can view supporters" on public.proposal_supporters for select to authenticated using (public.is_approved_member());
drop policy if exists "users add own support" on public.proposal_supporters;
create policy "users add own support" on public.proposal_supporters for insert to authenticated with check (auth.uid() = user_id and public.is_approved_member());

drop policy if exists "members can create notifications" on public.notifications;
create policy "members can create notifications" on public.notifications for insert to authenticated with check (public.is_approved_member());

drop policy if exists "authenticated upload photos" on storage.objects;
create policy "authenticated upload photos" on storage.objects for insert to authenticated with check (bucket_id = 'photos' and public.is_approved_member());

-- Approval + threshold now count only approved members

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
  if not found or prop.approved_meet_id is not null then
    return false;
  end if;
  select count(*) into supporter_count from public.proposal_supporters where proposal_id = p_proposal_id;
  select count(*) into member_count from public.profiles where status = 'approved';
  threshold := greatest(2, member_count / 2 + 1);
  if supporter_count < threshold then
    return false;
  end if;
  insert into public.meets (id, name, location, address, city, state, zip, date, time, photo_url, created_by)
  values (p_meet_id, prop.name, prop.location_name, prop.address, prop.city, prop.state, prop.zip, prop.date, prop.time, p_photo_url, auth.uid());
  insert into public.rsvps (meet_id, user_id, status)
  select p_meet_id, user_id, 'yes' from public.proposal_supporters where proposal_id = p_proposal_id
  on conflict (meet_id, user_id) do update set status = 'yes';
  update public.proposals set approved_meet_id = p_meet_id where id = p_proposal_id;
  return true;
end;
$$;
