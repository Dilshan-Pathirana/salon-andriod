import React from 'react'
import { motion } from 'framer-motion'
import { HeroSection } from '../components/HeroSection'
import { TestimonialCard } from '../components/TestimonialCard'
interface HomePageProps {
  onBookClick: () => void
}
export function HomePage({ onBookClick }: HomePageProps) {
  const testimonials = [
    {
      quote:
        'An absolute masterclass in grooming. The attention to detail is unmatched.',
      name: 'James W.',
    },
    {
      quote: "The only place I trust. It's more than a haircut, it's a ritual.",
      name: 'Michael T.',
    },
    {
      quote: 'Refined, quiet, and perfect every single time.',
      name: 'Alexander R.',
    },
  ]
  const Divider = () => (
    <div className="flex justify-center my-16">
      <div className="w-16 h-[1px] bg-teal-100" />
    </div>
  )
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
        y: -20,
      }}
      transition={{
        duration: 0.5,
      }}
      className="pb-6"
    >
      <HeroSection onBookClick={onBookClick} />

      <Divider />

      <section className="px-4 py-6 mb-8">
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
          className="font-sans font-semibold tracking-tight text-2xl text-slate-800 mb-6 text-center"
        >
          What Our Clients Say
        </motion.h2>
        <div className="space-y-4">
          {testimonials.map((test, idx) => (
            <TestimonialCard key={idx} {...test} delay={idx * 0.2} />
          ))}
        </div>
      </section>
    </motion.div>
  )
}

