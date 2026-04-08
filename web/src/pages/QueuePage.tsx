import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GoldSpinner } from '../components/GoldSpinner'
import { getCurrentSession, getLiveQueue, LiveQueueItem } from '../lib/api'
import { pageMotionProps } from '../lib/motion'

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function QueuePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [queue, setQueue] = useState<LiveQueueItem[]>([])
  const [currentlyServing, setCurrentlyServing] = useState<string | null>(null)

  useEffect(() => {
    const loadQueue = async () => {
      setIsLoading(true)
      try {
        const response = await getLiveQueue(toDateKey(new Date()))
        setQueue(response.queue || [])
        setCurrentlyServing(response.currentlyServing?.name || null)
      } catch {
        setQueue([])
        setCurrentlyServing(null)
      } finally {
        setIsLoading(false)
      }
    }
    void loadQueue()
  }, [])

  const sessionUserId = getCurrentSession()?.user?.id
  const isEmpty = queue.length === 0
  const myQueueItem = queue.find((item) => sessionUserId && item.userId === sessionUserId) || null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <GoldSpinner />
      </div>
    )
  }

  return (
    <motion.div {...pageMotionProps} className="pb-28">
      <div className="px-6 pt-8 pb-6">
        <p className="ds-overline text-primary mb-2">Real-time</p>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Live<br />Queue</h1>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center py-24 px-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3c4a42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="font-label font-bold text-on-surface-variant text-sm uppercase tracking-widest">
              No appointments today
            </p>
          </div>
        </div>
      ) : (
        <div className="px-6 space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,108,73,0.2)]">
            <p className="font-label font-bold text-[10px] uppercase tracking-[0.18em] opacity-75 mb-3">Now Serving</p>
            <h2 className="font-headline text-4xl font-extrabold">
              {currentlyServing || queue[0]?.name || '~'}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-2xl p-4 text-center">
                <span className="font-headline text-3xl font-bold">{queue.length}</span>
                <p className="font-label text-[10px] uppercase tracking-wider opacity-75 mt-1">In Queue</p>
              </div>
              {myQueueItem && (
                <div className="bg-white/20 rounded-2xl p-4 text-center">
                  <span className="font-headline text-3xl font-bold">#{myQueueItem.position}</span>
                  <p className="font-label text-[10px] uppercase tracking-wider opacity-75 mt-1">Your Slot</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-[0_10px_30px_rgba(0,108,73,0.03)]">
            <p className="font-label font-bold text-[10px] uppercase tracking-[0.18em] text-on-surface-variant px-2 mb-4">
              Queue Order
            </p>
            <div className="space-y-1">
              {queue.map((person, idx) => {
                const isYou = Boolean(sessionUserId && person.userId === sessionUserId)
                const isServing = person.status === 'IN_SERVICE'
                return (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-4 transition-all ${
                      isServing
                        ? 'border-l-4 border-tertiary-container bg-orange-50/50'
                        : isYou
                        ? 'border-2 border-primary/30 bg-emerald-50/60'
                        : ''
                    }`}
                  >
                    <span className={`w-8 text-center font-headline font-bold text-lg ${isServing ? 'text-tertiary-container' : isYou ? 'text-primary' : 'text-outline'}`}>
                      {person.position}
                    </span>
                    <span className={`flex-1 font-label font-bold text-sm ${isServing ? 'text-on-surface' : isYou ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {isYou ? `You` : person.name}
                    </span>
                    {isServing && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary-container">In Chair</span>
                    )}
                    {isYou && !isServing && myQueueItem && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">~{myQueueItem.estimatedWaitMins}m</span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
