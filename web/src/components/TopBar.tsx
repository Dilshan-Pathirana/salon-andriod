import React from 'react'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'

interface TopBarProps {
  title: string
  onMenuClick: () => void
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 h-16 bg-luxury-black/95 backdrop-blur-md border-b border-luxury-brown/40 grid grid-cols-[44px_1fr_44px] items-center px-3">
      <button
        onClick={onMenuClick}
        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-luxury-green/70 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-luxury-champagne" />
      </button>

      <h1 className="font-playfair text-base text-luxury-white font-semibold tracking-wide text-center truncate px-2">
        {title}
      </h1>

      <div />
    </div>
  )
}
