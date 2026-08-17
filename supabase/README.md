# DiscoverClub Backend Setup (Supabase — free tier)

## 1. Create the project
1. Sign up at https://supabase.com/dashboard (free).
2. Click **New project**, pick any name (e.g. `discoverclub`), set a strong database password, choose a region near you.

## 2. Apply the database schema
1. In the dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of `schema.sql` and click **Run**.
   This creates all tables, row-level security policies, the auto-profile trigger, and the photo storage bucket.
3. Then paste the entire contents of `migration-invite-only.sql` and click **Run**.
   This makes the club invite-only: the first signup becomes the approved Organizer; everyone after signs up as *pending* and sees a waiting screen until an Organizer approves them on the Members page. Only approved members can read or write club data.
4. Then paste the entire contents of `migration-admin-role.sql` and click **Run**.
   This adds the Admin role: the Organizer can promote/demote members to Admin on the Members page, and Admins can also approve join requests (but cannot change roles).
5. Then paste the entire contents of `migration-groups.sql` and click **Run**.
   This adds groups: after signing up, a user either **creates a group** (becoming its Organizer and getting a shareable invite code) or **joins a group** by entering a code. Joiners are *pending* until an Organizer/Admin of that group approves them, and all club data is scoped per group.

## 3. Connect the app
1. In the dashboard, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. In the repo root, copy `.env.example` to `.env.local` and fill in both values.
4. Restart the dev server (`npm run dev`). The app now shows the login screen; sign up with your email.

Without `.env.local`, the app runs in demo mode with sample data (no login, resets on refresh).

## 4. Groups and roles
After signing up, each user creates a group (becoming its **Organizer**) or joins one with an invite code (shown to Organizers/Admins on the Members page). Joiners wait on the pending screen until an Organizer or Admin taps **Approve** on the Members page. The Organizer can promote/demote Admins there too.

## 5. Email meet alerts (optional, free)
Auth emails (confirmation, password reset) are built into Supabase.
For "new meet approved" alert emails:
1. Sign up at https://resend.com (free: 100 emails/day) and create an API key.
2. Install the Supabase CLI and deploy the function:
   ```
   supabase functions deploy send-meet-alert
   supabase secrets set RESEND_API_KEY=your-key
   ```

## Security notes
- The anon key is safe to expose in the frontend; all data access is enforced by row-level security in Postgres.
- Users can only modify their own rows (profile, RSVPs, reviews, votes, messages); notifications are visible only to their owner.
- Club data is only visible to approved members of the same group; pending or group-less accounts can see nothing but their own profile. Role/status/group changes are enforced at the database level (roles: organizer only; approvals: organizer/admin; group membership: only via the create/join functions).
- Never commit `.env.local` or share the `service_role` key.
