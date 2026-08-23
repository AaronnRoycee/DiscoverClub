-- Allow users to edit location options they submitted
create policy "users update own options" on public.location_options
  for update to authenticated
  using (auth.uid() = submitted_by)
  with check (auth.uid() = submitted_by);
