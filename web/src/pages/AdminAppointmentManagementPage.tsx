import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  adminCreateReservedAppointment,
  adminDeleteAppointment,
  adminGetAppointments,
  ManagedAppointment,
} from '../lib/api'

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
      <h2 className="font-sans font-semibold tracking-tight text-xl text-slate-900 mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="font-inter text-sm text-slate-500">No appointments</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-slate-900 text-sm">{item.userName || 'Reserved'}</p>
                  <p className="text-slate-500 text-xs">{item.phoneNumber || '-'}</p>
                  <p className="text-slate-500 text-xs mt-1">{item.date} · {item.timeSlot}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-blue-600 tracking-wider block">{item.isReserved ? 'RESERVED' : item.status}</span>
                  <button
                    onClick={() => void deleteAppointment(item.id)}
                    className="mt-2 px-3 py-2 border border-red-400/50 rounded-lg text-xs tracking-widest uppercase text-red-300"
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="px-4 py-6">
      <h1 className="font-sans font-semibold tracking-tight text-3xl text-slate-900 text-center mb-8">Appointment Management</h1>

      <div className="border border-slate-200 rounded-xl p-4 mb-8 bg-white shadow-sm space-y-3">
        <p className="text-xs tracking-widest uppercase text-slate-500">Add Reserved Appointment</p>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={reservedDate} onChange={(event) => setReservedDate(event.target.value)} className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900" />
          <input type="time" value={reservedTime} onChange={(event) => setReservedTime(event.target.value)} className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900" />
        </div>
        <button onClick={() => void createReserved()} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors text-white rounded-lg text-xs tracking-widest uppercase font-semibold">
          Save Reserved Slot
        </button>
      </div>

      {message ? <p className="text-xs text-blue-600 mb-4">{message}</p> : null}
      {isLoading ? <p className="text-sm text-slate-500">Loading appointments...</p> : null}

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
