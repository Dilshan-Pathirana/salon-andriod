import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { cancelMyAppointment, getMyAppointments } from '../lib/api'

type AppointmentRow = {
  id: string
  date: string
  timeSlot: string
  status: string
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

function toTimestamp(item: AppointmentRow): number {
  const date = parseDate(item.date)
  const minutes = parseTimeToMinutes(item.timeSlot)
  return date.getTime() + minutes * 60_000
}

function getTodayStart(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function AppointmentsPage() {
  const [rows, setRows] = useState<AppointmentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      setMessage('')
      try {
        const data = await getMyAppointments()
        setRows(
          data.map((item) => ({
            id: item.id,
            date: item.date,
            timeSlot: item.timeSlot,
            status: item.status,
          })),
        )
      } catch {
        setMessage('Unable to load appointments')
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }, [])

  const grouped = useMemo(() => {
    const now = new Date()
    const nowMs = now.getTime()
    const today = getTodayStart()

    const todayItems: AppointmentRow[] = []
    const upcomingItems: AppointmentRow[] = []
    const pastItems: AppointmentRow[] = []

    rows.forEach((row) => {
      const date = parseDate(row.date)
      if (date.getTime() === today.getTime()) {
        todayItems.push(row)
      } else if (date > today) {
        upcomingItems.push(row)
      } else {
        pastItems.push(row)
      }
    })

    const sortAsc = (a: AppointmentRow, b: AppointmentRow) => toTimestamp(a) - toTimestamp(b)
    const sortDesc = (a: AppointmentRow, b: AppointmentRow) => toTimestamp(b) - toTimestamp(a)
    
    const sortTodayNearest = (a: AppointmentRow, b: AppointmentRow) => {
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
      today: todayItems.sort(sortTodayNearest),
      upcoming: upcomingItems.sort(sortAsc),
      past: pastItems.sort(sortDesc),
    }
  }, [rows])

  const cancelAppointment = async (id: string) => {
    const ok = window.confirm('Cancel this appointment?')
    if (!ok) return

    try {
      await cancelMyAppointment(id)
      setRows((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'CANCELLED' } : item)))
      setMessage('Appointment cancelled')
    } catch {
      setMessage('Unable to cancel appointment')
    }
  }

  const Section = ({ title, items, canCancel }: { title: string; items: AppointmentRow[]; canCancel?: boolean }) => (
    <section className="mb-8">
      <h2 className="font-sans font-semibold tracking-tight text-xl text-slate-800 mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="font-inter text-sm text-slate-400">No appointments</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-teal-100/40 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-inter text-sm text-slate-800">{item.date}</p>
                <p className="font-inter text-xs text-slate-400">{item.timeSlot}</p>
              </div>
              <div className="text-right">
                <span className="font-inter text-xs text-emerald-600 tracking-wider block">{item.status}</span>
                {canCancel && (item.status === 'BOOKED' || item.status === 'IN_SERVICE') ? (
                  <button
                    onClick={() => void cancelAppointment(item.id)}
                    className="mt-2 px-3 py-1 border border-red-400/50 rounded text-[10px] tracking-widest uppercase text-red-300"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="px-6 pt-12 pb-32"
    >
      <h1 className="font-sans font-semibold tracking-tight text-3xl text-slate-800 mb-8 text-center">Appointments</h1>

      {isLoading ? <p className="font-inter text-sm text-slate-400">Loading appointments...</p> : null}
      {message ? <p className="font-inter text-sm text-emerald-600">{message}</p> : null}

      {!isLoading && !message ? (
        <>
          <Section title="Today" items={grouped.today} canCancel />
          <Section title="Upcoming" items={grouped.upcoming} canCancel />
          <Section title="Past" items={grouped.past} />
        </>
      ) : null}
    </motion.div>
  )
}
