import React from 'react'
import { motion } from 'framer-motion'
interface ServiceCardProps {
  name: string
  price: number
  delay?: number
}
export function ServiceCard({ name, price, delay = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: '-50px',
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut',
      }}
      className="flex justify-between items-end py-5 border-b border-teal-100/50 group"
    >
      <span className="font-inter text-slate-800 text-base font-light tracking-wide">
        {name}
      </span>
      <span className="font-sans font-semibold tracking-tight text-emerald-500 text-lg">${price}</span>
    </motion.div>
  )
}

