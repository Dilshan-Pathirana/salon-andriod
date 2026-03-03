import React from 'react'
import { Menu } from 'lucide-react'
import { motion } from 'framer-motion'

interface TopBarProps {
  title: string
  onMenuClick: () => void
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 h-16 border-b border-white/10 bg-black/30 backdrop-blur-xl grid grid-cols-[44px_1fr_44px] items-center px-3">
      <button
        onClick={onMenuClick}
        className="h-10 w-10 flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-emerald-200" />
      </button>

      <h1 className="font-playfair text-base text-white font-semibold tracking-wide text-center truncate px-2">
        {title}
      </h1>

      <div />
    </div>
  )
}
