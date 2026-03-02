import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BookingCalendarProps {
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function BookingCalendar({
  selectedDate,
  onSelectDate,
}: BookingCalendarProps) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const maxBookDate = useMemo(() => {
    const max = new Date(today)
    max.setDate(max.getDate() + 2)
    return max
  }, [today])

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const firstDayOfMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1), [viewDate])
  const daysInMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate(), [viewDate])
  const leadingBlanks = useMemo(() => Array(firstDayOfMonth.getDay()).fill(null), [firstDayOfMonth])
  const dates = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])

  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const maxMonth = new Date(maxBookDate.getFullYear(), maxBookDate.getMonth(), 1)

  const canGoPrev = viewDate > minMonth
  const canGoNext = viewDate < maxMonth

  const goPrevMonth = () => {
    if (!canGoPrev) return
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goNextMonth = () => {
    if (!canGoNext) return
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  return (
    <div className="w-full mb-10">
      <div className="flex justify-between items-center mb-6 px-2">
        <button
          onClick={goPrevMonth}
          disabled={!canGoPrev}
          className={`p-2 transition-colors ${canGoPrev ? 'text-slate-400 hover:text-slate-800' : 'text-slate-800/20 cursor-not-allowed'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-playfair text-lg text-slate-800">
          {monthLabel}
        </span>
        <button
          onClick={goNextMonth}
          disabled={!canGoNext}
          className={`p-2 transition-colors ${canGoNext ? 'text-slate-400 hover:text-slate-800' : 'text-slate-800/20 cursor-not-allowed'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center">
        {days.map((day, i) => (
          <div
            key={`day-${i}`}
            className="font-inter text-xs text-slate-400 font-medium"
          >
            {day}
          </div>
        ))}

        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-10" />
        ))}

        {dates.map((date) => {
          const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), date)
          const dateKey = toDateKey(dateObj)
          const isSelectable = dateObj >= today && dateObj <= maxBookDate
          const isSelected = selectedDate === dateKey

          return (
            <div key={date} className="flex justify-center items-center h-10">
              <motion.button
                whileTap={
                  isSelectable
                    ? {
                        scale: 0.9,
                      }
                    : {}
                }
                onClick={() => isSelectable && onSelectDate(dateKey)}
                disabled={!isSelectable}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-inter text-sm transition-colors duration-300
                  ${!isSelectable ? 'text-slate-800/20 cursor-not-allowed' : 'text-slate-800'}
                  ${isSelected ? 'bg-emerald-600 text-white font-semibold' : ''}
                  ${isSelectable && !isSelected ? 'hover:bg-teal-50/50' : ''}
                `}
              >
                {date}
              </motion.button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

