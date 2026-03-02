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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-50/40 via-white to-white opacity-80" />
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
          <h2 className="font-playfair text-teal-700 text-xl tracking-[0.16em] uppercase mb-4">
            Salon Ru Zero One
          </h2>
          <h1 className="font-playfair text-4xl text-slate-800 leading-tight mb-3">
            Style in
            <br />
            Every Detail
          </h1>
          <p className="font-inter text-slate-500 text-sm tracking-wide font-normal">
            Premium modern grooming for everyday confidence
          </p>
        </motion.div>

        <motion.button
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
            delay: 0.2,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          whileTap={{
            scale: 0.97,
          }}
          onClick={onBookClick}
          className="mt-8 w-full bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-inter text-[13px] font-semibold tracking-wide uppercase py-4 rounded-xl shadow-lg"
        >
          Reserve Your Time
        </motion.button>
      </div>
    </section>
  )
}

