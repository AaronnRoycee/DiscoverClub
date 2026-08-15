# DiscoverClub Backend Setup (Supabase — free tier)

## 1. Create the project
1. Sign up at https://supabase.com/dashboard (free).
2. Click **New project**, pick any name (e.g. `discoverclub`), set a strong database password, choose a region near you.

## 2. Apply the database schema
1. In the dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of `schema.sql` and click **Run**.
   This creates all tables, row-level security policies, the auto-profile trigger, and the photo storage bucket.

## 3. Connect the app
1. In the dashboard, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. In the repo root, copy `.env.example` to `.env.local` and fill in both values.
4. Restart the dev server (`npm run dev`). The app now shows the login screen; sign up with your email.

Without `.env.local`, the app runs in demo mode with sample data (no login, resets on refresh).

## 4. First user = organizer (optional)
After you sign up, in **SQL Editor** run:

```sql
update public.profiles set role = 'Organizer' where email = 'YOUR-EMAIL';
```

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
- Never commit `.env.local` or share the `service_role` key.
