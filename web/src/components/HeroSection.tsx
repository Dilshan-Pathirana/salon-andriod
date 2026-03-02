import React from 'react'
import { motion } from 'framer-motion'
interface HeroSectionProps {
  onBookClick: () => void
}
export function HeroSection({ onBookClick }: HeroSectionProps) {
  return (
    <section className="relative h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-50/40 via-white to-white opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-sm mx-auto mt-12">
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
          <h2 className="font-playfair text-emerald-500 text-2xl tracking-[0.2em] uppercase mb-6">
            L'Atelier
          </h2>
          <h1 className="font-playfair text-4xl md:text-5xl text-slate-800 leading-tight mb-4">
            Precision in
            <br />
            Every Detail
          </h1>
          <p className="font-inter text-slate-400 text-sm md:text-base tracking-wide font-light">
            Modern Grooming Experience
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
          className="mt-12 w-full bg-emerald-500 text-white font-inter text-[13px] font-semibold tracking-widest uppercase py-4 rounded-[14px] shadow-[0_8px_30px_rgba(151,117,77,0.2)]"
        >
          Reserve Your Time
        </motion.button>
      </div>
    </section>
  )
}

