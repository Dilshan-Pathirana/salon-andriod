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

    const sortAsc = (a: AppointmentRow, b: AppointmentRow) =>
      parseDate(a.date).getTime() - parseDate(b.date).getTime() || a.timeSlot.localeCompare(b.timeSlot)

    const sortDesc = (a: AppointmentRow, b: AppointmentRow) =>
      parseDate(b.date).getTime() - parseDate(a.date).getTime() || b.timeSlot.localeCompare(a.timeSlot)

    return {
      today: todayItems.sort(sortAsc),
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
      <h2 className="font-playfair text-xl text-slate-800 mb-3">{title}</h2>
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
      <h1 className="font-playfair text-3xl text-slate-800 mb-8 text-center">Appointments</h1>

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
