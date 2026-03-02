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
    const today = dateOnly(new Date())
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

    const asc = (a: ManagedAppointment, b: ManagedAppointment) => parseDate(a.date).getTime() - parseDate(b.date).getTime() || a.timeSlot.localeCompare(b.timeSlot)
    const desc = (a: ManagedAppointment, b: ManagedAppointment) => parseDate(b.date).getTime() - parseDate(a.date).getTime() || b.timeSlot.localeCompare(a.timeSlot)

    return {
      today: todayRows.sort(asc),
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
      <h2 className="font-playfair text-xl text-luxury-white mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="font-inter text-sm text-luxury-muted">No appointments</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-luxury-brown/40 rounded-lg p-4 bg-luxury-green/20">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-luxury-white text-sm">{item.userName || 'Reserved'}</p>
                  <p className="text-luxury-muted text-xs">{item.phoneNumber || '-'}</p>
                  <p className="text-luxury-muted text-xs mt-1">{item.date} · {item.timeSlot}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-luxury-champagne tracking-wider block">{item.isReserved ? 'RESERVED' : item.status}</span>
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
      <h1 className="font-playfair text-3xl text-luxury-white text-center mb-8">Appointment Management</h1>

      <div className="border border-luxury-brown/40 rounded-xl p-4 mb-8 bg-luxury-green/25 space-y-3">
        <p className="text-xs tracking-widest uppercase text-luxury-muted">Add Reserved Appointment</p>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={reservedDate} onChange={(event) => setReservedDate(event.target.value)} className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white" />
          <input type="time" value={reservedTime} onChange={(event) => setReservedTime(event.target.value)} className="bg-luxury-black border border-luxury-brown/40 rounded-lg p-3 text-sm text-luxury-white" />
        </div>
        <button onClick={() => void createReserved()} className="w-full py-3 bg-luxury-gold text-luxury-black rounded-lg text-xs tracking-widest uppercase font-semibold">
          Save Reserved Slot
        </button>
      </div>

      {message ? <p className="text-xs text-luxury-champagne mb-4">{message}</p> : null}
      {isLoading ? <p className="text-sm text-luxury-muted">Loading appointments...</p> : null}

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
