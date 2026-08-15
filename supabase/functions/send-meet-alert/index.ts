// Supabase Edge Function: emails all club members when a new meet is approved.
// Deploy: supabase functions deploy send-meet-alert
// Requires secrets: RESEND_API_KEY (free tier at resend.com), SUPABASE_SERVICE_ROLE_KEY (auto-provided).

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const { meetName, meetDate, meetTime, meetLocation, meetLink } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: profiles, error } = await supabase.from('profiles').select('email, name')
    if (error) throw error

    const recipients = (profiles ?? []).map((p) => p.email).filter(Boolean)
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DiscoverClub <onboarding@resend.dev>',
        to: recipients,
        subject: `🍽️ New meet: ${meetName} on ${meetDate}`,
        html: `
          <h2>${meetName} is official!</h2>
          <p><strong>📅 ${meetDate} · 🕖 ${meetTime}</strong></p>
          <p>📍 ${meetLocation}</p>
          <p><a href="${meetLink}">Open DiscoverClub to RSVP</a></p>
        `,
      }),
    })

    const body = await res.json()
    return new Response(JSON.stringify({ sent: recipients.length, resend: body }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
