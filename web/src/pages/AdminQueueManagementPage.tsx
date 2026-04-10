import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  adminCloseSession,
  adminCompleteAppointment,
  adminDeleteAppointment,
  adminReorderQueue,
  getLiveQueue,
  LiveQueueItem,
} from '../lib/api'
import { pageMotionProps } from '../lib/motion'

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function AdminQueueManagementPage() {
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const [queueDate, setQueueDate] = useState(toDateKey(today))
  const [rows, setRows] = useState<LiveQueueItem[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadQueue = async (date = queueDate) => {
    setIsLoading(true)
    setMessage('')
    try {
      const data = await getLiveQueue(date)
      setRows(data.queue || [])
    } catch {
      setRows([])
      setMessage('Unable to load queue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadQueue(queueDate)
  }, [queueDate])

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= rows.length) return

    const reordered = [...rows]
    const [picked] = reordered.splice(index, 1)
    reordered.splice(target, 0, picked)
    setRows(reordered.map((row, idx) => ({ ...row, position: idx + 1 })))

    try {
      await adminReorderQueue(queueDate, reordered.map((row) => row.id))
      setMessage('Queue updated')
    } catch {
      await loadQueue(queueDate)
      setMessage('Failed to reorder queue')
    }
  }

  const removeEntry = async (id: string) => {
    const ok = window.confirm('WARNING: This removes the queue entry immediately. Continue?')
    if (!ok) return

    const previous = rows
    setRows((current) => current.filter((row) => row.id !== id))

    try {
      await adminDeleteAppointment(id)
      setMessage('Queue entry deleted')
    } catch {
      setRows(previous)
      setMessage('Failed to delete queue entry')
    }
  }

  const completeEntry = async (id: string) => {
    const ok = window.confirm('Confirm completion for this appointment?')
    if (!ok) return

    try {
      await adminCompleteAppointment(id)
      await loadQueue(queueDate)
      setMessage('Appointment marked as completed')
    } catch {
      setMessage('Failed to complete appointment')
    }
  }

  const concludeSession = async () => {
    const ok = window.confirm('WARNING: Conclude session for this day?')
    if (!ok) return

    try {
      await adminCloseSession(queueDate)
      const next = new Date(queueDate)
      next.setDate(next.getDate() + 1)
      const nextKey = toDateKey(next)
      setQueueDate(nextKey)
      setMessage('Session concluded. Showing next day queue.')
    } catch {
      setMessage('Failed to conclude session')
    }
  }

  return (
    <motion.div {...pageMotionProps} className="px-6 pt-8 pb-24">
      <div className="mb-8">
        <p className="ds-overline text-primary mb-1">Admin</p>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Queue Management</h1>
      </div>

      <div className="mb-6">
        <label className="text-xs text-black block mb-2 tracking-widest uppercase">Queue date</label>
        <input
          type="date"
          value={queueDate}
          onChange={(event) => setQueueDate(event.target.value)}
          className="v2-input"
        />
      </div>

      {message ? <p className="text-xs text-black mb-4">{message}</p> : null}
      {isLoading ? <p className="text-sm text-black mb-4">Loading queue...</p> : null}
      {!isLoading && rows.length === 0 ? <p className="text-sm text-black mb-6">No appointments for this day</p> : null}

      <div className="v2-admin-stack mb-8">
        {rows.map((row, index) => (
          <div key={row.id} className="v2-card rounded-2xl p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-black">#{row.position} · {row.name}</p>
                <p className="text-xs text-black">{row.phoneNumber} · {row.timeSlot}</p>
              </div>
              <span className="text-xs tracking-wider text-black">{row.status}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-3">
              <button onClick={() => void move(index, -1)} disabled={index === 0} className="rounded-xl border border-slate-200 py-2 text-xs font-semibold text-black disabled:opacity-40">Up</button>
              <button onClick={() => void move(index, 1)} disabled={index === rows.length - 1} className="rounded-xl border border-slate-200 py-2 text-xs font-semibold text-black disabled:opacity-40">Down</button>
              <button onClick={() => void completeEntry(row.id)} className="rounded-xl border border-slate-300 py-2 text-xs font-semibold text-black">Complete</button>
              <button onClick={() => void removeEntry(row.id)} className="rounded-xl border border-slate-300 py-2 text-xs font-semibold text-black">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => void concludeSession()} className="w-full rounded-2xl border border-slate-300 bg-white/70 py-3 text-xs font-bold uppercase tracking-widest text-black">
        Conclude Session
      </button>
    </motion.div>
  )
}
