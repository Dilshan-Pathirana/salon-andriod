import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookingCalendar } from '../components/BookingCalendar'
import { TimeSlots } from '../components/TimeSlots'
import { createAppointment, getClientScheduleByDate, getServices, isSessionAuthenticated } from '../lib/api'
import { pageMotionProps } from '../lib/motion'

const services = [
  { id: 'cut', name: 'Precision Haircut', price: 45 },
  { id: 'shave', name: 'Hot Towel Shave', price: 35 },
  { id: 'beard', name: 'Beard Sculpting', price: 30 },
  { id: 'premium', name: 'The Full Experience', price: 95 },
]

interface BookingPageProps {
  onRequireAuth: () => void
  onBookingComplete: () => void
}

export function BookingPage({ onRequireAuth, onBookingComplete }: BookingPageProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [slots, setSlots] = useState<Array<{ time: string; available: boolean }>>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [noSchedule, setNoSchedule] = useState(false)
  const [serviceRows, setServiceRows] = useState(services)

  React.useEffect(() => {
    const run = async () => {
      try {
        const data = await getServices()
        const active = data.filter((item: any) => item.isActive)
        if (active.length > 0) {
          setServiceRows(active.map((item: any) => ({ id: item.id, name: item.name, price: Number(item.price) })))
        }
      } catch {}
    }
    void run()
  }, [])

  React.useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate) { setSlots([]); setNoSchedule(false); return }
      setLoadingSlots(true); setNoSchedule(false)
      try {
        const schedule = await getClientScheduleByDate(selectedDate)
        if (!schedule) { setNoSchedule(true); setSlots([]) }
        else { setSlots(schedule.slots) }
      } catch { setSlots([]); setNoSchedule(true) }
      finally { setLoadingSlots(false) }
    }
    void loadSlots()
  }, [selectedDate])

  const handleConfirm = async () => {
    if (!isSessionAuthenticated()) { onRequireAuth(); return }
    if (selectedDate && selectedService && selectedTime) {
      setIsSubmitting(true); setMessage('')
      try {
        await createAppointment({ date: selectedDate, timeSlot: selectedTime })
        setIsSuccess(true)
        window.setTimeout(() => { onBookingComplete() }, 1800)
      } catch (error: any) {
        setMessage(error?.response?.data?.message || 'Booking failed')
      } finally { setIsSubmitting(false) }
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-8"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#006c49" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </motion.div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface text-center">
          Your Time Has<br />Been Secured
        </h1>
        <p className="text-on-surface-variant text-sm mt-4 tracking-wide">We look forward to welcoming you.</p>
      </motion.div>
    )
  }

  return (
    <motion.div {...pageMotionProps} className="px-6 pt-8 pb-28">
      <div className="mb-8">
        <p className="ds-overline text-primary mb-2">Step-by-step</p>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Reserve<br />Your Time</h1>
      </div>

      <p className="font-label font-bold text-[10px] uppercase tracking-[0.16em] text-on-surface-variant mb-4">
        Step 1 — Pick a date
      </p>
      <BookingCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <p className="font-label font-bold text-[10px] uppercase tracking-[0.16em] text-on-surface-variant mb-4 mt-4">
              Step 2 — Pick a service
            </p>
            <div className="space-y-3 mb-8">
              {serviceRows.map((service) => {
                const isSelected = selectedService === service.id
                return (
                  <motion.button
                    key={service.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedService(service.id)}
                    className={`w-full flex items-center justify-between rounded-2xl p-4 transition-all duration-200 ${
                      isSelected
                        ? 'bg-emerald-50 border-2 border-primary shadow-[0_8px_24px_rgba(0,108,73,0.10)]'
                        : 'bg-surface-container-lowest border border-outline-variant'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary' : 'border-outline'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className={`font-label font-bold text-sm ${isSelected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {service.name}
                      </span>
                    </div>
                    <span className="font-headline font-bold text-primary text-base">
                      Rs. {service.price}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <p className="font-label font-bold text-[10px] uppercase tracking-[0.16em] text-on-surface-variant mb-4">
              Step 3 — Pick a time slot
            </p>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-sm text-on-surface-variant">Loading times…</span>
              </div>
            ) : noSchedule ? (
              <div className="py-10 text-center bg-surface-container-lowest rounded-2xl">
                <p className="text-on-surface-variant text-sm">No availability for this date.</p>
                <p className="text-outline text-xs mt-1">Please choose another date.</p>
              </div>
            ) : (
              <TimeSlots selectedTime={selectedTime} onSelectTime={setSelectedTime} slots={slots} />
            )}

            <p className="font-label font-bold text-[10px] uppercase tracking-[0.16em] text-on-surface-variant mt-6 mb-4">
              Step 4 — Confirm booking
            </p>
            {message ? <p className="text-sm text-red-500 mb-4">{message}</p> : null}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => void handleConfirm()}
              disabled={!selectedTime || isSubmitting}
              className="ds-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Booking…' : 'Confirm Reservation'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
