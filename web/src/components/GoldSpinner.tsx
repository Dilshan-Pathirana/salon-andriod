import React from 'react'
import { motion } from 'framer-motion'
export function GoldSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="w-12 h-12 rounded-full border-2 border-teal-100 border-t-emerald-500 border-r-emerald-600"
      />
    </div>
  )
}

