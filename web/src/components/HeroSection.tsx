import React from 'react'
import { motion } from 'framer-motion'
interface HeroSectionProps {
  onBookClick: () => void
}
export function HeroSection({ onBookClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-[62vh] w-full flex flex-col items-center justify-center overflow-hidden px-4 pt-8 pb-6">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/70 via-white to-white opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-2 w-full max-w-sm mx-auto">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 rounded-full bg-blue-50 border border-blue-100/50">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-widest text-blue-700 uppercase">Now Accepting Walk-ins</span>
          </div>
          
          <h1 className="font-sans font-extrabold tracking-tight text-[2.75rem] text-slate-900 leading-[1.1] mb-5">
            Modern grooming
            <br />
            <span className="text-blue-600">redefined.</span>
          </h1>
          <p className="font-sans text-slate-500 text-base leading-relaxed max-w-xs mx-auto">
            Experience premium service tailored for clarity, confidence, and precision.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBookClick}
          className="w-full relative group overflow-hidden bg-blue-600 text-white font-sans text-[15px] font-medium py-4 px-6 rounded-xl shadow-sm hover:shadow-blue-500/25 transition-all"
        >
          <span className="relative z-10 font-semibold tracking-wide">Book Appointment</span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </div>
    </section>
  )
}

