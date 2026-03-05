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
      className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex space-x-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-blue-500 text-blue-500"
          />
        ))}
      </div>
      <p className="font-sans text-[15px] font-medium text-slate-700 leading-relaxed mb-6">
        "{quote}"
      </p>
      <span className="font-sans font-semibold text-slate-900 text-xs tracking-wider uppercase">
        {name}
      </span>
    </motion.div>
  )
}

