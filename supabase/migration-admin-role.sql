-- Admin role. Run after migration-invite-only.sql (idempotent).
-- Organizers can promote/demote members to Admin; Admins can approve pending
-- members (but cannot change roles).

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('Organizer', 'Admin', 'Member'));

create or replace function public.can_manage_members()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved' and role in ('Organizer', 'Admin')
  );
$$;

revoke execute on function public.can_manage_members() from public, anon;
grant execute on function public.can_manage_members() to authenticated;

-- Role changes: organizer only. Status changes: organizer or admin.
-- Updating someone else's profile may only touch role/status.

create or replace function public.prevent_privilege_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
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

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to authenticated
  using (id = auth.uid() or public.can_manage_members())
  with check (id = auth.uid() or public.can_manage_members());

-- Notify admins as well as organizers about join requests

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
    where role in ('Organizer', 'Admin') and status = 'approved';
  end if;
  return new;
end;
$$;
