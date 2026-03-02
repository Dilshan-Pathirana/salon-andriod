import React from 'react'
import { motion } from 'framer-motion'

interface TimeSlotsProps {
  selectedTime: string | null
  onSelectTime: (time: string) => void
  slots: Array<{ time: string; available: boolean }>
}
export function TimeSlots({ selectedTime, onSelectTime, slots }: TimeSlotsProps) {
  return (
    <div className="w-full mb-12">
      <h3 className="font-playfair text-xl text-slate-800 mb-6">
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
              className={`
                px-5 py-3 rounded-full font-inter text-sm tracking-wide transition-all duration-300 border
                ${!slot.available ? 'border-teal-100/30 text-slate-400/50 cursor-not-allowed bg-transparent' : isSelected ? 'border-emerald-500 bg-emerald-500 text-white font-medium shadow-[0_4px_14px_rgba(151,117,77,0.2)]' : 'border-emerald-600/50 text-emerald-600 bg-transparent hover:border-emerald-600'}
              `}
            >
              {slot.time}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

