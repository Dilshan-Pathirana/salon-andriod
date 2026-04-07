import React from 'react'
import { motion } from 'framer-motion'
interface HeroSectionProps {
  isLoggedIn: boolean
  onBookClick: () => void
}
export function HeroSection({ isLoggedIn, onBookClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-[68vh] w-full flex flex-col items-center justify-center overflow-hidden px-4 pt-8 pb-6">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1503951458645-643d53bfd90f?auto=format&fit=crop&w=1400&q=80"
          alt="Barber shop"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-[#fffdf9]" />
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 rounded-full bg-white/90 border border-orange-100/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-widest text-orange-700 uppercase">Open Today 9:00 - 18:00</span>
          </div>

          <h1 className="font-sans font-extrabold tracking-tight text-[2.75rem] text-white leading-[1.1] mb-5 drop-shadow-md">
            Signature salon
            <br />
            <span className="text-amber-200">for modern style.</span>
          </h1>
          <p className="font-sans text-orange-50 text-base leading-relaxed max-w-xs mx-auto drop-shadow-sm">
            Discover personalized cuts, color, and grooming with live queue visibility.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBookClick}
          className="w-full relative group overflow-hidden bg-emerald-600 text-white font-sans text-[15px] font-medium py-4 px-6 rounded-xl shadow-sm hover:shadow-emerald-500/30 transition-all"
        >
          <span className="relative z-10 font-semibold tracking-wide">{isLoggedIn ? 'Go to Booking' : 'Login to Continue'}</span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </div>
    </section>
  )
}

