import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GoldSpinner } from '../components/GoldSpinner'
import { getCurrentSession, getLiveQueue, LiveQueueItem } from '../lib/api'

export function QueuePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [queue, setQueue] = useState<LiveQueueItem[]>([])
  const [currentlyServing, setCurrentlyServing] = useState<string | null>(null)

  useEffect(() => {
    const loadQueue = async () => {
      setIsLoading(true)
      try {
        const response = await getLiveQueue()
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
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.6,
      }}
      className="px-4 py-6 min-h-screen flex flex-col"
    >
      <h1 className="font-playfair text-3xl text-slate-800 mb-8 text-center">
        Live Queue
      </h1>

      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-inter text-slate-400 text-sm tracking-wide uppercase">
            No appointments for today
          </p>
        </div>
      ) : (
        <>
          {myQueueItem ? (
            <div className="mb-6 border border-teal-200 rounded-xl p-4 bg-teal-50/70 text-center">
              <p className="text-xs tracking-widest uppercase text-slate-400">Your Slot Number</p>
              <p className="font-playfair text-4xl text-teal-700 mt-2">{myQueueItem.position}</p>
              <p className="text-xs text-slate-400 mt-2">Approx wait: {myQueueItem.estimatedWaitMins} mins</p>
            </div>
          ) : null}

          <div className="flex flex-col items-center mb-8">
            <span className="font-inter text-xs tracking-widest text-slate-400 uppercase mb-4">
              Now Serving
            </span>
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="relative"
            >
              <h2 className="font-playfair text-4xl text-slate-800 pb-2">
                {currentlyServing || queue[0].name}
              </h2>
              <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-emerald-500/50" />
            </motion.div>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.4,
              duration: 0.6,
              ease: 'easeOut',
            }}
            className="flex flex-col items-center justify-center mb-8"
          >
            <div className="w-28 h-28 rounded-full border border-teal-400/30 flex flex-col items-center justify-center relative bg-white">
              <div className="absolute inset-2 rounded-full border border-teal-400/10" />
              <span className="font-playfair text-4xl text-teal-700 mb-1">
                {queue.length}
              </span>
            </div>
            <span className="font-inter text-sm text-slate-400 mt-6 tracking-wide uppercase">
              In Queue
            </span>
          </motion.div>

          <div className="flex-1">
            <div className="space-y-0">
              {queue.map((person, idx) => {
                const isYou = Boolean(sessionUserId && person.userId === sessionUserId)
                const isServing = person.status === 'IN_SERVICE'
                return (
                  <motion.div
                    key={person.id}
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.6 + idx * 0.1,
                    }}
                    className={`
                      flex items-center py-5 border-b border-teal-100/30
                      ${isYou ? 'bg-teal-50 -mx-2 px-3 rounded-lg border-transparent' : ''}
                    `}
                  >
                    <span
                      className={`w-8 font-inter text-sm ${isServing ? 'text-emerald-500' : 'text-slate-400'}`}
                    >
                      {person.position}
                    </span>
                    <span
                      className={`font-inter text-base ${isYou ? 'text-emerald-600 font-medium' : 'text-slate-800'}`}
                    >
                      {isYou ? 'You' : person.name}
                    </span>
                    {isServing ? (
                      <span className="ml-auto font-inter text-xs text-emerald-500 tracking-widest uppercase">
                        In Chair
                      </span>
                    ) : null}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

