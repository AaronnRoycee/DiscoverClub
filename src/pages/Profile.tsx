import { useState } from 'react'
import { useStore } from '../store'

export default function Profile() {
  const { profile, setProfile } = useStore()
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [key]: e.target.value })
    setSaved(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-1 text-gray-400">Edit your basic and advanced settings</p>
      </div>

      <section className="rounded-2xl border border-club-border bg-club-card p-4">
        <div className="flex items-center gap-4">
          <img src={form.avatar} alt={form.name} className="h-20 w-20 rounded-full border border-club-border bg-club-card2 object-cover" />
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-400 uppercase">Profile Picture URL</label>
            <input value={form.avatar} onChange={set('avatar')} className={inputCls} />
          </div>
        </div>
      </section>

      <form
        className="space-y-4 rounded-2xl border border-club-border bg-club-card p-4"
        onSubmit={(e) => {
          e.preventDefault()
          setProfile(form)
          setSaved(true)
        }}
      >
        <Field label="Display Name">
          <input value={form.name} onChange={set('name')} className={inputCls} />
        </Field>
        <Field label="Username">
          <input value={form.username} onChange={set('username')} className={inputCls} />
        </Field>
        <Field label="Bio">
          <textarea value={form.bio} onChange={set('bio')} rows={3} className={inputCls} />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={set('email')} className={inputCls} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={set('phone')} className={inputCls} />
        </Field>
        <Field label="City">
          <input value={form.city} onChange={set('city')} className={inputCls} />
        </Field>
        <button type="submit" className="w-full cursor-pointer rounded-xl bg-club-green py-2.5 font-semibold text-club-bg hover:brightness-110">
          Save Changes
        </button>
        {saved && <p className="text-center text-sm text-club-green">✔ Profile saved</p>}
      </form>
    </div>
  )
}

const inputCls =
  'mt-1 w-full rounded-xl border border-club-border bg-club-bg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-club-green focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase">{label}</label>
      {children}
    </div>
  )
}
