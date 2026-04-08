import React from 'react'
import { motion } from 'framer-motion'
import { HeroSection } from '../components/HeroSection'
import { Brush, Clock3, Sparkles } from 'lucide-react'
import { pageMotionProps } from '../lib/motion'
interface HomePageProps {
  isLoggedIn: boolean
  onBookClick: () => void
}
export function HomePage({ isLoggedIn, onBookClick }: HomePageProps) {
  const highlights = [
    {
      icon: Sparkles,
      title: 'Premium Styling',
      description: 'Editorial-grade styling and finish using premium salon products.',
    },
    {
      icon: Clock3,
      title: 'On-Time Sessions',
      description: 'Real-time queue and appointment slots built for zero waiting chaos.',
    },
    {
      icon: Brush,
      title: 'Modern Techniques',
      description: 'Contemporary cuts, color blending, and beard detailing with precision.',
    },
  ]

  return (
    <motion.div {...pageMotionProps} className="pb-6">
      <HeroSection isLoggedIn={isLoggedIn} onBookClick={onBookClick} />

      <section className="space-y-4 px-4 py-3">
        <h2 className="v2-title text-center text-xl font-bold">Why Clients Choose Us</h2>
        <div className="grid grid-cols-1 gap-3">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="v2-card p-4"
            >
              <div className="mb-2 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-slate-800">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-8 px-4 py-5">
        <h2 className="v2-title mb-3 text-center text-xl font-bold">Barber Shop Showcase</h2>
        <div className="grid grid-cols-2 gap-3">
          <img className="h-32 w-full rounded-2xl object-cover" src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80" alt="Barber cutting hair" />
          <img className="h-32 w-full rounded-2xl object-cover" src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80" alt="Barber shop tools" />
          <img className="h-32 w-full rounded-2xl object-cover" src="https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=900&q=80" alt="Barber beard grooming" />
          <img className="h-32 w-full rounded-2xl object-cover" src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80" alt="Barber shop interior" />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -1 }}
          onClick={onBookClick}
          className="v2-btn-primary mt-4"
        >
          {isLoggedIn ? 'Continue to Booking' : 'Login to Continue'}
        </motion.button>
      </section>
    </motion.div>
  )
}

