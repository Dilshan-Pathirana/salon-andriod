import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookingCalendar } from '../components/BookingCalendar'
import { TimeSlots } from '../components/TimeSlots'
import { Check } from 'lucide-react'
import { createAppointment, getClientScheduleByDate, getServices, isSessionAuthenticated } from '../lib/api'

const services = [
  {
    id: 'cut',
    name: 'Precision Haircut',
    price: 45,
  },
  {
    id: 'shave',
    name: 'Hot Towel Shave',
    price: 35,
  },
  {
    id: 'beard',
    name: 'Beard Sculpting',
    price: 30,
  },
  {
    id: 'premium',
    name: 'The Full Experience',
    price: 95,
  },
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
  const [serviceRows, setServiceRows] = useState(services)

  React.useEffect(() => {
    const run = async () => {
      try {
        const data = await getServices()
        const active = data.filter((item: any) => item.isActive)
        if (active.length > 0) {
          setServiceRows(
            active.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: Number(item.price),
            })),
          )
        }
      } catch {
      }
    }

    void run()
  }, [])

  React.useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate || !isSessionAuthenticated()) {
        setSlots([])
        return
      }

      try {
        const schedule = await getClientScheduleByDate(selectedDate)
        setSlots(schedule?.slots || [])
      } catch {
        setSlots([])
      }
    }

    void loadSlots()
  }, [selectedDate])

  const handleConfirm = async () => {
    if (!isSessionAuthenticated()) {
      onRequireAuth()
      return
    }

    if (selectedDate && selectedService && selectedTime) {
      setIsSubmitting(true)
      setMessage('')
      try {
        await createAppointment({
          date: selectedDate,
          timeSlot: selectedTime,
        })

        setIsSuccess(true)
        window.setTimeout(() => {
          onBookingComplete()
        }, 1800)
      } catch (error: any) {
        setMessage(error?.response?.data?.message || 'Booking failed')
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  if (isSuccess) {
    return (
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 1,
          ease: 'easeInOut',
        }}
        className="min-h-screen flex flex-col items-center justify-center px-6 bg-white absolute inset-0 z-50"
      >
        <motion.div
          initial={{
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
            duration: 0.8,
            ease: 'easeOut',
          }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-full border border-emerald-600 flex items-center justify-center mb-8">
            <Check
              className="w-8 h-8 text-emerald-600"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="font-playfair text-3xl text-emerald-600 mb-4">
            Your Time Has Been Secured
          </h1>
          <p className="font-inter text-slate-400 text-sm tracking-wide">
            We look forward to welcoming you.
          </p>
        </motion.div>
      </motion.div>
    )
  }
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="px-6 pt-12 pb-32"
    >
      <h1 className="font-playfair text-3xl text-slate-800 mb-10 text-center">
        Reserve Your Time
      </h1>

      <p className="text-xs text-slate-400 tracking-widest uppercase mb-3">Step 1 - Pick a date</p>

      <BookingCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            transition={{
              duration: 0.5,
            }}
            className="mb-12 overflow-hidden"
          >
            <p className="text-xs text-slate-400 tracking-widest uppercase mb-3">Step 2 - Pick a service</p>
            <h3 className="font-playfair text-xl text-slate-800 mb-6">
              Select Service
            </h3>
            <div className="space-y-4">
              {serviceRows.map((service) => {
                const isSelected = selectedService === service.id
                return (
                  <motion.button
                    key={service.id}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={() => setSelectedService(service.id)}
                    className={`
                      w-full flex justify-between items-center p-5 rounded-[12px] border transition-all duration-300
                      ${isSelected ? 'border-emerald-500 border-l-[4px] bg-teal-50/20' : 'border-teal-100/40 bg-transparent hover:border-teal-100'}
                    `}
                  >
                    <span
                      className={`font-inter text-base ${isSelected ? 'text-slate-800 font-medium' : 'text-slate-400'}`}
                    >
                      {service.name}
                    </span>
                    <span className="font-playfair text-emerald-500 text-lg">
                      ${service.price}
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
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            transition={{
              duration: 0.5,
            }}
            className="overflow-hidden"
          >
            <p className="text-xs text-slate-400 tracking-widest uppercase mb-3">Step 3 - Pick a time slot</p>
            <TimeSlots
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              slots={slots}
            />

            <p className="text-xs text-slate-400 tracking-widest uppercase mb-3">Step 4 - Confirm booking</p>

            {message ? <p className="text-sm text-emerald-600 mb-4">{message}</p> : null}

            <motion.button
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() => void handleConfirm()}
              disabled={!selectedTime}
              className={`
                w-full py-4 rounded-[14px] font-inter text-[13px] font-semibold tracking-widest uppercase transition-all duration-500
                ${selectedTime && !isSubmitting ? 'bg-emerald-500 text-white shadow-[0_8px_30px_rgba(151,117,77,0.2)]' : 'bg-teal-100/20 text-slate-400 cursor-not-allowed'}
              `}
            >
              {isSubmitting ? 'Booking...' : 'Confirm Reservation'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

