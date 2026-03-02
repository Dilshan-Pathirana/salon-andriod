import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
interface TestimonialCardProps {
  quote: string
  name: string
  rating?: number
  delay?: number
}
export function TestimonialCard({
  quote,
  name,
  rating = 5,
  delay = 0,
}: TestimonialCardProps) {
  return (
    <motion.div
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
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="flex flex-col items-center text-center py-8 px-4"
    >
      <div className="flex space-x-1 mb-6">
        {[...Array(rating)].map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-emerald-600 text-emerald-600"
          />
        ))}
      </div>
      <p className="font-playfair text-lg md:text-xl text-slate-800 leading-relaxed mb-6 italic opacity-90">
        "{quote}"
      </p>
      <span className="font-inter text-slate-400 text-xs tracking-widest uppercase">
        â€” {name}
      </span>
    </motion.div>
  )
}

