import React from 'react'
import { motion } from 'framer-motion'
import { HeroSection } from '../components/HeroSection'
import { pageMotionProps } from '../lib/motion'

interface HomePageProps {
  isLoggedIn: boolean
  onBookClick: () => void
}

const serviceSpotlight = [
  {
    name: 'Elite Hair Cut',
    desc: 'Custom styling & wash included.',
    price: 'Rs. 1,500',
    img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80',
    rating: '4.9',
  },
  {
    name: 'Color Glow',
    desc: 'Premium ammonia-free coloring.',
    price: 'Rs. 4,200',
    img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
    rating: '4.8',
  },
  {
    name: 'Silk Facial',
    desc: 'Deep cleansing & hydration therapy.',
    price: 'Rs. 2,800',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
    rating: '5.0',
  },
]

const testimonials = [
  {
    text: '"The sensory experience here is unmatched. It\'s not just a haircut — it\'s a reset for my soul."',
    author: 'Sarah Jenkins',
    role: 'Fashion Editor',
  },
  {
    text: '"Lumina transformed my look completely. The stylists are true artists who listen to your needs."',
    author: 'David Chen',
    role: 'Architect',
  },
]

export function HomePage({ isLoggedIn, onBookClick }: HomePageProps) {
  return (
    <motion.div {...pageMotionProps} className="pb-28">
      {/* Hero */}
      <HeroSection isLoggedIn={isLoggedIn} onBookClick={onBookClick} />

      {/* Quick Stats — overlapping hero */}
      <section className="px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '500+', label: 'Happy Clients' },
            { value: '50+', label: 'Services', accent: true },
            { value: 'Expert', label: 'Team' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-surface-container-lowest p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,108,73,0.05)] flex flex-col items-center text-center ${stat.accent ? 'border-t-4 border-tertiary-container' : ''}`}
            >
              <span className="text-primary font-headline font-bold text-xl">{stat.value}</span>
              <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-wider mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Service Spotlight */}
      <section className="mt-16 px-6">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
            Service<br />Spotlight
          </h2>
          <button
            onClick={onBookClick}
            className="text-primary font-label font-bold text-sm uppercase tracking-widest pb-1"
          >
            View All
          </button>
        </div>

        <div className="space-y-6">
          {serviceSpotlight.map((service, idx) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-surface-container-low rounded-3xl overflow-hidden flex flex-col shadow-sm"
            >
              <div className="relative h-48">
                <img
                  src={service.img}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff7e2d"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z"/></svg>
                  <span className="text-xs font-bold text-on-surface">{service.rating}</span>
                </div>
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-headline text-xl font-bold text-emerald-900">{service.name}</h3>
                  <p className="text-on-surface-variant text-sm mt-1">{service.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-primary font-headline font-bold text-lg">{service.price}</span>
                  <button
                    onClick={onBookClick}
                    className="bg-primary-container/15 text-primary px-4 py-2 rounded-full font-label font-bold text-sm active:scale-95 transition-all"
                  >
                    Select
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mt-20 overflow-hidden bg-emerald-50/30 py-12">
        <h2 className="px-6 font-headline text-3xl font-bold tracking-tight text-on-surface mb-8">
          Client<br />Whispers
        </h2>
        <div className="flex overflow-x-auto no-scrollbar gap-6 px-6 pb-4 snap-x snap-mandatory">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="min-w-[300px] snap-center bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,108,73,0.03)] border border-emerald-50"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#ff7e2d"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z"/></svg>
                ))}
              </div>
              <p className="italic text-on-surface-variant font-body mb-6 leading-relaxed">{t.text}</p>
              <div>
                <p className="font-label font-bold text-on-surface text-sm">{t.author}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="px-6 mt-10">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBookClick}
          className="ds-btn-primary"
        >
          {isLoggedIn ? 'Continue to Booking' : 'Book Your Session'}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}

