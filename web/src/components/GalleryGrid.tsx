import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
const placeholders = [
  'bg-gradient-to-br from-teal-50 to-white',
  'bg-gradient-to-tr from-teal-100/40 to-white',
  'bg-gradient-to-bl from-teal-50/60 to-white',
  'bg-gradient-to-tl from-teal-100/60 to-white',
  'bg-gradient-to-b from-teal-50/80 to-white',
  'bg-gradient-to-t from-teal-100/80 to-white',
]
export function GalleryGrid() {
  const [selectedImg, setSelectedImg] = useState<number | null>(null)
  return (
    <div className="px-6 py-12">
      <motion.h2
        initial={{
          opacity: 0,
        }}
        whileInView={{
          opacity: 1,
        }}
        viewport={{
          once: true,
        }}
        className="font-sans font-semibold tracking-tight text-2xl text-slate-800 mb-10 text-center"
      >
        Our Work
      </motion.h2>

      <div className="grid grid-cols-2 gap-4">
        {placeholders.map((bgClass, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: '-50px',
            }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => setSelectedImg(i)}
            className={`w-full rounded-[12px] shadow-lg cursor-pointer overflow-hidden ${bgClass} ${i % 2 === 0 ? 'h-48' : 'h-64 mt-4'}`}
          >
            {/* Simulated image content */}
            <div className="w-full h-full opacity-20 mix-blend-overlay bg-noise" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImg !== null && (
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
              duration: 0.3,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm"
            onClick={() => setSelectedImg(null)}
          >
            <button
              className="absolute top-6 right-6 text-slate-800/70 hover:text-slate-800 p-2"
              onClick={() => setSelectedImg(null)}
            >
              <X className="w-8 h-8" strokeWidth={1} />
            </button>
            <motion.div
              initial={{
                scale: 0.95,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.95,
                opacity: 0,
              }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className={`w-[90vw] h-[70vh] rounded-[16px] shadow-2xl ${placeholders[selectedImg]} relative overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-noise" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

