import React from 'react'
import { motion } from 'framer-motion'
interface HeroSectionProps {
  isLoggedIn: boolean
  onBookClick: () => void
}
export function HeroSection({ isLoggedIn, onBookClick }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[68vh] w-full flex-col items-center justify-center overflow-hidden px-4 pt-8 pb-6">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1503951458645-643d53bfd90f?auto=format&fit=crop&w=1400&q=80"
          alt="Barber shop"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-[#f8f9fa]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-col items-center px-2 text-center">
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
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-emerald-100/80 bg-white/90 px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="v2-label text-emerald-800">Open Today 9:00 - 18:00</span>
          </div>

          <h1 className="v2-title mb-5 text-[2.75rem] leading-[1.1] text-white drop-shadow-md">
            Signature salon
            <br />
            <span className="text-amber-200">for modern style.</span>
          </h1>
          <p className="mx-auto max-w-xs text-base leading-relaxed text-orange-50 drop-shadow-sm">
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
          className="group relative w-full overflow-hidden rounded-2xl bg-[#006c49] px-6 py-4 text-[15px] font-bold text-white shadow-[0_20px_40px_rgba(0,108,73,0.2)] transition-all hover:shadow-emerald-500/30"
        >
          <span className="relative z-10 uppercase tracking-[0.14em]">{isLoggedIn ? 'Go to Booking' : 'Login to Continue'}</span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#006c49] to-[#10b981] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </motion.button>
      </div>
    </section>
  )
}

