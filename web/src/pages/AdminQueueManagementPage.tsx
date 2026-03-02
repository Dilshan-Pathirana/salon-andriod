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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="px-4 py-6">
      <h1 className="font-playfair text-3xl text-luxury-white text-center mb-8">Queue Management</h1>

      <div className="mb-6">
        <label className="text-xs text-luxury-muted block mb-2 tracking-widest uppercase">Queue date</label>
        <input
          type="date"
          value={queueDate}
          onChange={(event) => setQueueDate(event.target.value)}
          className="w-full bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white"
        />
      </div>

      {message ? <p className="text-xs text-luxury-champagne mb-4">{message}</p> : null}
      {isLoading ? <p className="text-sm text-luxury-muted mb-4">Loading queue...</p> : null}
      {!isLoading && rows.length === 0 ? <p className="text-sm text-luxury-muted mb-6">No appointments for this day</p> : null}

      <div className="space-y-3 mb-8">
        {rows.map((row, index) => (
          <div key={row.id} className="border border-luxury-brown/40 rounded-lg p-3 bg-luxury-green/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-luxury-white">#{row.position} · {row.name}</p>
                <p className="text-xs text-luxury-muted">{row.phoneNumber} · {row.timeSlot}</p>
              </div>
              <span className="text-xs text-luxury-champagne tracking-wider">{row.status}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-3">
              <button onClick={() => void move(index, -1)} disabled={index === 0} className="py-2 border border-luxury-brown/40 rounded text-xs text-luxury-white disabled:opacity-40">Up</button>
              <button onClick={() => void move(index, 1)} disabled={index === rows.length - 1} className="py-2 border border-luxury-brown/40 rounded text-xs text-luxury-white disabled:opacity-40">Down</button>
              <button onClick={() => void completeEntry(row.id)} className="py-2 border border-green-400/40 rounded text-xs text-green-300">Complete</button>
              <button onClick={() => void removeEntry(row.id)} className="py-2 border border-red-400/40 rounded text-xs text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => void concludeSession()} className="w-full py-3 border border-red-500/60 text-red-300 rounded-lg text-xs tracking-widest uppercase font-semibold bg-luxury-black/40">
        Conclude Session
      </button>
    </motion.div>
  )
}
