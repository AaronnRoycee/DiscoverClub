-- Proposal edit/delete permissions. Run after migration-admin-role.sql (idempotent).
-- Submitter can edit their own open proposal. Submitter or Organizer/Admin can delete an open proposal.

drop policy if exists "members can approve proposals" on public.proposals;

create policy "users update own proposals" on public.proposals for update to authenticated
  using (auth.uid() = proposed_by and approved_meet_id is null)
  with check (auth.uid() = proposed_by and approved_meet_id is null);

create policy "users and admins delete proposals" on public.proposals for delete to authenticated
  using (
    approved_meet_id is null
    and (
      auth.uid() = proposed_by
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and status = 'approved' and role in ('Organizer', 'Admin')
      )
    )
  );
