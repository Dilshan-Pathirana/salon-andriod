import React from 'react'
import { motion } from 'framer-motion'

interface HeroSectionProps {
  isLoggedIn: boolean
  onBookClick: () => void
}

export function HeroSection({ isLoggedIn, onBookClick }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden flex flex-col justify-end" style={{ height: '70vh', minHeight: 480 }}>
      {/* Full-bleed background image */}
      <img
        src="https://images.unsplash.com/photo-1503951458645-643d53bfd90f?auto=format&fit=crop&w=1400&q=80"
        alt="Luxury hair salon interior"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="font-headline text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
            Book Your <br />#Perfect_Look
          </h1>
          <p className="text-white/80 font-body text-lg mt-4 max-w-[280px]">
            Experience sensory minimalism at Salon Ru Zero One.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          whileTap={{ scale: 0.96 }}
          onClick={onBookClick}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-headline font-bold text-lg shadow-[0_20px_40px_rgba(0,108,73,0.25)] active:scale-95 transition-all"
        >
          {isLoggedIn ? 'Book Now' : 'Book Now'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </motion.button>
      </div>
    </section>
  )
}

