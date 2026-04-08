import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  adminCreateReservedAppointment,
  adminDeleteAppointment,
  adminGetAppointments,
  ManagedAppointment,
} from '../lib/api'
import { pageMotionProps } from '../lib/motion'

function dateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function parseTimeToMinutes(timeSlot: string): number {
  const value = timeSlot.trim()
  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1])
    const minutes = Number(twelveHourMatch[2])
    const meridiem = twelveHourMatch[3].toUpperCase()

    if (meridiem === 'PM' && hours < 12) hours += 12
    if (meridiem === 'AM' && hours === 12) hours = 0

    return hours * 60 + minutes
  }

  const [hoursRaw, minutesRaw] = value.split(':')
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
  return hours * 60 + minutes
}

function toTimestamp(item: ManagedAppointment): number {
  const date = parseDate(item.date)
  const minutes = parseTimeToMinutes(item.timeSlot)
  return date.getTime() + minutes * 60_000
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const sectionText = 'text-slate-900 dark:text-emerald-50'
const sectionMutedText = 'text-slate-500 dark:text-emerald-100/70'

export function AdminAppointmentManagementPage() {
  const [rows, setRows] = useState<ManagedAppointment[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [reservedDate, setReservedDate] = useState(toDateKey(new Date()))
  const [reservedTime, setReservedTime] = useState('12:00')

  const load = async () => {
    setIsLoading(true)
    setMessage('')
    try {
      const data = await adminGetAppointments()
      setRows(data)
    } catch {
      setMessage('Unable to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const grouped = useMemo(() => {
    const now = new Date()
    const nowMs = now.getTime()
    const today = dateOnly(now)
    const todayRows: ManagedAppointment[] = []
    const upcomingRows: ManagedAppointment[] = []
    const pastRows: ManagedAppointment[] = []

    rows.forEach((row) => {
      const rowDate = parseDate(row.date)
      if (rowDate.getTime() === today.getTime()) {
        todayRows.push(row)
      } else if (rowDate > today) {
        upcomingRows.push(row)
      } else {
        pastRows.push(row)
      }
    })

    const asc = (a: ManagedAppointment, b: ManagedAppointment) => toTimestamp(a) - toTimestamp(b)
    const desc = (a: ManagedAppointment, b: ManagedAppointment) => toTimestamp(b) - toTimestamp(a)
    const todayNearest = (a: ManagedAppointment, b: ManagedAppointment) => {
      const aTime = toTimestamp(a)
      const bTime = toTimestamp(b)
      const aIsUpcoming = aTime >= nowMs
      const bIsUpcoming = bTime >= nowMs

      if (aIsUpcoming && !bIsUpcoming) return -1
      if (!aIsUpcoming && bIsUpcoming) return 1

      if (aIsUpcoming && bIsUpcoming) return aTime - bTime
      return bTime - aTime
    }

    return {
      today: todayRows.sort(todayNearest),
      upcoming: upcomingRows.sort(asc),
      past: pastRows.sort(desc),
    }
  }, [rows])

  const deleteAppointment = async (id: string) => {
    const ok = window.confirm('WARNING: This will delete the appointment immediately without user approval. Continue?')
    if (!ok) return

    const previous = rows
    setRows((current) => current.filter((item) => item.id !== id))

    try {
      await adminDeleteAppointment(id)
      setMessage('Appointment deleted')
    } catch {
      setRows(previous)
      setMessage('Failed to delete appointment')
    }
  }

  const createReserved = async () => {
    setMessage('')
    try {
      const created = await adminCreateReservedAppointment({
        date: reservedDate,
        timeSlot: reservedTime,
      })
      setRows((prev) => [created, ...prev])
      setMessage('Reserved appointment added')
    } catch {
      setMessage('Failed to add reserved appointment')
    }
  }

  const Section = ({ title, items }: { title: string; items: ManagedAppointment[] }) => (
    <section className="mb-8">
      <h2 className="v2-title mb-3 text-xl">{title}</h2>
      {items.length === 0 ? (
        <p className={`font-inter text-sm ${sectionMutedText}`}>No appointments</p>
      ) : (
        <div className="v2-admin-stack">
          {items.map((item) => (
            <div key={item.id} className="v2-card rounded-2xl p-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className={`text-sm ${sectionText}`}>{item.userName || 'Reserved'}</p>
                  <p className={`text-xs ${sectionMutedText}`}>{item.phoneNumber || '-'}</p>
                  <p className={`text-xs mt-1 ${sectionMutedText}`}>{item.date} · {item.timeSlot}</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs tracking-wider text-emerald-700 dark:text-emerald-300">{item.isReserved ? 'RESERVED' : item.status}</span>
                  <button
                    onClick={() => void deleteAppointment(item.id)}
                    className="mt-2 rounded-xl border border-red-300 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )

  return (
    <motion.div {...pageMotionProps} className="v2-admin-shell">
      <h1 className="v2-title mb-8 text-center text-3xl">Appointment Management</h1>

      <div className="v2-card mb-8 v2-admin-stack p-4">
        <p className="v2-label">Add Reserved Appointment</p>
        <div className="v2-admin-grid">
          <input type="date" value={reservedDate} onChange={(event) => setReservedDate(event.target.value)} className="v2-input" />
          <input type="time" value={reservedTime} onChange={(event) => setReservedTime(event.target.value)} className="v2-input" />
        </div>
        <button onClick={() => void createReserved()} className="v2-btn-primary">
          Save Reserved Slot
        </button>
      </div>

      {message ? <p className="text-xs text-blue-600 dark:text-blue-300 mb-4">{message}</p> : null}
      {isLoading ? <p className={`text-sm ${sectionMutedText}`}>Loading appointments...</p> : null}

      {!isLoading ? (
        <>
          <Section title="Today" items={grouped.today} />
          <Section title="Upcoming" items={grouped.upcoming} />
          <Section title="Past" items={grouped.past} />
        </>
      ) : null}
    </motion.div>
  )
}
