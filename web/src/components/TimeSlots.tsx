import React from 'react'
import { motion } from 'framer-motion'

interface TimeSlotsProps {
  selectedTime: string | null
  onSelectTime: (time: string) => void
  slots: Array<{ time: string; available: boolean }>
}

export function TimeSlots({ selectedTime, onSelectTime, slots }: TimeSlotsProps) {
  return (
    <div className="mb-8 w-full">
      <h3 className="font-headline text-xl font-bold text-on-surface mb-5">Select Your Time</h3>
      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot, i) => {
          const isSelected = selectedTime === slot.time
          return (
            <motion.button
              key={slot.time}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={slot.available ? { scale: 0.95 } : {}}
              onClick={() => slot.available && onSelectTime(slot.time)}
              disabled={!slot.available}
              className={`rounded-2xl py-3 px-2 text-sm font-bold tracking-wide transition-all duration-200 ${
                !slot.available
                  ? 'cursor-not-allowed bg-surface-container text-outline-variant line-through opacity-50'
                  : isSelected
                  ? 'bg-primary text-on-primary shadow-[0_12px_24px_rgba(0,108,73,0.25)]'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {slot.time}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

