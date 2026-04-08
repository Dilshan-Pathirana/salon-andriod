import React from 'react'
import { motion } from 'framer-motion'

interface TimeSlotsProps {
  selectedTime: string | null
  onSelectTime: (time: string) => void
  slots: Array<{ time: string; available: boolean }>
}
export function TimeSlots({ selectedTime, onSelectTime, slots }: TimeSlotsProps) {
  return (
    <div className="mb-12 w-full">
      <h3 className="v2-title mb-6 text-xl font-bold">
        Select Your Time
      </h3>
      <div className="flex flex-wrap gap-3">
        {slots.map((slot, i) => {
          const isSelected = selectedTime === slot.time
          return (
            <motion.button
              key={slot.time}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: i * 0.05,
              }}
              whileTap={
                slot.available
                  ? {
                      scale: 0.95,
                    }
                  : {}
              }
              onClick={() => slot.available && onSelectTime(slot.time)}
              disabled={!slot.available}
              className={`rounded-2xl border px-5 py-3 text-sm font-bold tracking-wide transition-all duration-300 ${!slot.available ? 'cursor-not-allowed border-emerald-100/60 bg-slate-50 text-slate-400/60 line-through' : isSelected ? 'border-emerald-700 bg-[#006c49] text-white shadow-[0_12px_24px_rgba(0,108,73,0.2)]' : 'border-emerald-200 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50'}`}
            >
              {slot.time}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

