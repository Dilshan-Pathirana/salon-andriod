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
    max.setDate(max.getDate() + 30)
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
    <div className="mb-10 w-full">
      <div className="mb-4 flex items-center justify-between px-1">
        <button
          onClick={goPrevMonth}
          disabled={!canGoPrev}
          className={`rounded-xl p-2 transition-colors ${canGoPrev ? 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700' : 'cursor-not-allowed text-slate-300'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="v2-title text-lg font-bold">
          {monthLabel}
        </span>
        <button
          onClick={goNextMonth}
          disabled={!canGoNext}
          className={`rounded-xl p-2 transition-colors ${canGoNext ? 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700' : 'cursor-not-allowed text-slate-300'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="v2-card grid grid-cols-7 gap-x-2 gap-y-5 p-5 text-center">
        {days.map((day, i) => (
          <div
            key={`day-${i}`}
            className="v2-label text-center text-[10px] text-slate-400"
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
            <div key={date} className="flex h-10 items-center justify-center">
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
                className={`h-10 w-10 rounded-2xl text-sm font-semibold transition-colors duration-300 ${!isSelectable ? 'cursor-not-allowed text-slate-300' : 'text-slate-700'} ${isSelected ? 'bg-[#006c49] text-white shadow-[0_10px_24px_rgba(0,108,73,0.2)]' : ''} ${isSelectable && !isSelected ? 'hover:bg-emerald-50' : ''}`}
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

