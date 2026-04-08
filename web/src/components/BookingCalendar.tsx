import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

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

export function BookingCalendar({ selectedDate, onSelectDate }: BookingCalendarProps) {
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

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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
    <div className="mb-8 w-full">
      {/* Month nav */}
      <div className="mb-5 flex items-center justify-between px-1">
        <button
          onClick={goPrevMonth}
          disabled={!canGoPrev}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${canGoPrev ? 'text-on-surface-variant hover:bg-surface-container-low' : 'cursor-not-allowed text-outline-variant'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="font-headline text-lg font-bold text-on-surface">{monthLabel}</span>
        <button
          onClick={goNextMonth}
          disabled={!canGoNext}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${canGoNext ? 'text-on-surface-variant hover:bg-surface-container-low' : 'cursor-not-allowed text-outline-variant'}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_20px_40px_rgba(0,108,73,0.03)]">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-4">
          {days.map((day, i) => (
            <div key={`day-${i}`} className="text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7 gap-y-2">
          {leadingBlanks.map((_, i) => (
            <div key={`blank-${i}`} className="h-10" />
          ))}

          {dates.map((date) => {
            const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), date)
            const dateKey = toDateKey(dateObj)
            const isSelectable = dateObj >= today && dateObj <= maxBookDate
            const isSelected = selectedDate === dateKey
            const isToday = toDateKey(dateObj) === toDateKey(today)

            return (
              <div key={date} className="flex items-center justify-center">
                <motion.button
                  whileTap={isSelectable ? { scale: 0.9 } : {}}
                  animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                  onClick={() => isSelectable && onSelectDate(dateKey)}
                  disabled={!isSelectable}
                  className={`h-10 w-10 rounded-2xl text-sm font-bold transition-all duration-200 ${
                    !isSelectable
                      ? 'cursor-not-allowed text-outline-variant'
                      : isSelected
                      ? 'bg-primary text-on-primary shadow-[0_8px_20px_rgba(0,108,73,0.3)]'
                      : isToday
                      ? 'bg-primary/10 text-primary font-extrabold'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {date}
                </motion.button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

