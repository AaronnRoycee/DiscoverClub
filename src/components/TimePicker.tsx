import { useState } from 'react'

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

function parse(value: string): { hour: number; minute: number; ampm: 'AM' | 'PM' } {
  const m = value.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/)
  if (!m) return { hour: 7, minute: 0, ampm: 'PM' }
  return { hour: Number(m[1]), minute: Number(m[2]), ampm: m[3] as 'AM' | 'PM' }
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const { hour, minute, ampm } = parse(value)
  const [mode, setMode] = useState<'hour' | 'minute'>('hour')

  const emit = (h: number, min: number, ap: 'AM' | 'PM') =>
    onChange(`${h}:${String(min).padStart(2, '0')} ${ap}`)

  const numbers = mode === 'hour' ? HOURS : MINUTES
  const selected = mode === 'hour' ? hour : minute
  const selectedIndex = numbers.indexOf(mode === 'hour' ? (hour === 12 ? 12 : hour) : minute)
  const angle = (selectedIndex / 12) * 360 - 90

  return (
    <div className="rounded-2xl border border-club-border bg-club-bg p-4">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setMode('hour')}
          className={`cursor-pointer rounded-lg px-3 py-1 text-2xl font-bold ${mode === 'hour' ? 'bg-club-green-dark text-club-green' : 'text-gray-300'}`}
        >
          {hour}
        </button>
        <span className="text-2xl font-bold text-gray-400">:</span>
        <button
          type="button"
          onClick={() => setMode('minute')}
          className={`cursor-pointer rounded-lg px-3 py-1 text-2xl font-bold ${mode === 'minute' ? 'bg-club-green-dark text-club-green' : 'text-gray-300'}`}
        >
          {String(minute).padStart(2, '0')}
        </button>
        <div className="ml-2 flex flex-col gap-1">
          {(['AM', 'PM'] as const).map((ap) => (
            <button
              key={ap}
              type="button"
              onClick={() => emit(hour, minute, ap)}
              className={`cursor-pointer rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                ampm === ap ? 'bg-club-green text-club-bg' : 'border border-club-border text-gray-400 hover:bg-club-card2'
              }`}
            >
              {ap}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-4 h-56 w-56 rounded-full border border-club-border bg-club-card">
        {selectedIndex >= 0 && (
          <div
            className="absolute top-1/2 left-1/2 h-0.5 w-[88px] origin-left bg-club-green"
            style={{ transform: `rotate(${angle}deg)` }}
          />
        )}
        <div className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-club-green" />
        {numbers.map((n, i) => {
          const rad = ((i / 12) * 360 - 90) * (Math.PI / 180)
          const x = 50 + 39 * Math.cos(rad)
          const y = 50 + 39 * Math.sin(rad)
          const isSel = n === selected
          return (
            <button
              key={n}
              type="button"
              onClick={() => {
                if (mode === 'hour') {
                  emit(n, minute, ampm)
                  setMode('minute')
                } else {
                  emit(hour, n, ampm)
                }
              }}
              className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-sm font-semibold ${
                isSel ? 'bg-club-green text-club-bg' : 'text-gray-200 hover:bg-club-card2'
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {mode === 'minute' ? String(n).padStart(2, '0') : n}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-center text-sm text-gray-400">
        Selected: <span className="font-semibold text-club-green">{hour}:{String(minute).padStart(2, '0')} {ampm}</span>
        {mode === 'hour' ? ' — tap an hour' : ' — tap the minutes'}
      </p>
    </div>
  )
}
