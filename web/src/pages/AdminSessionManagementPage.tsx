import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { adminGetScheduleRange, openDaySession, upsertDaySchedule } from '../lib/api'

type DayStatus = 'OPEN' | 'CLOSED'

type ScheduleDay = {
  date: string
  status: 'OPEN' | 'CLOSED' | 'HOLIDAY'
  startTime: string
  endTime: string
  slotDurationMins: number
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function diffMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

export function AdminSessionManagementPage() {
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const maxDate = useMemo(() => {
    const date = new Date(today)
    date.setDate(date.getDate() + 30)
    return date
  }, [today])

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(toDateKey(today))
  const [status, setStatus] = useState<DayStatus>('OPEN')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [schedules, setSchedules] = useState<Record<string, ScheduleDay>>({})

  const loadRange = async () => {
    try {
      const rows = await adminGetScheduleRange(toDateKey(today), toDateKey(maxDate))
      const mapped: Record<string, ScheduleDay> = {}
      rows.forEach((row) => {
        mapped[row.date] = row
      })
      setSchedules(mapped)
    } catch {
      setMessage('Unable to load calendar')
    }
  }

  useEffect(() => {
    void loadRange()
  }, [])

  useEffect(() => {
    const picked = schedules[selectedDate]
    if (!picked) {
      setStatus('OPEN')
      setStartTime('09:00')
      setEndTime('18:00')
      return
    }

    setStatus(picked.status === 'OPEN' ? 'OPEN' : 'CLOSED')
    setStartTime(picked.startTime)
    setEndTime(picked.endTime)
  }, [selectedDate, schedules])

  const appointmentEstimate = Math.max(0, Math.floor(diffMinutes(startTime, endTime) / 30))
  const computedSlotDuration = 30

  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const leadingBlanks = Array(firstDay.getDay()).fill(null)

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
  const canPrev = viewDate > minMonth
  const canNext = viewDate < maxMonth

  const saveDay = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      await upsertDaySchedule({
        date: selectedDate,
        status,
        startTime,
        endTime,
        slotDurationMins: computedSlotDuration,
      })

      if (status === 'OPEN') {
        await openDaySession(selectedDate)
      }

      await loadRange()
      setMessage('Saved and returned to calendar view')
    } catch (error: any) {
      setMessage(error?.response?.data?.message || 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="px-4 py-6">
      <h1 className="font-playfair text-3xl text-luxury-white text-center mb-8">Session Management</h1>

      <div className="border border-luxury-brown/40 rounded-xl p-4 bg-luxury-green/25 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button disabled={!canPrev} onClick={() => canPrev && setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="text-xs text-luxury-muted disabled:opacity-30">Prev</button>
          <p className="font-playfair text-lg text-luxury-white">{monthLabel}</p>
          <button disabled={!canNext} onClick={() => canNext && setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="text-xs text-luxury-muted disabled:opacity-30">Next</button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs mb-3 text-luxury-muted">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 max-h-[320px] overflow-y-auto pr-1">
          {leadingBlanks.map((_, index) => (
            <div key={`blank-${index}`} className="h-9" />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
            const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
            const dateKey = toDateKey(date)
            const inRange = date >= today && date <= maxDate
            const schedule = schedules[dateKey]
            const isSelected = selectedDate === dateKey

            const statusClass = !schedule
              ? 'bg-luxury-black/70 text-luxury-muted'
              : schedule.status === 'OPEN'
                ? 'bg-luxury-gold/70 text-luxury-black'
                : 'bg-luxury-brown/80 text-luxury-white'

            return (
              <button
                key={dateKey}
                disabled={!inRange}
                onClick={() => inRange && setSelectedDate(dateKey)}
                className={`h-9 rounded-md text-xs border ${isSelected ? 'border-luxury-champagne' : 'border-transparent'} ${inRange ? statusClass : 'bg-luxury-black/40 text-luxury-muted/50 cursor-not-allowed'}`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border border-luxury-brown/40 rounded-xl p-4 bg-luxury-green/20 space-y-3">
        <p className="text-xs tracking-widest uppercase text-luxury-muted">Selected day: {selectedDate}</p>

        <select value={status} onChange={(event) => setStatus(event.target.value as DayStatus)} className="w-full bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white">
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white" />
          <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white" />
        </div>

        <div className="border border-luxury-brown/30 rounded-lg p-3">
          <p className="text-xs text-luxury-muted">Approximate appointments (auto)</p>
          <p className="text-2xl font-playfair text-luxury-champagne">{appointmentEstimate}</p>
          <p className="text-xs text-luxury-muted">Calculated as total range minutes ÷ 30</p>
        </div>

        <button onClick={() => void saveDay()} disabled={isSaving} className="w-full py-3 bg-luxury-gold text-luxury-black rounded-lg text-xs tracking-widest uppercase font-semibold disabled:opacity-60">
          {isSaving ? 'Saving...' : 'Save Day'}
        </button>

        {message ? <p className="text-xs text-luxury-champagne">{message}</p> : null}
      </div>
    </motion.div>
  )
}
